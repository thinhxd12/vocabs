import { action, cache, useAction, useSubmission } from "@solidjs/router";
import { BookmarkType, HistoryType, ImageType, VocabularyType, mapTables } from "~/types";
import { supabase } from "./supabase";
import { getElAttribute, getElText } from "~/utils";
import parse from "node-html-parser";

const getBookmarkUrl = (path: string) => `https://script.google.com/macros/s/AKfycbyB0wM1O9rKwvLENWzUBE92oCTt_dbRjkNaFJKqhzi3c_UDA3kLdE9j0BzEyZHmCYVo/exec?action=${path}`;
const setBookmarkUrl = (path: string) => `https://script.google.com/macros/s/AKfycbyB0wM1O9rKwvLENWzUBE92oCTt_dbRjkNaFJKqhzi3c_UDA3kLdE9j0BzEyZHmCYVo/exec?action=${path}`;

async function fetchAPIsheet(path: string) {
    const url = path.startsWith("getBookmark") ? getBookmarkUrl(path) : setBookmarkUrl(path);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // console.log(data);
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

//insert data table history
export const uploadObjToSupabase = action(async (objs: Object[]) => {
    "use server";
    for (let obj of objs) {
        let { error } = await supabase.from("history").insert([obj]);
        console.log(error);
    }
});

//get image link
export const getDataImage = action(async (url:string) => {
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
        const imgAuthorImg = getElAttribute(
            doc,
            ".main-description__author img",
            "srcset"
        );
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
        const breakpoint = /\s\w+\,/;
        return {
            image: imgSrcGet.split(breakpoint)[0],
            date: imgDateGet,
            title: imgTitleGet,
            attr: imgAttGet,
            authorImg: imgAuthorImg,
            authorName: imgAuthorName,
            authorYear: imgAuthorYear,
            content: imgDesc,
            nextImageUrl: nextImgUrl
        } as ImageType;
    } catch (error) {
        console.error(error);
    }
});