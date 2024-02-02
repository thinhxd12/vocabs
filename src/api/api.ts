import { action, cache } from "@solidjs/router";
import { BookmarkType, HistoryType, ImageType, TranslateType, VocabularyType, mapTables } from "~/types";
import { supabase } from "./supabase";
import { getElAttribute, getElText } from "~/utils";
import parse from "node-html-parser";
import { PostgrestError } from "@supabase/supabase-js";


// const baseUrl = "https://script.google.com/macros/s/AKfycbyB0wM1O9rKwvLENWzUBE92oCTt_dbRjkNaFJKqhzi3c_UDA3kLdE9j0BzEyZHmCYVo/exec";
const baseUrl = "https://script.google.com/macros/s/AKfycbyyx7SmjI3iSF4uFVTtfVDYxN_5xL7jntJvnKVlaSNgXS8fWDdP_6iz7DgGogEtiXGR/exec";

const getBookmarkUrl = (path: string) => `${baseUrl}?action=${path}`;
const setBookmarkUrl = (path: string) => `${baseUrl}?action=${path}`;
async function fetchAPIsheet(path: string) {
    const url = path.startsWith("getBookmark") ? getBookmarkUrl(path) : setBookmarkUrl(path);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const getBookmarkText = async (id: number): Promise<BookmarkType> => {
    return fetchAPIsheet(`getBookmark&num=${id}`);
};

export const setBookmark = async (check: boolean) => {
    return fetchAPIsheet(`setBookmark&check=${check}`);
};

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

export const getCalendarScheduleData = cache(async () => {
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
        return calendarScheduleArr
    }
}, "calendar-schedule");

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

//insert data table vocabulary
export const insertNewVocabularyItem = action(async (obj: VocabularyType) => {
    "use server";
    const { error } = await supabase
        .from(mapTables.vocabulary)
        .insert(obj)
    if (error) return error;
});

//get data definition from oxfox america
// export const getTextDataAmerica = action(async (text: string) => {
//     "use server";
//     const url = `https://www.oxfordlearnersdictionaries.com/search/american_english/direct/?q=${text}`;
//     const result: VocabularyType = {
//         text: "",
//         sound: "",
//         class: "",
//         definitions: [],
//         phonetic: "",
//         meaning: "",
//         number: 240,
//     };
//     const newText = text.length > 4 ? text.slice(0, -2) : text;
//     const regText = new RegExp(`(${newText}\\w*)`, "gi");
//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const pageImgHtml = await response.text();
//         const doc = parse(pageImgHtml);

//         result.sound = getElAttribute(
//             doc,
//             ".audio_play_button,.pron-us",
//             "data-src-mp3"
//         );
//         result.text = text;
//         result.class = getElText(doc, ".pos", "");
//         const img = getElAttribute(doc, "img.thumb", "src");
//         const defArr: string[] = [];
//         doc
//             .querySelector(".sn-gs")
//             ?.querySelectorAll(".sn-g")
//             ?.forEach((item, index) => {
//                 let def = "";
//                 const label = getElText(item, ".label-g", "");
//                 const definition = getElText(item, ".def", "");
//                 if (img !== "" && index == 0) {
//                     def += `<span class="thumb_img"><img class="thumb" src="${img}"/><span><span class="def">${definition || label}</span>`;
//                 } else def += `<span class="def">${definition || label}</span>`;
//                 const xr = item.querySelector(".xr-gs");
//                 if (xr) {
//                     const textNodes = Array.from(xr.childNodes)
//                         .map((item, index) => {
//                             if (index === 0) {
//                                 return `<span class="xr-gs">${item.textContent}`;
//                             }
//                             if (index === 1) {
//                                 return `${item.textContent}<small>`;
//                             }
//                             return item.textContent?.toLowerCase();
//                         })
//                         .join("");
//                     def += `${textNodes}</small></span>`;
//                 }
//                 const meaning = getElText(item, ".x-gs .x", "");
//                 if (meaning !== "") {
//                     const meaningX = meaning.replace(regText, `<b>$1</b>`);
//                     def += `<span class="x">${meaningX}</span></span>`;
//                 }
//                 defArr.push(def.replace(/[\n\r]+|\s{2,}/g, " ").trim());
//             });
//         result.definitions = defArr;
//         return result;
//     } catch (error) {
//         console.error(error);
//     }
// });

//get data definition from oxfox english
export const getTextDataEnglish = action(async (text: string) => {
    "use server";
    const url = `https://www.oxfordlearnersdictionaries.com/search/english/direct/?q=${text}`;
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
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
                    def += `<span class="x">${meaningX}</span></span>`;
                }
                defArr.push(def.replace(/[\n\r]+|\s{2,}/g, " ").trim());
            });
        result.definitions = defArr;
        return result;
    } catch (error) {
        console.error(error);
    }
});

//get data definition from cambridge
export const getTextDataCambridge = action(async (text: string) => {
    "use server";
    const url = `https://dictionary.cambridge.org/dictionary/english/${text}`;
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
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
                        def += `<span class="thumb_img"><img class="thumb" src="https://dictionary.cambridge.org/${imgUrl}"/><span><span class="def">${defin}</span>${example}</span></span>`;
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
});

//find sound from oed
export const getOedSound = action(async (text: string) => {
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
});

export const getTextDataAmerica = action(async (text: string) => {
    "use server";
    const newText = text.length > 4 ? text.slice(0, -2) : text;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");
    const url = `https://www.oxfordlearnersdictionaries.com/search/american_english/direct/?q=${text}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pageImgHtml = await response.text();
        const doc = parse(pageImgHtml);

        const soundT = getElAttribute(doc, ".audio_play_button,.pron-us", "data-src-mp3");
        const classT = getElText(doc, ".pos", "");
        const img = getElAttribute(doc, "img.thumb", "src");
        let definitionsT: string[] = [];
        doc.querySelector(".sn-gs")
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
                    def += `<span class="x">${meaningX}</span></span>`;
                }
                definitionsT.push(def.replace(/[\n\r]+|\s{2,}/g, " ").trim());
            });


        return {
            text: text,
            sound: soundT,
            class: classT,
            definitions: definitionsT,
            phonetic: "",
            meaning: "",
            number: 240
        } as VocabularyType;
    } catch (error) {
        console.error(error);
    }
});



//delete vocabulary
export const deleteVocabulary = action(async (text: string) => {
    "use server";
    const { data, error } = await supabase
        .from(mapTables.vocabulary)
        .delete()
        .match({ text: text });
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
    if (error) return error;
    return { message: "success" } as PostgrestError
});