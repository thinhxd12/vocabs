import { action, cache } from "@solidjs/router";
import { BookmarkType, CalendarType, CurrentlyWeatherType, ExampleType, FixMinutelyTWeatherType, HistoryItemContentType, HistoryType, HourlyWeatherType, ImageType, MinutelyWeatherType, ScheduleType, TranslateType, VocabularyDefinitionType, VocabularySearchType, VocabularyTranslationType, VocabularyType, WeatherGeoType, } from "~/types";
import { PRECIPITATION_PROBABILITY, WMOCODE, getElAttribute, getElText, mapTables } from "~/utils";
import { format, parse as parseTime } from "date-fns";
import { parse } from 'node-html-parser';
import { supabase } from "./supbabase";
import { mainStore, setListStore, setMainStore } from "./mystore";
import { parseKindleEntries, readKindleClipping } from "@darylserrano/kindle-clippings";
import { URLSearchParams } from "url";

export const searchText = async (text: string) => {
    "use server";
    try {
        const { data, error } = await supabase
            .from(mapTables.vocabulary)
            .select("word,created_at")
            .like("word", `${text}%`)
            .limit(6)

        return data as VocabularySearchType[];
    } catch (error) {
        console.error(error);
    }
};

export const getWordData = async (time: string) => {
    "use server";
    try {
        const { data, error } = await supabase
            .from(mapTables.vocabulary)
            .select()
            .eq("created_at", time)
        if (data) return data[0] as VocabularyType;
    } catch (error) {
        console.error(error);
    }
};

export const searchMemoriesText = async (text: string) => {
    "use server";
    try {
        const { data, error } = await supabase
            .from(mapTables.memories)
            .select()
            .textSearch("word", text)

        if (data) {
            if (data.length > 0) return { message: `Memorized "${data[0].word.toUpperCase()}"` };
        }
    } catch (error) {
        console.error(error);
    }
};

const chunk = (array: any[], size: number) =>
    array.reduce((acc, _, i) => {
        if (i % size === 0) acc.push(array.slice(i, i + size));
        return acc;
    }, []);

export const getScheduleData = (async (str: string) => {
    "use server";
    const date = new Date();
    const thisMonth = date.getMonth();
    const thisYear = date.getFullYear();
    const firstDayofMonth = new Date(thisYear, thisMonth, 1).getDay();
    const lastDateofMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
    const lastDayofMonth = new Date(
        thisYear,
        thisMonth,
        lastDateofMonth
    ).getDay();
    const lastDateofLastMonth = new Date(thisYear, thisMonth, 0).getDate();
    const monthDateArr = [];
    for (let i = firstDayofMonth; i > 0; i--) {
        monthDateArr.push({
            date: lastDateofLastMonth - i + 1,
            month: thisMonth - 1,
        });
    }
    for (let i = 1; i <= lastDateofMonth; i++) {
        monthDateArr.push({
            date: i,
            month: thisMonth,
        });
    }
    for (let i = lastDayofMonth; i < 6; i++) {
        monthDateArr.push({
            date: i - lastDayofMonth + 1,
            month: thisMonth + 1,
        });
    }
    const { data, error } = await supabase.from(mapTables.schedule).select().order('date');


    if (data) {
        let index = data.findIndex(item => item.date === str);
        let newData = data;
        if (index >= 0) {
            let startIndex = Math.floor(index / 6) * 6;
            newData = data.map((n, i) => {
                if (i >= startIndex && i < startIndex + 6) {
                    return n
                }
                return {
                    ...n, time1: -1, time2: -1
                }
            })
        }

        const scheduleData = newData.map((item: any, index: number) => {
            const day = new Date(item.date);
            return { ...item, date: day.getDate(), month: day.getMonth() };
        });

        const mergedArray = monthDateArr.map(item => {
            return {
                ...item,
                ...scheduleData.find((item2: any) => item2.date === item.date && item2.month === item.month)
            };
        });
        const calendarScheduleArr = chunk(mergedArray, 7);
        return calendarScheduleArr as Array<CalendarType[]>;
    }
});


//get image link
export const getDataImage = (async (url: string) => {
    "use server";
    try {
        const response = await fetch(url);
        if (response.status !== 200) {
            return undefined;
        }
        const pageImgHtml = await response.text();
        const doc = parse(pageImgHtml);
        const imgSrcGet = getElAttribute(doc, ".main-image>img", "srcset");
        const imgDateGet = getElText(doc, ".main-description__share-date", "");
        const imgTitleGet = getElText(doc, ".main-description__title", "");
        const imgAttGet = getElText(doc, ".main-description__attr", "");
        const imgAuthorImg = getElAttribute(doc, ".main-description__author img", "srcset");
        const imgAuthorName = getElText(doc, ".main-description__author", "");
        const imgAuthorYear = getElText(doc, ".main-description__author-years", "");
        const textDesc = doc.querySelectorAll(".main-description__text-content p");
        const imgDesc =
            textDesc.length > 0
                ? [...textDesc]
                    .map((item, index) => {
                        const text =
                            item?.textContent &&
                            item.textContent.replace(/[\n\r]+|\s{2,}/g, " ").trim();
                        return `<p>${text}</p>`;
                    })
                    .join("")
                : `<p>${getElText(doc, ".main-description__text-content", "")}</p>`;
        const nextImgUrl = getElAttribute(doc, ".also__item a", "href");
        const regexImage = /(https?:\/\/[^\s]+iPhone\.jpg)/g;
        const regexAuthor = /(https?:\/\/[^\s]+)/g;
        const convertedImage = imgSrcGet.match(regexImage)[0] || "";
        const convertedAuthorImg = imgAuthorImg.match(regexAuthor)[0] || "";

        return {
            image: convertedImage,
            date: imgDateGet,
            title: imgTitleGet,
            attr: imgAttGet,
            authorImg: convertedAuthorImg,
            authorName: imgAuthorName,
            authorYear: imgAuthorYear,
            content: imgDesc,
            nextImageUrl: nextImgUrl
        } as ImageType;
    } catch (error) {
        console.error(error);
    }
});

//get translate data
export const getTranslateData = async (text: string) => {
    "use server";
    if (!text) return;
    const url = `https://vocabs3.vercel.app/trans?text=${text}&from=auto&to=vi`
    const response = await fetch(url);
    const data = await response.json();
    if (data) return data as TranslateType;
}

async function fetchGetText(url: string) {
    try {
        let response = await fetch(url);
        let text = await response.text();
        return text;
    } catch (error) {
        return "";
    }
}

export const getTextDataWebster = cache(async (text: string) => {
    "use server";
    if (!text) return;
    const url = `https://www.merriam-webster.com/dictionary/${text}`;

    const result: VocabularyType = {
        word: "",
        audio: "",
        phonetics: "",
        number: 240,
        translations: [],
        definitions: [],
        created_at: ""
    };

    const newText = text.length > 4 ? text.slice(0, -2) : text;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");

    try {
        const data = await fetchGetText(url);
        const doc = parse(data);
        result.word = getElText(doc, "h1.hword", text);
        result.phonetics = getElText(doc, ".prons-entries-list-inline a", "");

        const firstHead = getElText(doc, ".entry-header-content .parts-of-speech", "");
        firstHead.split(" ").shift();

        //find examples
        let examplesArray = [] as { partOfSpeech: string; example: ExampleType[] }[];
        const examplesContent = doc.querySelector(".on-web-container");
        if (examplesContent) {
            const header = getElText(examplesContent, ".function-label-header", "");
            if (header) {
                examplesContent.querySelectorAll(".function-label-header").forEach((element, index) => {
                    let resultItem = {
                        partOfSpeech: element.textContent.toLowerCase().split(" ").shift() || "",
                        example: [] as ExampleType[],
                    };
                    const example = element.nextElementSibling;
                    let exampleItem = {
                        sentence: "",
                        author: "",
                        title: "",
                        year: "",
                    } as ExampleType;
                    let quote = getElText(example, ".t", "");
                    if (quote !== "") {
                        quote = quote.replace(regText, `<b>$1</b>`);
                    }
                    exampleItem.sentence = quote !== "" ? quote : "";
                    let cred = getElText(example, ".auth", "").replace("—", "").split(", ");
                    exampleItem.author = cred[cred.length - 3]
                        ? cred[cred.length - 3]
                        : "";
                    exampleItem.title = cred[cred.length - 2]
                        ? cred[cred.length - 2]
                        : "";
                    exampleItem.year = cred[cred.length - 1]
                        ? cred[cred.length - 1]
                        : "";
                    resultItem.example.push(exampleItem);
                    examplesArray.push(resultItem);
                })
            }
            else {
                let resultItem = {
                    partOfSpeech: "",
                    example: [] as ExampleType[],
                };
                resultItem.partOfSpeech = firstHead;

                const example = examplesContent.querySelector(".sub-content-thread");
                let exampleItem = {
                    sentence: "",
                    author: "",
                    title: "",
                    year: "",
                } as ExampleType;
                let quote = getElText(example, ".t", "");
                if (quote !== "") {
                    quote = quote.replace(regText, `<b>$1</b>`);
                }
                exampleItem.sentence = quote !== "" ? quote : "";
                let cred = getElText(example, ".auth", "").replace("—", "").split(", ");
                exampleItem.author = cred[cred.length - 3]
                    ? cred[cred.length - 3]
                    : "";
                exampleItem.title = cred[cred.length - 2]
                    ? cred[cred.length - 2]
                    : "";
                exampleItem.year = cred[cred.length - 1]
                    ? cred[cred.length - 1]
                    : "";
                resultItem.example.push(exampleItem);
                examplesArray.push(resultItem);
            }
        }

        //find synonyms
        let synonymsArray = [] as { partOfSpeech: string; synonyms: string }[];
        const synonymsContent = doc.querySelector("#synonyms");
        if (synonymsContent) {
            const header = getElText(synonymsContent, ".function-label", "");
            if (header) {
                synonymsContent.querySelectorAll(".function-label").forEach((element, index) => {
                    let resultItem = {
                        partOfSpeech: element.textContent.toLowerCase().split(" ").shift() || "",
                        synonyms: "",
                    }
                    const synItem = synonymsContent.querySelectorAll("ul")[index];
                    let listItems = synItem.querySelectorAll("li");
                    for (let i = 0; i < 3; i++) {
                        if (listItems[i]) {
                            resultItem.synonyms +=
                                i < 2
                                    ? listItems[i].textContent + ", "
                                    : listItems[i].textContent;
                        }
                    }
                    synonymsArray.push(resultItem);
                });
            }
            else {
                let resultItem = {
                    partOfSpeech: "",
                    synonyms: "",
                }
                resultItem.partOfSpeech = firstHead;
                const listItems = synonymsContent.querySelectorAll("ul li");
                for (let i = 0; i < 3; i++) {
                    if (listItems[i]) {
                        resultItem.synonyms +=
                            i < 2
                                ? listItems[i].textContent + ", "
                                : listItems[i].textContent;
                    }
                }
                synonymsArray.push(resultItem);
            }
        }

        result.definitions = handleGetDefinitions(data).map((item: any) => {
            return {
                partOfSpeech: item.partOfSpeech,
                definitions: item.definitions,
                synonyms: synonymsArray.find(ele => ele.partOfSpeech === item.partOfSpeech)?.synonyms || "",
                example: examplesArray.find(ele => ele.partOfSpeech === item.partOfSpeech)?.example || []
            } as VocabularyDefinitionType
        });

        return result;
    } catch (error) {
        console.error(error);
    }
}, "webster");

const handleGetDefinitions = (data: string) => {
    const doc = parse(data);
    const result = [] as any;
    let resultFinal = [] as any;

    const entryHeader = doc.querySelectorAll(".entry-word-section-container");
    entryHeader.forEach((item, index) => {
        let definitionItem = {
            definitions: [{
                definition: [] as { sense: string; similar: string }[],
                image: "",
            }],
            partOfSpeech: "",
        }

        const head = getElText(item, ".entry-header-content .parts-of-speech", "");
        definitionItem.partOfSpeech = head.split(" ").shift();

        //find only First Definition
        const firstItem = item.querySelector(".vg-sseq-entry-item");

        if (firstItem) {
            firstItem.querySelectorAll(".sb-entry .sense").forEach((m, n) => {
                let letter = getElText(m, ".letter", "");
                let dtText = getElText(m, ".dtText", "");
                definitionItem.definitions[0].definition.push({
                    sense: letter !== "" ? letter + " " + dtText : "&emsp;" + dtText,
                    similar: ""
                });
            });
        }
        result.push(definitionItem)
    });
    resultFinal = result.reduce((acc: any, d: any) => {
        const found = acc.find((a: any) => a.partOfSpeech === d.partOfSpeech);
        if (!found) {
            acc.push(d);
        }
        else {
            found.definitions.push(d.definitions[0])
        }
        return acc;
    }, []);
    return resultFinal;
}


//find sound from oed
export const getOedSoundURL = async (text: string) => {
    "use server";
    if (!text) return;
    const oxfordUrl =
        `https://www.oxfordlearnersdictionaries.com/search/american_english/direct/?q=${text}`;
    const oedUrl = `https://www.oed.com/search/dictionary/?scope=Entries&q=${text}&tl=true`;

    const data = await Promise.all([
        fetchGetText(oxfordUrl),
        fetchGetText(oedUrl),
    ]);
    const docOxf = parse(data[0]);
    const docOed = parse(data[1]);

    const oxfordResultUrl = getElAttribute(docOxf, ".audio_play_button,.pron-us", "data-src-mp3");

    if (!oxfordResultUrl) {
        const urlParam = getElAttribute(docOed, ".viewEntry", "href");
        if (urlParam) {
            const newUrl = "https://www.oed.com" + urlParam;
            const link = newUrl.replace(/\?.+/g, "?tab=factsheet&tl=true#39853451");
            const nextResponse = await fetch(link);
            const nextPageHtml = await nextResponse.text();
            const nextPageDoc = parse(nextPageHtml);
            const mp3 = nextPageDoc
                .querySelector(".regional-pronunciation:last-child")
                ?.querySelector(".pronunciation-play-button")
                ?.getAttribute("data-src-mp3");
            const altMp3 = `https://ssl.gstatic.com/dictionary/static/sounds/20220808/${text}--_us_1.mp3`;
            return mp3 || altMp3;
        }
    }
    return oxfordResultUrl;
};

//delete vocabulary
export const deleteVocabulary = async (time: string) => {
    "use server";
    const { error } = await supabase
        .from(mapTables.vocabulary)
        .delete()
        .eq('created_at', time);
}

//edit vocabulary
export const editVocabularyItem = action(async (formData: FormData) => {
    "use server";
    const wordT = String(formData.get("word"));
    const audioT = String(formData.get("audio"));
    const phoneticsT = String(formData.get("phonetics"));
    const definitionsT = JSON.parse(String(formData.get("definitions")));
    const numberT = Number(formData.get("number"));
    const createT = String(formData.get("created_at"));
    const meaningT = String(formData.get("meaning"));
    const translationsT = getTranslationArr(meaningT);

    const { error } = await supabase
        .from(mapTables.vocabulary)
        .update({
            word: wordT,
            audio: audioT,
            phonetics: phoneticsT,
            number: numberT,
            translations: translationsT,
            definitions: definitionsT,
        })
        .eq('created_at', createT);
    if (error) return { message: error.message };
    return { message: "success" }
});

export const getTranslationArr = (str: string) => {
    const breakpoint = /\s+-/g;
    let means = str.split(breakpoint).filter((item) => item);
    const matchesMean = means.map((m) => {
        if (m) {
            let newM = /(\w+)\-.+/.exec(m);
            return {
                partOfSpeech: newM ? newM[1] : "null",
                translations: newM
                    ? m
                        .replace(newM[1], "")
                        .split(/\-|\s-/)
                        .filter((item) => item)
                    : [],
            };
        }
    }) as VocabularyTranslationType[];
    return matchesMean;
};


//insert new vocabulary
export const insertVocabularyItem = action(async (formData: FormData) => {
    "use server";
    const wordT = String(formData.get("word"));
    const audioT = String(formData.get("audio"));
    const phoneticsT = String(formData.get("phonetics"));
    const definitionsT = JSON.parse(String(formData.get("definitions")));
    const meaningT = String(formData.get("meaning"));
    const translationsT = getTranslationArr(meaningT);

    if (definitionsT.length === 0 || translationsT.length === 0) return { message: "incorrect data" }
    const { error } = await supabase
        .from(mapTables.vocabulary)
        .insert({
            word: wordT,
            audio: audioT,
            phonetics: phoneticsT,
            number: 240,
            translations: translationsT,
            definitions: definitionsT,
        })
    if (error) return { message: error.message };
    return { message: "success" }
});

//get image from unsplash
export const getImageFromUnsplash = action(async () => {
    "use server";
    const apiKey = "EAEQdLT0Wze4Lhf_Xn2O-IAuow2Z-Rh2sHIEu7pTXms";
    const month = new Date().getMonth();
    let keyword = "";
    switch (month) {
        case 11: case 0: case 1:
            keyword = "winter";
            break;
        case 2:
            keyword = "spring-flowers";
            break;
        case 3: case 4:
            keyword = "spring-fields";
            break;
        case 5: case 6:
            keyword = "beach";
            break;
        case 7:
            keyword = "field";
            break;
        case 8:
            keyword = "autumn-lake";
            break;
        case 9:
            keyword = "autumn road";
            break;
        case 10:
            keyword = "autumn";
            break;
        default:
            break;
    }
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${keyword}&count=1&client_id=${apiKey}`);
    const data = await response.json();
    return data[0].urls.regular;
});

export const getUnsplashImage = async () => {
    const apiKey = "EAEQdLT0Wze4Lhf_Xn2O-IAuow2Z-Rh2sHIEu7pTXms";
    const response = await fetch(`https://api.unsplash.com/photos/random?&count=1&client_id=${apiKey}`);
    const data = await response.json();
    return data;
}

//reset today schedule
export const submitTodayReset = action(async (formData: FormData) => {
    "use server";
    const todayIndex1 = Number(formData.get("todayIndex1"));
    const todayIndex2 = Number(formData.get("todayIndex2"));
    const { error } = await supabase
        .from(mapTables.schedule)
        .update({
            time1: todayIndex1,
            time2: todayIndex2,
        })
        .eq('date', format(new Date().toISOString(), "yyyy-MM-dd"));
    if (error) return { message: error.message };
}, "todayReset");


// -------------------------------NEW------------------------------------
export const submitNewSchedule = action(async (formData: FormData) => {
    "use server";
    const startDay = String(formData.get("startDay"));
    if (!startDay) return;
    const { data: dataHistory } = await supabase.from(mapTables.history).select().order('created_at', { ascending: false });
    if (!dataHistory) return;

    let startIndex = dataHistory[0].data[0].index;
    startIndex = startIndex === 0 ? 1000 : 0;

    const { count } = await supabase
        .from(mapTables.vocabulary)
        .select('*', { count: "exact" });
    if (!count) return;

    startIndex = count >= 2000 ? startIndex : 0;

    const { error } = await supabase
        .from(mapTables.schedule)
        .delete()
        .gte('time1', 0)

    let newIndex = 0;

    if (count >= 1000) {
        for (let j = 0; j < 5; j++) {
            if (startIndex === 0)
                switch (j) {
                    case 0:
                        newIndex = startIndex;
                        break;
                    case 1:
                        newIndex = startIndex + 400;
                        break;
                    case 2:
                        newIndex = startIndex + 800;
                        break;
                    case 3:
                        newIndex = startIndex + 200;
                        break;
                    case 4:
                        newIndex = startIndex + 600;
                        break;
                    default:
                        break;
                }
            else switch (j) {
                case 0:
                    newIndex = startIndex + 400;
                    break;
                case 1:
                    newIndex = startIndex;
                    break;
                case 2:
                    newIndex = startIndex + 600;
                    break;
                case 3:
                    newIndex = startIndex + 200;
                    break;
                case 4:
                    newIndex = startIndex + 800;
                    break;
                default:
                    break;
            }

            for (let i = 0; i < 6; i++) {
                let { error } = await supabase
                    .from(mapTables.schedule)
                    .insert([{
                        date: format((new Date(new Date(startDay).getTime() + (6 * j + i) * 86400000)).toISOString(), "yyyy-MM-dd"),
                        index1: i % 2 == 0 ? newIndex : newIndex + 50,
                        index2: i % 2 == 0 ? newIndex + 100 : newIndex + 150,
                        time1: 0,
                        time2: 0,
                    }]);
            }
        }
    }
    else if (count < 1000 && count > 200) {
        for (let j = 0; j < Math.floor(count / 200); j++) {
            switch (j) {
                case 0:
                    newIndex = startIndex;
                    break;
                case 1:
                    newIndex = startIndex + 200;
                    break;
                case 2:
                    newIndex = startIndex + 400;
                    break;
                case 3:
                    newIndex = startIndex + 600;
                    break;
                case 4:
                    newIndex = startIndex + 800;
                    break;
                default:
                    break;
            }

            for (let i = 0; i < 6; i++) {
                let { error } = await supabase
                    .from(mapTables.schedule)
                    .insert([{
                        date: format((new Date(new Date(startDay).getTime() + (6 * j + i) * 86400000)).toISOString(), "yyyy-MM-dd"),
                        index1: i % 2 == 0 ? newIndex : newIndex + 50,
                        index2: i % 2 == 0 ? newIndex + 100 : newIndex + 150,
                        time1: 0,
                        time2: 0,
                    }]);
            }
        }
    }
    else {
        for (let i = 0; i < 6; i++) {
            let { error } = await supabase
                .from(mapTables.schedule)
                .insert([{
                    date: format((new Date(new Date(startDay).getTime() + i * 86400000)).toISOString(), "yyyy-MM-dd"),
                    index1: i % 2 == 0 ? newIndex : newIndex + 50,
                    index2: i % 2 == 0 ? newIndex + 100 : newIndex + 150,
                    time1: 0,
                    time2: 0,
                }]);
        }
    }

    //create new History month
    let insertData = {
        data: [
            { index: startIndex, from_date: "", to_date: "" },
            { index: startIndex + 200, from_date: "", to_date: "" },
            { index: startIndex + 400, from_date: "", to_date: "" },
            { index: startIndex + 600, from_date: "", to_date: "" },
            { index: startIndex + 800, from_date: "", to_date: "" },
        ]
    }

    if (count < 1000 && count > 200) {
        insertData = { data: insertData.data.slice(0, Math.floor(count / 200)) }
    }
    else if (count <= 200) {
        insertData = { data: insertData.data.slice(0, 1) }
    }

    let { error: errorMonth } = await supabase
        .from(mapTables.history)
        .insert([insertData])

}, "submitNewSchedule");


// handlecheck
export const handleCheckWord = async (text: VocabularySearchType) => {
    const wordData = await getWordData(text.created_at)
    if (wordData) {
        setMainStore("renderWord", wordData);

        if (wordData.number > 1) {
            checkVocabulary(wordData!.number - 1, text.created_at);
        } else {
            await archiveVocabulary(text.word);
            const data = await getSmallestWordNumberFromRange(text.word);

            if (data) {
                await deleteVocabulary(data.created_at);
                await updateArchiveWord(data, text.created_at);
                const total = await getTotalMemories();
                setMainStore("totalMemories", total);
            } else {
                deleteVocabulary(text.created_at);
                const total = await getTotalMemories();
                setMainStore("totalMemories", total);
            }
        }

    }
};

const checkVocabulary = async (numb: number, time: string) => {
    "use server";
    const { error } = await supabase
        .from(mapTables.vocabulary)
        .update({
            number: numb,
        })
        .eq('created_at', time);
}

//archiver ------------------------------------ start
export const archiveVocabulary = async (text: string) => {
    "use server";
    const { error } = await supabase
        .from(mapTables.memories)
        .insert({
            word: text
        })
    if (error) return error;
};

export const getSmallestWordNumberFromRange = async (text: string) => {
    "use server";
    const { data, error } = await supabase
        .from(mapTables.vocabulary)
        .select()
        .neq('word', text)
        .order('created_at', { ascending: true })
        .range(2000, 9999)
    if (data) {
        const sortedArr = data.sort((a: VocabularyType, b: VocabularyType) => a.number - b.number);
        return sortedArr[0];
    }
};

export const updateArchiveWord = async (data: VocabularyType, time: string) => {
    "use server";
    const { error } = await supabase
        .from(mapTables.vocabulary)
        .update({
            word: data.word,
            audio: data.audio,
            phonetics: data.phonetics,
            number: data.number,
            translations: data.translations,
            definitions: data.definitions,
        })
        .eq('created_at', time);
}

//archiver ------------------------------------ end

export const updateTodaySchedule = async (type: number, numb: number, day: string) => {
    "use server";
    const updateObj = type === 1 ? { time1: numb } : { time2: numb }
    const { error } = await supabase
        .from(mapTables.schedule)
        .update(updateObj)
        .eq('date', day);
    if (error) console.error(error);
};

//get all history
export const getCalendarHistory = (async () => {
    "use server";
    const { data, error } = await supabase.from(mapTables.history).select().order('created_at', { ascending: false });
    return data as HistoryType[];
});

//get start index of schedule
export const getThisWeekScheduleIndex = (async (day: string, history: HistoryType) => {
    "use server";
    const { data, error } = await supabase.from(mapTables.schedule)
        .select()
        .order('date');
    if (data) {
        let index = data.findIndex(item => item.date === day);
        if (index >= 0) {
            let startIndex = Math.floor(index / 6) * 6;
            let currentWeek = data.slice(startIndex, startIndex + 6) as ScheduleType[];
            const thisWeekIndex = data[startIndex].index1 as number;

            //submit history item
            const allGreater = currentWeek.every(item => item.time1 >= 9 && item.time2 >= 9);
            if (allGreater) {
                const historyIndex = history.data.findIndex(item => item.index === thisWeekIndex)
                if (historyIndex !== -1 && history.data[historyIndex].from_date === "") {
                    let updateData = history.data;
                    updateData[historyIndex] = { index: thisWeekIndex, from_date: currentWeek[0].date, to_date: currentWeek[5].date }
                    const { error } = await supabase
                        .from(mapTables.history)
                        .update({
                            data: updateData
                        })
                        .eq('created_at', history.created_at);
                }
            }
            return thisWeekIndex;
        }
        return -9;
    }
});



export const getBookMarkData = (async () => {
    "use server";
    const { data, error } = await supabase.from(mapTables.bookmarks)
        .select()
        .eq('selected', true);
    if (data) return data[0] as BookmarkType;
});

export const getNextBookMarkData = (async (cur: string) => {
    "use server";
    const { data, error } = await supabase.from(mapTables.bookmarks)
        .select()
        .gt('created_at', cur)
        .order('created_at', { ascending: true })
        .limit(1)
    if (error) return undefined;
    if (data.length > 0) {
        await selectBookMarkData(cur, false);
        await selectBookMarkData(data[0].created_at, true);
        return data[0] as BookmarkType;
    }
});

export const getPrevBookMarkData = (async (cur: string) => {
    "use server";
    const { data, error } = await supabase.from(mapTables.bookmarks)
        .select()
        .lt('created_at', cur)
        .order('created_at', { ascending: false })
        .limit(1)
    if (error) return undefined;
    if (data.length > 0) {
        await selectBookMarkData(cur, false);
        await selectBookMarkData(data[0].created_at, true);
        return data[0] as BookmarkType;
    }
});

export const checkBookMarkData = (async (id: string, val: number) => {
    "use server";
    const { error } = await supabase
        .from(mapTables.bookmarks)
        .update({
            like: val
        })
        .eq('created_at', id);
});

const selectBookMarkData = (async (id: string, val: boolean) => {
    "use server";
    const { error } = await supabase
        .from(mapTables.bookmarks)
        .update({
            selected: val
        })
        .eq('created_at', id);
});

export const insertBookmarkData = action(async (formData: FormData) => {
    "use server";
    const doc = String(formData.get("bookmarks"));
    let entries = readKindleClipping(doc);
    let parsedEntries = parseKindleEntries(entries);
    for (let i = 0; i < parsedEntries.length; i++) {
        const row = {
            authors: parsedEntries[i].authors,
            bookTile: parsedEntries[i].bookTile,
            page: parsedEntries[i].page,
            location: parsedEntries[i].location,
            dateOfCreation: parsedEntries[i].dateOfCreation,
            content: parsedEntries[i].content,
            type: parsedEntries[i].type,
        }
        const { error } = await supabase
            .from(mapTables.bookmarks)
            .insert([row])
        if (error) console.log('Error:', error)
        else console.log(`Row ${i} inserted`)
    }
}, "insert bookmark")

export const updateBookmarkData = action(async (formData: FormData) => {
    "use server";
    const id = String(formData.get("id"));
    const doc = String(formData.get("bookmarks"));
    const { error } = await supabase
        .from(mapTables.bookmarks)
        .update({
            content: doc
        })
        .eq('created_at', id);
}, "insert bookmark")

export const findBookMarkData = (async (val: string) => {
    "use server";
    const { data, error } = await supabase
        .from(mapTables.bookmarks)
        .select()
        .textSearch('content', val);

    const res = data?.map(item => {
        let newcontent = findSentence(item.content, val);
        return {
            ...item,
            content: newcontent
        }
    })

    return res;
});

function findSentence(text: string, word: string) {
    var sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
    if (sentences)
        for (var i = 0; i < sentences.length; i++) {
            if (sentences[i].includes(word)) {
                return sentences[i];
            }
        }
    return "";
}

export const getBookMarkDataItem = (async (time: string) => {
    "use server";
    const { data, error } = await supabase.from(mapTables.bookmarks)
        .select()
        .eq('created_at', time)
    if (data) return data[0];
});

export const getSpotlightImage = (async () => {
    "use server";
    let batchQuery = {} as any;
    batchQuery["pid"] = "338387";
    batchQuery["fmt"] = "json";
    batchQuery["rafb"] = "0";
    batchQuery["ua"] = "WindowsShellClient/0";
    batchQuery["cdm"] = "1";
    batchQuery["disphorzres"] = "2560";
    batchQuery["dispvertres"] = "1440";
    batchQuery["lo"] = "80217";
    batchQuery["pl"] = "en-US";
    batchQuery["lc"] = "en-US";
    batchQuery["ctry"] = "kr";
    const baseUrl =
        "https://arc.msn.com/v3/Delivery/Placement?" +
        new URLSearchParams(batchQuery).toString();
    const data = await (await fetch(baseUrl)).json();
    if (data) {
        const itemStr = data["batchrsp"]["items"][0].item;
        const itemObj = JSON.parse(itemStr)["ad"];
        const title = itemObj["title_text"]?.tx;
        const text = itemObj["hs2_title_text"]?.tx;
        const jsImageL = itemObj["image_fullscreen_001_landscape"].u;
        const jsImageP = itemObj["image_fullscreen_001_portrait"].u;

        return { title: title, text: text, urlL: jsImageL, urlP: jsImageP };
    }
});





























export const getTotalMemories = (async () => {
    "use server";
    const { count } = await supabase
        .from(mapTables.memories)
        .select('*', { count: "exact" });
    return count as number;
});

export const getTodayData = cache(async (date: string) => {
    "use server";
    const { data, error } = await supabase
        .from(mapTables.schedule)
        .select()
        .eq('date', date);
    if (data) return data[0] as ScheduleType;
}, "getTodayData");

export const updateTodayData = async (date: string) => {
    const data = await getTodayData(date);
    if (data) {
        setListStore("listToday", data);
        handleUpdateCalendarData(data);
    }
};

const handleUpdateCalendarData = async (data: ScheduleType) => {
    const day = new Date(data.date);
    const date = day.getDate();
    const month = day.getMonth();

    if (mainStore.calendarList.length > 0) {
        const newData = mainStore.calendarList.map((week) => {
            return week.map((item) => {
                return item.date === date && item.month === month
                    ? {
                        ...item,
                        time1: data.time1,
                        time2: data.time2,
                    }
                    : { ...item };
            });
        });
        setMainStore("calendarList", newData);
    }
};

//get 50 word
export const getListContent = async (start: number, end: number) => {
    "use server";
    const { data, error } = await supabase
        .from(mapTables.vocabulary)
        .select("word,created_at")
        .order('created_at')
        .range(start, end)
    if (data) return data as VocabularySearchType[];
};


//get weather data

const fetchGetJSON = async (url: string) => {
    try {
        let response = await fetch(url);
        let res = await response.json();
        return res;
    } catch (error) {
        return "";
    }
}


export const getWeatherLocations = (async () => {
    "use server";
    const { data } = await supabase
        .from(mapTables.weather)
        .select()
        .order('default', { ascending: false });
    if (data) return data as WeatherGeoType[];
});


export const getCurrentWeatherData = (async ({ lat: lat, lon: lon }: { lat: number; lon: number }) => {
    "use server";
    const params = {
        "latitude": String(lat),
        "longitude": String(lon),
        "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day", "uv_index", "weather_code", "wind_speed_10m", "wind_direction_10m"],
        "models": "best_match",
        "timezone": "auto"
    };

    const url = "https://api.open-meteo.com/v1/forecast?";
    const paramsString = new URLSearchParams(params).toString();
    const responses = await fetch(url + paramsString);
    if (responses.status !== 200) return;
    const data = await responses.json();

    const result: CurrentlyWeatherType = {
        apparentTemperature: data.current.apparent_temperature,
        isDayTime: data.current.is_day,
        humidity: data.current.relative_humidity_2m,
        temperature: data.current.temperature_2m,
        uvIndex: data.current.uv_index,
        icon: data.current.weather_code,
        windDirection: data.current.wind_direction_10m,
        windSpeed: data.current.wind_speed_10m,
    }
    return result;
})

export const getHourlyWeatherData = (async ({ lat: lat, lon: lon }: { lat: number; lon: number }) => {
    "use server";
    const params = {
        "latitude": String(lat),
        "longitude": String(lon),
        "hourly": ["temperature_2m", "precipitation_probability", "weather_code", "is_day"],
        "forecast_hours": String(24),
        "models": "best_match",
        "timezone": "auto"
    };

    const url = "https://api.open-meteo.com/v1/forecast?";
    const paramsString = new URLSearchParams(params).toString();
    const responses = await fetch(url + paramsString);
    if (responses.status !== 200) return;
    const data = await responses.json();

    const result = data.hourly.time.map((item: string, index: number) => ({
        time: item,
        temperature: data.hourly.temperature_2m[index],
        icon: data.hourly.weather_code[index],
        probability: data.hourly.precipitation_probability[index],
        isDayTime: data.hourly.is_day[index],
    })
    )
    return result as HourlyWeatherType[];
})


export const getMinutelyWeatherData = (async ({ lat: lat, lon: lon }: { lat: number; lon: number }) => {
    "use server";
    const WEATHER_KEY = import.meta.env.VITE_PIRATE_KEY;
    const URL = `https://api.pirateweather.net/forecast/${WEATHER_KEY}/${lat},${lon}?exclude=currently,daily,hourly&units=ca`
    const data = await fetchGetJSON(URL);
    const zerotime = data.minutely.data[0].time;
    const result = data.minutely.data.map((item: MinutelyWeatherType) => {
        return {
            diffTime: (item.time - zerotime) / 60,
            intensity: parseFloat(item.precipIntensity.toFixed(3)),
            probability: item.precipProbability
        }
    })
    return result as FixMinutelyTWeatherType[];
})

export const makePrediction = (async (data?: FixMinutelyTWeatherType[]) => {
    "use server";
    if (!data) return "";
    let lightRainIndex = data.findIndex(
        (item) => item.intensity >= 0.1 && item.probability >= PRECIPITATION_PROBABILITY
    );
    let medRainIndex = data.findIndex(
        (item) => item.intensity >= 0.5 && item.probability >= PRECIPITATION_PROBABILITY
    );
    let heavyRainIndex = data.findIndex(
        (item) => item.intensity >= 1 && item.probability >= PRECIPITATION_PROBABILITY
    );
    let endRainIndex = data.findLastIndex(
        (item) =>
            item.intensity >= 0.09 &&
            item.intensity < 0.1 &&
            item.probability >= PRECIPITATION_PROBABILITY
    );
    let mainItem = { type: "", start: 0, end: 0 };
    endRainIndex >= 0
        ? (mainItem.end = data[endRainIndex].diffTime)
        : (mainItem.end = -1);
    switch (true) {
        case lightRainIndex == -1:
            mainItem.type = "No rain";
            break;
        case lightRainIndex >= 0:
            mainItem.type = "Light rain";
            break;
        case medRainIndex >= 0:
            mainItem.type = "Rain";
            break;
        case heavyRainIndex >= 0:
            mainItem.type = "Heavy rain";
            break;
        default:
            break;
    }
    lightRainIndex >= 0
        ? (mainItem.start = data[lightRainIndex].diffTime)
        : (mainItem.start = -1);

    function makeText(start: number, end: number) {
        switch (true) {
            case start == 0 && end < 0:
                return `for the hour.`;
            case start > 0:
                return `starting in ${start} min.`;
            case end > 0:
                return `stopping in ${end} min.`;
            default:
                break;
        }
    }

    switch (mainItem.type) {
        case "No rain":
            return `Next hour: No rain anywhere in the area.`;
        case "Light rain":
            return `Light rain ${makeText(mainItem.start, mainItem.end)}`;
        case "Rain":
            return `Rain ${makeText(mainItem.start, mainItem.end)}`;
        case "Heavy rain":
            return `Heavy rain ${makeText(mainItem.start, mainItem.end)}`;
        default:
            return "";
    }
});


// =====Insert data============
// export const insertData = async (data: any) => {
//     "use server";
//     for (let i = 0; i < data.length; i++) {
//         const row = data[i]
//         const { error } = await supabase
//             .from("history")
//             .insert([{ data: row }])

//         if (error) console.log('Error:', error)
//         else console.log(`Row ${i} inserted`)
//     }
// }