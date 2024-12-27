import { db } from "../index";
import {
  bookmarkTable,
  diaryTable,
  InsertBookmark,
  InsertDiary,
  InsertMemories,
  InsertProgress,
  InsertSchedule,
  InsertVocab,
  InsertWeather,
  memoriesTable,
  progressTable,
  scheduleTable,
  vocabTable,
  weatherTable,
} from "../schema";
import { DrizzleError } from "drizzle-orm";

export const insertVocab = async (data: InsertVocab) => {
  try {
    await db.insert(vocabTable).values(data);
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

export const insertSchedule = async (data: InsertSchedule) => {
  try {
    await db.insert(scheduleTable).values(data);
  } catch (error) {
    return error as DrizzleError;
  }
};

export const insertMemories = async (data: InsertMemories) => {
  try {
    await db.insert(memoriesTable).values(data);
  } catch (error) {
    return error as DrizzleError;
  }
};

export const insertProgress = async (data: InsertProgress) => {
  try {
    await db.insert(progressTable).values(data);
  } catch (error) {
    return error as DrizzleError;
  }
};

export const insertWeather = async (data: InsertWeather) => {
  try {
    await db.insert(weatherTable).values(data);
  } catch (error) {
    return error as DrizzleError;
  }
};

export const insertDiary = async (data: InsertDiary) => {
  try {
    await db.insert(diaryTable).values(data);
  } catch (error) {
    return error as DrizzleError;
  }
};

export const insertBookmark = async (data: InsertBookmark) => {
  try {
    await db.insert(bookmarkTable).values(data);
  } catch (error) {
    return error as DrizzleError;
  }
};
