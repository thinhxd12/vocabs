import { action, redirect } from "@solidjs/router";
import { CurrentlyType, HistoryType, ImageType, MinutelyType, ScheduleType, TranslateType, VocabularyType } from "~/types";
import { supabase } from "./supabase";
import { DEFAULT_CORS_PROXY, DEVIATION_NUMB, PRECIP_NUMB, getElAttribute, getElText, mapTables } from "~/utils";
import parse from "node-html-parser";
import { PostgrestError } from "@supabase/supabase-js";

export const getSearchText = action(async (text: string) => {
    "use server";
    try {
        const { data, error } = await supabase
            .from(mapTables.vocabulary)
            .select()
            .like("text", `${text}%`);
        return data as VocabularyType[];
    } catch (error) {
        console.error(error);
    }
});

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

export const getCalendarTodayData = action(async () => {
    "use server";
    const { data, error } = await supabase
        .from(mapTables.schedule)
        .select()
        .eq('date', new Date().toISOString());
    if (data) return data[0] as ScheduleType;
});

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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
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
        try {
            if (text === null) {
                return { error: "Not found" };
            }
            return text;
        } catch (e) {
            console.error(`Received from API: ${text}`);
            console.error(e);
            return { error: e };
        }
    } catch (error) {
        return { error };
    }
}

//get data definition from oxfox america
export const getTextDataAmerica = async (text: string) => {
    // "use server";
    // const url = `https://www.oxfordlearnersdictionaries.com/definition/american_english/${text}`;
    const url = DEFAULT_CORS_PROXY + `https://www.oxfordlearnersdictionaries.com/search/american_english/direct/?q=${text}`;
    const result: VocabularyType = {
        text: "",
        sound: "",
        class: "",
        definitions: [],
        phonetic: "",
        meaning: "",
        number: 240,
    };
    const newText = text.length > 4 ? text.slice(0, -2) : text;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");
    try {
        const response = await fetch(url);
        const pageImgHtml = await response.text();

        const doc = parse(pageImgHtml);

        result.sound = getElAttribute(
            doc,
            ".audio_play_button,.pron-us",
            "data-src-mp3"
        );
        result.text = text;
        result.class = getElText(doc, ".pos", "");
        const img = getElAttribute(doc, "img.thumb", "src");
        const defArr: string[] = [];
        doc
            .querySelector(".sn-gs")
            ?.querySelectorAll(".sn-g")
            ?.forEach((item, index) => {
                let def = "";
                const label = getElText(item, ".label-g", "");
                const definition = getElText(item, ".def", "");
                if (img !== "" && index == 0) {
                    def += `<span class="thumb_img"><img class="thumb" src="${img}"/><span><span class="def">${definition || label}</span>`;
                } else def += `<span class="def">${definition || label}</span>`;
                const xr = item.querySelector(".xr-gs");
                if (xr) {
                    const textNodes = Array.from(xr.childNodes)
                        .map((item, index) => {
                            if (index === 0) {
                                return `<span class="xr-gs">${item.textContent}`;
                            }
                            if (index === 1) {
                                return `${item.textContent}<small>`;
                            }
                            return item.textContent?.toLowerCase();
                        })
                        .join("");
                    def += `${textNodes}</small></span>`;
                }
                const meaning = getElText(item, ".x-gs .x", "");
                if (meaning !== "") {
                    const meaningX = meaning.replace(regText, `<b>$1</b>`);
                    if (img !== "") {
                        def += `<span class="x">${meaningX}</span></span>`;
                    } else def += `<span class="x">${meaningX}</span>`;
                }
                defArr.push(def.replace(/[\n\r]+|\s{2,}/g, " ").trim());
            });
        result.definitions = defArr;
        return result;
    } catch (error) {
        console.error(error);
    }
};

//get data definition from oxfox english
export const getTextDataEnglish = async (text: string) => {
    const url = DEFAULT_CORS_PROXY + `https://www.oxfordlearnersdictionaries.com/search/english/direct/?q=${text}`;
    const result: VocabularyType = {
        text: "",
        sound: "",
        class: "",
        definitions: [],
        phonetic: "",
        meaning: "",
        number: 240,
    };
    const newText = text.length > 4 ? text.slice(0, -2) : text;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");
    try {
        const response = await fetch(url);
        const pageImgHtml = await response.text();
        const doc = parse(pageImgHtml);

        result.sound = getElAttribute(
            doc,
            ".audio_play_button.pron-us",
            "data-src-mp3"
        );
        result.text = text;
        result.class = getElText(doc, ".pos", "");
        const img = getElAttribute(doc, "img.thumb", "src");
        const defArr: string[] = [];
        doc
            .querySelector("ol")
            ?.querySelectorAll(".sense")
            ?.forEach((item, index) => {
                let def = "";
                const label = getElText(item, ".labels", "");
                const definition = getElText(item, ".def", "");
                if (img !== "" && index == 0) {
                    def += `<span class="thumb_img"><img class="thumb" src="${img}"/><span><span class="def">${definition || label}</span>`;
                } else def += `<span class="def">${definition || label}</span>`;
                const xr = item.querySelector(".xrefs");
                if (xr) {
                    const textNodes = Array.from(xr.childNodes)
                        .map((item, index) => {
                            if (index === 0) {
                                return `<span class="xr-gs">${item.textContent}`;
                            }
                            if (index === 1) {
                                return `${item.textContent}<small>`;
                            }
                            return item.textContent?.toLowerCase();
                        })
                        .join("");
                    def += `${textNodes}</small></span>`;
                }
                const meaning = getElText(item, "span.x", "");
                if (meaning !== "") {
                    const meaningX = meaning.replace(regText, `<b>$1</b>`);
                    if (img !== "") {
                        def += `<span class="x">${meaningX}</span></span>`;
                    } else def += `<span class="x">${meaningX}</span>`;
                }
                defArr.push(def.replace(/[\n\r]+|\s{2,}/g, " ").trim());
            });
        result.definitions = defArr;
        return result;
    } catch (error) {
        console.error(error);
    }
};

//get data definition from cambridge
export const getTextDataCambridge = async (text: string) => {
    const url = DEFAULT_CORS_PROXY + `https://dictionary.cambridge.org/dictionary/english/${text}`;
    const result: VocabularyType = {
        text: "",
        sound: "",
        class: "",
        definitions: [],
        phonetic: "",
        meaning: "",
        number: 240,
    };
    const newText = text.length > 4 ? text.slice(0, -2) : text;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");
    try {
        const response = await fetch(url);
        const pageImgHtml = await response.text();
        const doc = parse(pageImgHtml);

        result.sound = "";
        result.text = getElText(doc, ".di-title", text);
        result.class = getElText(doc, ".pos.dpos", "");
        const defArr: string[] = [];
        const body = doc.querySelector(".entry-body");
        if (body) {
            body.querySelectorAll(".dsense").forEach((item, index) => {
                let def = "";
                const head =
                    getElText(item, ".dsense_pos", "") +
                    getElText(item, ".guideword", "");
                if (head !== "") def += `<span class="dsense_h">${head}</span>`;
                const defblocks = item.querySelectorAll(".def-block");
                defblocks.forEach((m, n) => {
                    const img = m.querySelector(".dimg");
                    let defin = getElText(m, ".def", "");
                    let example = "";
                    const meaning = getElText(m, ".eg.deg", "");
                    if (meaning !== "") {
                        const meaningX = meaning.replace(regText, `<b>$1</b>`);
                        example += `<span class="x">${meaningX}</span>`;
                    }
                    m.querySelectorAll(".xref").forEach((j, k) => {
                        example += `<span class="xr-gs">${getElText(
                            j,
                            ".xref-title",
                            ""
                        )} <small>`;
                        const lcs = j.querySelector(".lcs");
                        if (lcs) {
                            const textNodes = Array.from(j.querySelectorAll(".x-h.dx-h"))
                                .map((item, index) => {
                                    return item.textContent?.toLowerCase();
                                })
                                .join(", ");
                            example += `${textNodes}</small></span>`;
                        }
                    });

                    if (img) {
                        const imgUrl = getElAttribute(img, "amp-img", "src");
                        if (example) {
                            def += `<span class="thumb_img"><img class="thumb" src="https://dictionary.cambridge.org${imgUrl}"/><span><span class="def">${defin}</span>${example}</span></span>`;
                        } else
                            def += `<span class="thumb_img"><img class="thumb" src="https://dictionary.cambridge.org${imgUrl}"/><span class="def">${defin}</span></span>`;
                    } else if (defin !== "")
                        def += `<span class="def">${defin}</span>${example}`;
                });
                defArr.push(def.replace(/[\n\r]+|\s{2,}/g, " ").trim());
            });
        }
        result.definitions = defArr;
        return result;
    } catch (error) {
        console.error(error);
    }
};

export const getTextDataCollins = async (text: string) => {
    const url = `https://www.collinsdictionary.com/dictionary/english/${text}`;
    const result: VocabularyType = {
        text: "",
        sound: "",
        class: "",
        definitions: [],
        phonetic: "",
        meaning: "",
        number: 240,
    };
    const newText = text.length > 4 ? text.slice(0, -2) : text;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");

    try {
        const response = await fetch(url);
        const pageImgHtml = await response.text();
        const doc = parse(pageImgHtml);

        result.sound = "";
        result.text = getElText(doc, ".orth", text);
        result.class = getElText(doc, "div.american .hom .pos", "");
        const defArr: string[] = [];
        const body = doc.querySelector(".content.dictionary.american");
        const exampleDoc = doc.querySelector(".cB.cB-e");
        if (body) {
            body.querySelectorAll(".hom").forEach((item, index) => {
                if (index < 3) {
                    let def = "";
                    const head = getElText(item, ".pos", "");
                    if (head !== "") def += `<span class="dsense_h">${head}</span>`;
                    let defin = getElText(item, "div.def", "");
                    const exampleObj = exampleDoc?.querySelector(`span.cit:nth-child(${index + 2})`);

                    let quote = getElText(exampleObj, '.quote', "");
                    if (quote !== "") {
                        quote = quote.replace(regText, `<b>$1</b>`);
                    }
                    let author = getElText(exampleObj, '.credits .author', "");
                    author = author !== "" ? `<span class="author">${author} </span>` : "";
                    let title = getElText(exampleObj, '.credits .title', "");
                    title = title !== "" ? `<span class="title">${title} </span>` : "";
                    let year = getElText(exampleObj, '.credits .year', "");
                    year = year !== "" ? `<span class="year">${year}</span>` : "";
                    def += `<span class="def">${defin}</span><span class="x">${quote}</span><span class="credits">${author}${title}${year}</span>`;
                    defArr.push(def.replace(/[\n\r]+|\s{2,}/g, " ").trim());
                }
            })
        }
        result.definitions = defArr;
        return result;
    } catch (error) {
        console.error(error);
    }
}

//find sound from oed
export const getOedSoundURL = async (text: string) => {
    const baseUrl = `https://www.oed.com/search/dictionary/?scope=Entries&q=${text}&tl=true`;
    const response = await fetch(baseUrl);
    const pageImgHtml = await response.text();
    const pageDoc = parse(pageImgHtml);
    const newUrl = "https://www.oed.com" + pageDoc.querySelector("h3.resultTitle a")?.getAttribute("href");
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
};

//delete vocabulary
export const deleteVocabulary = action(async (text: string) => {
    "use server";
    const { error } = await supabase
        .rpc('deleteitem', { word: text })
    if (error) return error;
});

//edit vocabulary
export const editVocabularyItem = action(async (formData: FormData) => {
    "use server";
    const textT = String(formData.get("text"));
    const soundT = String(formData.get("sound"));
    const classT = String(formData.get("class"));
    const definitionsT = JSON.parse(String(formData.get("definitions")));
    const phoneticT = String(formData.get("phonetic"));
    const meaningT = String(formData.get("meaning"));
    const numberT = Number(formData.get("number"));
    const { error } = await supabase
        .from(mapTables.vocabulary)
        .update({
            sound: soundT,
            class: classT,
            definitions: definitionsT,
            phonetic: phoneticT,
            meaning: meaningT,
            number: numberT
        })
        .eq("text", textT)
    if (error) return { message: error.message };
    return { message: "success" } as PostgrestError
});

//insert new vocabulary
export const insertVocabularyItem = action(async (formData: FormData) => {
    "use server";
    const textT = String(formData.get("text"));
    const soundT = String(formData.get("sound"));
    const classT = String(formData.get("class"));
    const definitionsT = JSON.parse(String(formData.get("definitions")));
    const phoneticT = String(formData.get("phonetic"));
    const meaningT = String(formData.get("meaning"));
    const numberT = Number(formData.get("number"));
    const { error } = await supabase
        .from(mapTables.vocabulary)
        .insert({
            text: textT,
            sound: soundT,
            class: classT,
            definitions: definitionsT,
            phonetic: phoneticT,
            meaning: meaningT,
            number: numberT
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
        .eq('date', new Date().toISOString());
    if (error) return { message: error.message };
    throw redirect("/main/vocabulary");
}, "todayReset");

//reset today schedule
export const submitTodayProgress = action(async (type: number, numb: number) => {
    "use server";
    const updateObj = type === 1 ? { time1: numb } : { time2: numb }
    const { error } = await supabase
        .from(mapTables.schedule)
        .update(updateObj)
        .eq('date', new Date().toISOString());
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
                date: (new Date(new Date(startDay).getTime() + i * 86400000)).toISOString().split('T')[0],
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

//handle vocabulary
export const checkVocabulary = action(async (text: string) => {
    "use server";
    const { error } = await supabase
        .rpc('checkitem', { word: text })
    if (error) return error;
}, "checkVocabulary");

//archive vocabulary
export const archiveVocabulary = action(async (text: string) => {
    "use server";
    const { error } = await supabase
        .rpc('archiveitem', { word: text })
    if (error) return error;
}, "archiveVocabulary");

//archive vocabulary
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
        return { currentData: currentData, minuteData: minuteData };
    } catch (error) {
        console.error(error);
    }
}, "getWeatherData");

const cleanDataCurrently = (data: CurrentlyType, offset: number) => {
    const time = new Date(data.time * 1000);
    let hours = time.getUTCHours() + offset;
    let minutes = time.getMinutes();

    // Convert the hours to 12-hour format
    let hoursText = hours % 12;
    hoursText = hoursText ? hoursText : 12; // the hour '0' should be '12'
    const minutesText = minutes < 10 ? "0" + minutes : minutes;
    const period = hours >= 12 ? "PM" : "AM";
    const timeText = `${hoursText}:${minutesText} ${period}`;

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
