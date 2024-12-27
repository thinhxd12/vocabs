import { DrizzleError, eq, sql } from "drizzle-orm";
import { db } from "../index";
import {
  bookmarkTable,
  scheduleTable,
  SelectBookmark,
  SelectSchedule,
  SelectVocab,
  vocabTable,
} from "../schema";

export const decreaseNumberVocabById = async (id: SelectVocab["id"]) => {
  await db
    .update(vocabTable)
    .set({
      number: sql`${vocabTable.number} - 1`,
    })
    .where(eq(vocabTable.id, id));
};

export const updateVocabById = async (data: SelectVocab) => {
  try {
    await db
      .update(vocabTable)
      .set({
        word: data.word,
        audio: data.audio,
        phonetics: data.phonetics,
        number: data.number,
        translations: data.translations,
        definitions: data.definitions,
      })
      .where(eq(vocabTable.id, data.id));
    return {
      status: true,
      data: { message: "Action was successful!" } as DrizzleError,
    };
  } catch (error) {
    return {
      status: false,
      data: error as DrizzleError,
    };
  }
};

export const increaseScheduleById = async (id: SelectSchedule["id"]) => {
  return await db
    .update(scheduleTable)
    .set({
      count: sql`${scheduleTable.count} + 1`,
    })
    .where(eq(scheduleTable.id, id))
    .returning();
};

export const updateDateScheduleById = async (
  id: SelectSchedule["id"],
  dateUpdated: string,
) => {
  return await db
    .update(scheduleTable)
    .set({
      date: new Date(dateUpdated),
    })
    .where(eq(scheduleTable.id, id))
    .returning();
};

export const updateCountScheduleById = async (
  id: SelectSchedule["id"],
  newCount: SelectSchedule["count"],
) => {
  return await db
    .update(scheduleTable)
    .set({
      count: newCount,
    })
    .where(eq(scheduleTable.id, id));
};

export const increaseBookmarkLikeById = async (id: SelectBookmark["id"]) => {
  return await db
    .update(bookmarkTable)
    .set({
      like: sql`${bookmarkTable.like} + 1`,
    })
    .where(eq(bookmarkTable.id, id))
    .returning();
};

export const decreaseBookmarkLikeById = async (id: SelectBookmark["id"]) => {
  return await db
    .update(bookmarkTable)
    .set({
      like: sql`${bookmarkTable.like} - 1`,
    })
    .where(eq(bookmarkTable.id, id))
    .returning();
};

export const updateBookmarkSelectById = async (
  id: SelectBookmark["id"],
  value: SelectBookmark["selected"],
) => {
  return await db
    .update(bookmarkTable)
    .set({
      selected: value,
    })
    .where(eq(bookmarkTable.id, id))
    .returning();
};

export const updateBookmarkContentById = async (
  id: SelectBookmark["id"],
  value: SelectBookmark["content"],
) => {
  return await db
    .update(bookmarkTable)
    .set({
      content: value,
    })
    .where(eq(bookmarkTable.id, id))
    .returning();
};
