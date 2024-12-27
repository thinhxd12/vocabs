import {
  asc,
  count,
  eq,
  like,
  sql,
  isNull,
  isNotNull,
  gt,
  lt,
  desc,
} from "drizzle-orm";
import { db } from "../index";
import {
  bookmarkTable,
  diaryTable,
  memoriesTable,
  progressTable,
  scheduleTable,
  SelectBookmark,
  SelectMemories,
  SelectVocab,
  vocabTable,
  weatherTable,
} from "../schema";

export const getVocabById = async (id: SelectVocab["id"]) => {
  try {
    const result = await db
      .select()
      .from(vocabTable)
      .where(eq(vocabTable.id, id))
      .limit(1);
    if (result.length > 0) {
      return {
        status: true,
        data: result[0],
      };
    }
    return {
      status: false,
    };
  } catch (error) {
    return {
      status: false,
    };
  }
};

export const getVocabByWord = async (
  text: SelectVocab["word"],
): Promise<{ id: SelectVocab["id"]; word: SelectVocab["word"] }[]> => {
  try {
    const result = await db
      .select({ id: vocabTable.id, word: vocabTable.word })
      .from(vocabTable)
      .where(like(vocabTable.word, `${text}%`))
      .limit(9);
    return result;
  } catch (error) {
    return [];
  }
};

export const getMemoriesByWord = async (text: SelectMemories["word"]) => {
  try {
    const result = await db
      .select()
      .from(memoriesTable)
      .where(like(memoriesTable.word, `${text}%`))
      .limit(1);

    if (result.length > 0) {
      return {
        status: true,
        message: `Memorized "${text}"!`,
      };
    }
    return {
      status: false,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error",
    };
  }
};

export const getVocabList = async (startIndex: number) => {
  try {
    const result = await db
      .select()
      .from(vocabTable)
      .orderBy(asc(vocabTable.id))
      .offset(startIndex)
      .limit(50);
    return result;
  } catch (error) {
    return [];
  }
};

export const getWeather = async () => {
  try {
    const result = await db.select().from(weatherTable);
    return result;
  } catch (error) {
    return [];
  }
};

export const getScheduleByDate = async (dateSearch: string) => {
  try {
    const result = await db
      .select()
      .from(scheduleTable)
      .orderBy(asc(scheduleTable.id))
      .where(eq(scheduleTable.date, new Date(dateSearch)));
    return result;
  } catch (error) {
    return [];
  }
};

export const getScheduleByProgress = async () => {
  try {
    const result = await db
      .select()
      .from(scheduleTable)
      .orderBy(asc(scheduleTable.id))
      .where(isNull(scheduleTable.date))
      .limit(2);
    return result;
  } catch (error) {
    return [];
  }
};

export const getAllScheduleHaveDate = async () => {
  try {
    const result = await db
      .select()
      .from(scheduleTable)
      .orderBy(asc(scheduleTable.id))
      .where(isNotNull(scheduleTable.date));
    return result;
  } catch (error) {
    return [];
  }
};

export const getAllProgress = async () => {
  try {
    const result = await db
      .select()
      .from(progressTable)
      .orderBy(asc(progressTable.id));
    return result;
  } catch (error) {
    return [];
  }
};

export const getLastPartProgress = async () => {
  try {
    const lengthVocabTable = await db
      .select({ count: count() })
      .from(progressTable);
    const startOfIndex = Math.floor(lengthVocabTable[0].count / 5 - 3);

    const result = await db
      .select()
      .from(progressTable)
      .orderBy(asc(progressTable.id))
      .offset(startOfIndex * 5);
    return result;
  } catch (error) {
    return [];
  }
};

export const getDiary = async () => {
  try {
    const result = await db
      .select()
      .from(diaryTable)
      .orderBy(asc(diaryTable.id));
    return result;
  } catch (error) {
    return [];
  }
};

export const getBookmarkById = async (id: SelectBookmark["id"]) => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .where(eq(bookmarkTable.id, id))
      .limit(1);
  } catch (error) {
    console.log(error);
  }
};

export const getBookmarkBySelected = async () => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .where(eq(bookmarkTable.selected, true))
      .limit(1);
  } catch (error) {
    console.log(error);
  }
};

export const getNextBookmark = async (id: SelectBookmark["id"]) => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .where(gt(bookmarkTable.id, id))
      .orderBy(asc(bookmarkTable.id))
      .limit(1);
  } catch (error) {
    console.log(error);
  }
};

export const getPreviousBookmark = async (id: SelectBookmark["id"]) => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .where(lt(bookmarkTable.id, id))
      .orderBy(desc(bookmarkTable.id))
      .limit(1);
  } catch (error) {
    console.log(error);
  }
};

export const getRandomBookmark = async () => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .orderBy(sql`random()`)
      .limit(1);
  } catch (error) {
    console.log(error);
  }
};

export const findTextBookmark = async (text: string) => {
  try {
    return await db
      .select()
      .from(bookmarkTable)
      .where(
        sql`to_tsvector('english', ${bookmarkTable.content}) @@ websearch_to_tsquery('english', ${text})`,
      );
  } catch (error) {
    console.log(error);
  }
};
