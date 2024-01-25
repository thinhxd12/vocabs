import { cache } from "@solidjs/router";
import { VocabularyType } from "~/types";
import { supabase } from "./supabaseClient";

const mapTables = {
    vocabulary: "vocabulary",
} as const;


export const getVocabulary = cache(
    async (): Promise<VocabularyType[] | undefined> => {
        "use server";
        try {
            const { data, error } = await supabase.from(mapTables.vocabulary).select();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(error);
        }
        // return 123;
        //   return fetchAPI(`${mapStories[type]}?page=${page}`);
    },
    "vocabulary"
);

export const getSearch = cache(async (text: string): Promise<VocabularyType[] | undefined> => {
    "use server";
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
}, "story");