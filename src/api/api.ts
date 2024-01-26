import { action, cache, useAction, useSubmission } from "@solidjs/router";
import { BookmarkType, HistoryType, VocabularyType, mapTables } from "~/types";
import { supabase } from "./supabase";

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
// export const getCalendarHistoryData = cache(async () => {
//     "use server";
//     const { data, error } = await supabase.from(mapTables.history).select();
//     return data as HistoryType[];
// }, "calendar-history");

//get last row history table
export const getCalendarHistoryData = cache(async () => {
    "use server";
    const { data, error } = await supabase.from(mapTables.history).select().order("id", { ascending: false }).limit(1);
    return data as HistoryType[];
}, "calendar-history");