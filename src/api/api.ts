import { cache } from "@solidjs/router";
import { BookmarkType, VocabularyType } from "~/types";
import { supabase } from "./supabase";

const mapTables = {
    vocabulary: "vocabulary",
} as const;

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

export const getSearchText = async (text: string) => {
    try {
        if (text !== "" && text.length > 2) {
            const { data, error } = await supabase
                .from(mapTables.vocabulary)
                .select()
                .like("text", `${text}%`);
            if (error) throw error;
            return data;
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

export const getCalendarData = cache(async () => {
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
            thisMonth: false,
        });
    }
    for (let i = 1; i <= lastDateofMonth; i++) {
        monthDateArr.push({
            date: i,
            month: thisMonth,
            thisMonth: true,
        });
    }
    for (let i = lastDayofMonth; i < 6; i++) {
        monthDateArr.push({
            date: i - lastDayofMonth + 1,
            month: thisMonth + 1,
            thisMonth: false,
        });
    }
    const calendarScheduleArr = chunk(monthDateArr, 7);

    return calendarScheduleArr

}, "calendar");
