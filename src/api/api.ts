import { action, redirect } from "@solidjs/router";
import { CurrentlyType, ExampleType, FixMinutelyType, HistoryType, ImageType, MinutelyType, ScheduleType, TranslateType, VocabularyDefinitionType, VocabularyTranslationType, VocabularyType } from "~/types";
import { supabase } from "./supabase";
import { DEFAULT_CORS_PROXY, DEVIATION_NUMB, PRECIP_NUMB, getElAttribute, getElText, mapTables } from "~/utils";
import parse from "node-html-parser";
import { PostgrestError } from "@supabase/supabase-js";
import { format } from "date-fns";

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
export const getCalendarTodayData = async () => {
    "use server";
    const { data, error } = await supabase
        .from(mapTables.schedule)
        .select()
        .eq('date', format(new Date().toISOString(), "yyyy-MM-dd"));
    if (data) return data[0] as ScheduleType;
};

//get all history
export const getCalendarHistoryData = action(async () => {
    "use server";
    try {
        const { data, error } = await supabase.from(mapTables.history).select();
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
    const url =
        DEFAULT_CORS_PROXY + `https://www.merriam-webster.com/dictionary/${text}`;
    const oxfordUrl =
        DEFAULT_CORS_PROXY +
        `https://www.oxfordlearnersdictionaries.com/search/american_english/direct/?q=${text}`;

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
        const data = await Promise.all([
            fetchGetText(url),
            fetchGetText(oxfordUrl),
        ]);
        const doc = parse(data[0]);
        const docOx = parse(data[1]);

        result.audio = getElAttribute(docOx, ".audio_play_button,.pron-us", "data-src-mp3");
        result.word = getElText(doc, "h1.hword", text);
        result.phonetics = getElText(doc, ".prons-entries-list-inline a", "");

        const exampleContent = doc.querySelector(".on-web-container");
        if (exampleContent) {
            const headers = exampleContent.querySelectorAll(
                ".function-label-header"
            );
            if (headers.length > 0) {
                headers.forEach((a, b) => {
                    let item = {
                        partOfSpeech: "",
                        definitions: [],
                        example: [
                            { sentence: "", author: "", title: "", year: "" },
                        ] as ExampleType[],
                        synonyms: "",
                    } as VocabularyDefinitionType;

                    item.partOfSpeech = a.text.toLowerCase();
                    const exa = a.nextElementSibling;
                    let quote = getElText(exa, ".t", "");
                    if (quote !== "") {
                        quote = quote.replace(regText, `<b>$1</b>`);
                    }
                    item.example[0].sentence = quote !== "" ? quote : "";
                    let cred = getElText(exa, ".auth", "").replace("—", "").split(", ");
                    item.example[0].author = cred[cred.length - 3]
                        ? cred[cred.length - 3]
                        : "";
                    item.example[0].title = cred[cred.length - 2]
                        ? cred[cred.length - 2]
                        : "";
                    item.example[0].year = cred[cred.length - 1]
                        ? cred[cred.length - 1]
                        : "";
                    result.definitions.push(item);
                });
            } else {
                let item = {
                    partOfSpeech: "",
                    definitions: [],
                    example: [
                        { sentence: "", author: "", title: "", year: "" },
                    ] as ExampleType[],
                    synonyms: "",
                } as VocabularyDefinitionType;
                const head = getElText(
                    doc,
                    ".entry-word-section-container .parts-of-speech",
                    ""
                );
                item.partOfSpeech = head.toLowerCase().split(" ").shift();
                const exa = exampleContent.querySelector(".sub-content-thread");
                let quote = getElText(exa, ".t", "");
                if (quote !== "") {
                    quote = quote.replace(regText, `<b>$1</b>`);
                }
                item.example[0].sentence = quote !== "" ? quote : "";
                let cred = getElText(exa, ".auth", "").replace("—", "").split(", ");
                item.example[0].author = cred[cred.length - 3]
                    ? cred[cred.length - 3]
                    : "";
                item.example[0].title = cred[cred.length - 2]
                    ? cred[cred.length - 2]
                    : "";
                item.example[0].year = cred[cred.length - 1]
                    ? cred[cred.length - 1]
                    : "";
                result.definitions.push(item);
            }
        }
        const entryHeader = doc.querySelectorAll(".entry-word-section-container");
        entryHeader.forEach((item, index) => {
            let itemDef = {
                definition: [] as { sense: string; similar: string }[],
                image: "",
            };

            const head = getElText(
                item,
                ".entry-header-content .parts-of-speech",
                ""
            )
                .split(" ")
                .shift();

            //find only First Definition
            const firstItem = item.querySelector(".vg-sseq-entry-item");

            if (firstItem) {
                firstItem.querySelectorAll(".sb-entry .sense").forEach((m, n) => {
                    let letter = getElText(m, ".letter", "");
                    let dtText = getElText(m, ".dtText", "");
                    let upText = /\s\:\s(.+)/g.exec(dtText);
                    dtText = dtText.replace(/\s\:\s(.+)/g, ``);
                    itemDef.definition.push({
                        sense: letter + " " + dtText,
                        similar: upText ? upText[1] : "",
                    });
                });
            }

            result.definitions.map((item) => {
                if (item.partOfSpeech === head) {
                    item.definitions.push(itemDef);
                }
            });

            if (index === 0) {
                const syn = doc.querySelector(".synonyms_list");
                let synDom = "";
                if (syn) {
                    let listItems = syn.querySelectorAll("ul li");
                    for (let i = 0; i < 3; i++) {
                        if (listItems[i]) {
                            synDom +=
                                i < 2
                                    ? listItems[i].textContent + ", "
                                    : listItems[i].textContent;
                        }
                    }
                    result.definitions[0].synonyms = synDom;
                }
            }
        });
        return result;
    } catch (error) {
        console.error(error);
    }
};

//find sound from oed
export const getOedSoundURL = async (text: string) => {
    // "use server";
    const baseUrl = `https://www.oed.com/search/dictionary/?scope=Entries&q=${text}&tl=true`;
    const response = await fetch(baseUrl);
    const pageImgHtml = await response.text();
    const pageDoc = parse(pageImgHtml);
    const urlParam = getElAttribute(pageDoc, ".viewEntry", "href");

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
    return "";
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
        .eq('id', monthId);
    if (error) return { message: error.message };
    throw redirect("/main/vocabulary");
}, "newHistory");

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
    let { error } = await supabase
        .from(mapTables.history)
        .insert([{
            week1: { index: startMonthIndex, from_date: "", to_date: "" },
            week2: { index: startMonthIndex + 200, from_date: "", to_date: "" },
            week3: { index: startMonthIndex + 400, from_date: "", to_date: "" },
            week4: { index: startMonthIndex + 600, from_date: "", to_date: "" },
            week5: { index: startMonthIndex + 800, from_date: "", to_date: "" },
        }])
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
export const getWeatherData = action(async (geo: string) => {
    "use server";
    const WEATHER_KEY = "gnunh5vxMIu0kLZG";
    const time = Math.round(Date.now() / 1000);
    const url = `https://api.pirateweather.net/forecast/${WEATHER_KEY}/${geo},${time}?exclude=daily&units=ca`
    try {
        const response = await fetch(url);
        const data = await response.json();
        const currentData = cleanDataCurrently(data.currently, data.offset);
        const minuteData = cleanDataMinutely(data.minutely.data);
        const predict = makePrediction(minuteData);
        return { currentData: currentData, minuteData: minuteData, prediction: predict };
    } catch (error) {
        console.error(error);
    }
}, "getWeatherData");

const cleanDataCurrently = (data: CurrentlyType, offset: number) => {
    "use server";
    const time = new Date(data.time * 1000);
    time.setHours(time.getHours() + offset);

    const timeText = format(time, "h:mm a");
    const hours = Number(format(time, "HH"));

    // 95% = DEVIATION_NUMB* standard deviation occur
    let newPrecipIntensity = (
        data.precipIntensity -
        DEVIATION_NUMB * data.precipIntensityError
    ).toFixed(3);

    let newItem = {
        icon: data.icon,
        summary: data.summary,
        timeText: timeText,
        isDayTime: hours > 5 && hours < 18,
        precipIntensity:
            Number(newPrecipIntensity) > 0 ? Number(newPrecipIntensity) : 0,
    };
    switch (true) {
        case newItem.precipIntensity >= 0.1 &&
            newItem.precipIntensity < 0.5 &&
            data.cloudCover >= 0.875 &&
            data.precipProbability >= PRECIP_NUMB:
            newItem.icon = "overcast-rain";
            newItem.summary = "Overcast Light Rain";
            break;
        case newItem.precipIntensity >= 0.1 &&
            newItem.precipIntensity < 0.5 &&
            data.precipProbability >= PRECIP_NUMB:
            newItem.icon = "drizzle";
            newItem.summary = "Light Rain";
            break;
        case newItem.precipIntensity >= 1 &&
            data.precipProbability >= PRECIP_NUMB:
            newItem.icon = "overcast-rain";
            newItem.summary = "Heavy Rain";
            break;
        case data.cloudCover <= 0.375:
            newItem.isDayTime
                ? (newItem.icon = "clear-day")
                : (newItem.icon = "clear-night");
            newItem.summary = "Clear";
            break;
        case data.cloudCover <= 0.875:
            newItem.isDayTime
                ? (newItem.icon = "partly-cloudy-day")
                : (newItem.icon = "partly-cloudy-night");
            newItem.summary = "Partly Cloudy";
            break;
        case data.cloudCover <= 0.95:
            newItem.icon = "cloudy";
            newItem.summary = "Cloudy";
            break;
        case data.cloudCover <= 1 &&
            newItem.precipIntensity >= 0.5 &&
            data.precipProbability >= PRECIP_NUMB:
            newItem.icon = "overcast-rain";
            newItem.summary = "Overcast";
            break;
        case data.cloudCover <= 1:
            newItem.isDayTime
                ? (newItem.icon = "overcast")
                : (newItem.icon = "overcast-night");
            newItem.summary = "Overcast";
            break;
        default:
            break;
    }
    return { ...data, ...newItem };
};

const cleanDataMinutely = (data: MinutelyType[]) => {
    "use server";
    return data.map((item, index) => {
        let newItem = { diffTime: 0, intensity: 0, probability: 0 };
        const newIntensity =
            item.precipIntensity - DEVIATION_NUMB * item.precipIntensityError;
        newItem.diffTime = (item.time - data[0].time) / 60;
        newItem.intensity = Number(
            newIntensity > 0 ? newIntensity.toFixed(3) : 0
        );
        newItem.probability = item.precipProbability;
        return newItem;
    });
};

const makePrediction = (data: FixMinutelyType[]): string => {
    "use server";
    let lightRainIndex = data.findIndex(
        (item) => item.intensity >= 0.1 && item.probability >= PRECIP_NUMB
    );
    let medRainIndex = data.findIndex(
        (item) => item.intensity >= 0.5 && item.probability >= PRECIP_NUMB
    );
    let heavyRainIndex = data.findIndex(
        (item) => item.intensity >= 1 && item.probability >= PRECIP_NUMB
    );
    let endRainIndex = data.findLastIndex(
        (item) =>
            item.intensity >= 0.09 &&
            item.intensity < 0.1 &&
            item.probability >= PRECIP_NUMB
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