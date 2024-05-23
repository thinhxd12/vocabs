import { action, redirect } from "@solidjs/router";
import { CurrentlyWeatherType, ExampleType, FixMinutelyTWeatherType, HistoryType, ImageType, MinutelyWeatherType, ScheduleType, TranslateType, VocabularyDefinitionType, VocabularyTranslationType, VocabularyType, } from "~/types";
import { DEFAULT_CORS_PROXY, PRECIPITATION_PROBABILITY, WMOCODE, getElAttribute, getElText, mapTables } from "~/utils";
import { PostgrestError } from "@supabase/supabase-js";
import { format } from "date-fns";
import { createSignal } from "solid-js";
import { createClient } from '@supabase/supabase-js'
import { parse } from 'node-html-parser';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const searchText = async (text: string) => {
    "use server";
    try {
        const { data, error } = await supabase
            .from(mapTables.vocabulary)
            .select()
            .like("word", `${text}%`);
        return data as VocabularyType[];
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

export const getCalendarScheduleData = action(async () => {
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
    const { data, error } = await supabase.from(mapTables.schedule).select();

    if (data) {
        const scheduleData = data?.map((item, index) => {
            const day = new Date(item.date);
            return { ...item, date: day.getDate(), month: day.getMonth() };
        });

        const mergedArray = monthDateArr.map(item => {
            return {
                ...item,
                ...scheduleData.find((item2) => item2.date === item.date && item2.month === item.month) // find the item from the second array with the same id
            };
        });
        const calendarScheduleArr = chunk(mergedArray, 7);
        return calendarScheduleArr;
    }
}, "calendar-schedule");

//get start index of schedule
export const getThisWeekData = action(async () => {
    "use server";
    const { data, error } = await supabase.from(mapTables.schedule)
        .select()
        .order('date');
    if (error) throw error;
    if (data) return data[0].index1;
});

//get today data
export const getCalendarTodayData = async (date: string) => {
    "use server";
    const { data, error } = await supabase
        .from(mapTables.schedule)
        .select()
        .eq('date', date);
    if (data) return data[0] as ScheduleType;
};

//get all history
export const getCalendarHistoryData = action(async () => {
    "use server";
    try {
        const { data, error } = await supabase.from(mapTables.history).select().order('created_at');
        return data as HistoryType[];
    } catch (error) {
        console.error(error);
    }
});

//insert all data table history
export const uploadObjToSupabase = action(async (objs: Object[]) => {
    "use server";
    for (let obj of objs) {
        let { error } = await supabase.from(mapTables.history).insert([obj]);
        console.log(error);
    }
});

//get image link
export const getDataImage = action(async (url: string) => {
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
        const nextImgUrl = getElAttribute(
            doc,
            `.also__item:nth-child(${Math.floor(Math.random() * 15) + 1}) a`,
            "href"
        );
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
export const getTranslate = async (text: string) => {
    const url = `https://myapp-9r5h.onrender.com/trans?text=${text}&from=auto&to=vi`
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as TranslateType;
    } catch (error) {
        console.error(error);
    }
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

export const getTextDataWebster = async (text: string) => {
    "use server";
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
};

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
                const parts = dtText.split(" : ");
                definitionItem.definitions[0].definition.push({
                    sense: letter !== "" ? letter + " " + parts[0] : "&emsp;" + parts[0],
                    similar: parts[1]
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
    const oxfordUrl =
        DEFAULT_CORS_PROXY +
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
    const translationsT = getTranslation(meaningT);

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
    return { message: "success" } as PostgrestError
});

const getTranslation = (str: string) => {
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
    const translationsT = getTranslation(meaningT);

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
    return { message: "success" } as PostgrestError
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
    throw redirect("/main/vocabulary");
}, "todayReset");

//edit today schedule
export const submitTodayProgress = action(async (type: number, numb: number) => {
    "use server";
    const updateObj = type === 1 ? { time1: numb } : { time2: numb }
    const { error } = await supabase
        .from(mapTables.schedule)
        .update(updateObj)
        .eq('date', format(new Date().toISOString(), "yyyy-MM-dd"));
    if (error) console.error(error);
}, "todaySubmitProgress");

export const submitNewHistory = action(async (formData: FormData) => {
    "use server";
    const indexWeek = Number(formData.get("indexWeek"));
    const fromDate = String(formData.get("fromDate"));
    const toDate = String(formData.get("toDate"));
    const monthId = String(formData.get("monthId"));

    let key = indexWeek % 1000 === 1 ? "week1" : "week" + ((indexWeek % 1000 - 1) / 200 + 1);
    const { error } = await supabase
        .from(mapTables.history)
        .update({
            [key]: {
                index: indexWeek, from_date: fromDate, to_date: toDate
            }
        })
        .eq('created_at', monthId);
    if (error) return { message: error.message };
    throw redirect("/main/vocabulary");
}, "submitNewHistoryMonth");

export const submitNewWeek = action(async (formData: FormData) => {
    "use server";
    const startDay = String(formData.get("startDay"));
    const startIndex = Number(formData.get("startIndex"));
    const { error } = await supabase
        .from(mapTables.schedule)
        .delete()
        .gte('time1', 0)
    for (let i = 0; i < 6; i++) {
        let { error } = await supabase
            .from(mapTables.schedule)
            .insert([{
                date: format((new Date(new Date(startDay).getTime() + i * 86400000)).toISOString(), "yyyy-MM-dd"),
                index1: i % 2 == 0 ? startIndex : startIndex + 50,
                index2: i % 2 == 0 ? startIndex + 100 : startIndex + 150,
                time1: 0,
                time2: 0,
            }]);
        if (error) console.log(error);
    }
    throw redirect("/main/vocabulary");
}, "startNewWeek");

export const submitNewMonth = action(async (formData: FormData) => {
    "use server";
    const startMonthIndex = Number(formData.get("startMonthIndex"));
    const insertData = {
        week1: { index: startMonthIndex, from_date: "", to_date: "" },
        week2: { index: startMonthIndex + 200, from_date: "", to_date: "" },
        week3: { index: startMonthIndex + 400, from_date: "", to_date: "" },
        week4: { index: startMonthIndex + 600, from_date: "", to_date: "" },
        week5: { index: startMonthIndex + 800, from_date: "", to_date: "" },
    }
    let { error } = await supabase
        .from(mapTables.history)
        .insert([insertData])
    if (error) console.error(error);
    throw redirect("/main/vocabulary");
}, "startMonth");

//handle check vocabulary
export const checkVocabulary = async (numb: number, time: string) => {
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
        const sortedArr = data.sort((a, b) => a.number - b.number);
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

export const deleteSmallestWordNumberFromRange = async (time: string) => {
    "use server";
    const { error } = await supabase
        .from(mapTables.vocabulary)
        .delete()
        .eq('created_at', time);
}
//archiver ------------------------------------ end

//get 50 word
export const getVocabularyFromRange = action(async (start: number, end: number) => {
    "use server";
    const { data, error } = await supabase
        .from(mapTables.vocabulary)
        .select()
        .order('created_at')
        .range(start, end)
    if (data) return data as VocabularyType[];
}, "getVocabularyFromRange");

//get memories length
export const getMemoriesLength = action(async () => {
    "use server";
    const { count } = await supabase
        .from(mapTables.memories)
        .select('*', { count: "exact" });
    return count as number;
}, "getMemoriesLength");


//get weather data

// export const getWeatherDataOld = async (geo: string) => {
//     "use server";
//     const WEATHER_KEY = "gnunh5vxMIu0kLZG";
//     // const time = Math.round(Date.now() / 1000);
//     const url = `https://api.pirateweather.net/forecast/${WEATHER_KEY}/${geo}?units=ca&version=2`
//     try {
//         const response = await fetch(url);
//         const data = await response.json();
//         const dayTime = data.daily.data[0].dawnTime < data.currently.time && data.currently.time < data.daily.data[0].duskTime;
//         const currentData = cleanDataCurrently(data.currently, data.offset, dayTime);
//         const minuteData = cleanDataMinutely(data.minutely.data);
//         const predict = makePrediction(minuteData, data.minutely.summary);
//         return { currentData: currentData, minuteData: minuteData, prediction: predict } as WeatherDataType;
//     } catch (error) {
//         console.error(error);
//     }
// };

// const cleanDataCurrentlyOld = (data: CurrentlyType, offset: number, dayTime: boolean) => {

//     const time = new Date(data.time * 1000);
//     time.setHours(time.getHours() + offset);
//     const timeText = format(time, "h:mm a");
//     let result: FixCurrentlyType = {
//         timeText: timeText,
//         icon: "",
//         summary: "",
//         humidity: Math.round(data.humidity * 100),
//         temperature: data.temperature,
//         apparentTemperature: data.apparentTemperature,
//         uvIndex: data.uvIndex,
//         windSpeed: data.windSpeed,
//         windBearing: data.windBearing,
//         isDayTime: dayTime,
//     }
//     //68% occurent = DEVIATION_NUMB * standard deviation occur
//     const newPrecipIntensity = (
//         data.precipIntensity -
//         DEVIATION_NUMB * data.precipIntensityError
//     ) || 0;

//     switch (true) {
//         case data.cloudCover <= 1 / 8:
//             result.icon = "0" + (dayTime ? 'd' : 'n');
//             result.summary = "Clear";
//             break;
//         case data.cloudCover <= 3 / 8:
//             result.icon = "1" + (dayTime ? 'd' : 'n');
//             result.summary = "Mostly clear";
//             break;
//         case data.cloudCover <= 7 / 8:
//             result.icon = "2" + (dayTime ? 'd' : 'n');
//             result.summary = "Partly cloudy";
//             break;
//         case data.cloudCover <= 1:
//             result.icon = "3" + (dayTime ? 'd' : 'n');
//             result.summary = "Mostly cloudy";
//             break;
//         case data.cloudCover === 1:
//             result.icon = "4" + (dayTime ? 'd' : 'n');
//             result.summary = "Overcast";
//             break;
//         default:
//             break;
//     }

//     if (data.precipType === 'rain') {
//         switch (true) {
//             case data.nearestStormBearing > 0 && data.nearestStormDistance <= 8:
//                 result.icon = "95" + (dayTime ? 'd' : 'n');
//                 result.summary = "Thunderstorm";
//                 break;
//             case newPrecipIntensity >= 0.1 &&
//                 newPrecipIntensity < 0.5 &&
//                 data.precipProbability >= PRECIPITATION_PROBABILITY:
//                 result.icon = "61" + (dayTime ? 'd' : 'n');
//                 result.summary = "Light rain";
//                 break;
//             case newPrecipIntensity >= 0.6 &&
//                 newPrecipIntensity < 1 &&
//                 data.precipProbability >= PRECIPITATION_PROBABILITY:
//                 result.icon = "63" + (dayTime ? 'd' : 'n');
//                 result.summary = "Moderate rain";
//                 break;
//             case newPrecipIntensity >= 1 &&
//                 data.precipProbability >= PRECIPITATION_PROBABILITY:
//                 result.icon = "65" + (dayTime ? 'd' : 'n');
//                 result.summary = "Heavy rain";
//                 break;
//         }
//     }
//     else if (data.precipType === 'snow') {
//         switch (true) {
//             case data.visibility >= 1 &&
//                 data.precipProbability >= PRECIPITATION_PROBABILITY:
//                 result.icon = "71" + (dayTime ? 'd' : 'n');
//                 result.summary = "Light snow";
//                 break;
//             case data.visibility >= 0.5 &&
//                 data.visibility < 1 &&
//                 data.precipProbability >= PRECIPITATION_PROBABILITY:
//                 result.icon = "73" + (dayTime ? 'd' : 'n');
//                 result.summary = "Moderate snow";
//                 break;
//             case newPrecipIntensity < 0.5 &&
//                 data.precipProbability >= PRECIPITATION_PROBABILITY:
//                 result.icon = "75" + (dayTime ? 'd' : 'n');
//                 result.summary = "Heavy snow";
//                 break;
//         }
//     }
//     else if (data.precipType === 'sleet') {
//         if (data.precipProbability >= PRECIPITATION_PROBABILITY) {
//             result.icon = "66" + (dayTime ? 'd' : 'n');
//             result.summary = "Sleet";
//         }
//     }
//     return result;
// };

// export const getWeatherData = async (geo: string) => {
//     "use server";
//     const WEATHER_KEY = "gnunh5vxMIu0kLZG";
//     const geos = geo.split(",");
//     const urlMeteo = `https://api.open-meteo.com/v1/forecast?latitude=${geos[0]}&longitude=${geos[1]}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&forecast_minutely_15=1&models=best_match`;
//     const urlPirate = `https://api.pirateweather.net/forecast/${WEATHER_KEY}/${geo}?exclude=currently,daily,hourly?units=ca&version=2`

//     let dataMeteo = fetchGetJSON(urlMeteo);
//     let dataPirate = fetchGetJSON(urlPirate);
//     let data = await Promise.all([dataMeteo, dataPirate]);
//     const offsetTime = data[1].offset;
//     const minuteData = cleanDataMinutely(data[1].minutely.data);
//     const currentlyData = cleanDataCurrently(data[0], offsetTime);

//     return { currentData: currentlyData, minuteData: minuteData, prediction: makePrediction(minuteData) } as WeatherDataType;
// };

const fetchGetJSON = async (url: string) => {
    try {
        let response = await fetch(url);
        let res = await response.json();
        return res;
    } catch (error) {
        return "";
    }
}

export const getCurrentWeatherData = async (geostr: string) => {
    const geos = geostr.split(",");
    const URL = `https://api.open-meteo.com/v1/forecast?latitude=${geos[0]}&longitude=${geos[1]}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&forecast_minutely_15=1&timezone=auto&models=best_match`;
    const data = await fetchGetJSON(URL);
    return cleanDataCurrently(data);
}

const cleanDataCurrently = (data: any) => {
    return {
        time: data.current.time,
        icon: data.current.is_day ? "/images/openmeteo/icons/day/" + WMOCODE[data.current.weather_code as keyof typeof WMOCODE].day.image : "/images/openmeteo/icons/night/" + WMOCODE[data.current.weather_code as keyof typeof WMOCODE].night.image,
        summary: data.current.is_day ? WMOCODE[data.current.weather_code as keyof typeof WMOCODE].day.description : WMOCODE[data.current.weather_code as keyof typeof WMOCODE].night.description,
        humidity: Math.round(data.current.relative_humidity_2m),
        temperature: data.current.temperature_2m,
        apparentTemperature: data.current.apparent_temperature,
        windSpeed: data.current.wind_speed_10m,
        windBearing: data.current.wind_direction_10m,
        isDayTime: data.current.is_day,
    } as CurrentlyWeatherType;
}

const [minutelyData, setMinutelyData] = createSignal<FixMinutelyTWeatherType[]>([]);

export const getMinutelyWeatherData = async (geostr: string) => {
    const WEATHER_KEY = import.meta.env.VITE_PIRATE_KEY;
    const URL = `https://api.pirateweather.net/forecast/${WEATHER_KEY}/${geostr}?&units=ca?exclude=currently,daily,hourly`
    const data = await fetchGetJSON(URL);
    const zerotime = data.minutely.data[0].time;
    const result = data.minutely.data.map((item: MinutelyWeatherType) => {
        return {
            diffTime: (item.time - zerotime) / 60,
            intensity: parseFloat(item.precipIntensity.toFixed(3)),
            probability: item.precipProbability
        }
    })
    setMinutelyData(result);
    return result as FixMinutelyTWeatherType[];
}

export const makePrediction = (): string => {
    let data = minutelyData();
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

    function createText() {
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
    }
    return createText();
};

// =====Insert data============
// export const insertData = async () => {
//     "use server";
//     for (let i = 0; i < dataUp.length; i++) {
//         const row = dataUp[i]
//         const { error } = await supabase
//             .from(mapTables.memories)
//             .insert([row])

//         if (error) console.log('Error:', error)
//         else console.log(`Row ${i} inserted`)
//     }
//     // const { data, error } = await supabase
//     //     .from(mapTables.memories)
//     //     .select()
//     // return data;
// }