import {
  boolean,
  date,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { VocabularyDefinitionType, VocabularyTranslationType } from "~/types";
import { v7 as uuidv7 } from "uuid";

export const vocabTable = pgTable("vocab_table", {
  id: uuid("id").notNull().primaryKey().$defaultFn(uuidv7),
  word: text("word").notNull().unique(),
  phonetics: text("phonetics").notNull(),
  number: smallint("number").notNull().default(240),
  audio: text("audio").notNull(),
  translations: jsonb("translations")
    .$type<VocabularyTranslationType[]>()
    .notNull(),
  definitions: jsonb("definitions")
    .$type<VocabularyDefinitionType[]>()
    .notNull(),
});

export const scheduleTable = pgTable("schedule_table", {
  id: uuid("id").notNull().primaryKey().$defaultFn(uuidv7),
  date: date("date", { mode: "date" }),
  index: smallint("index").notNull(),
  count: smallint("count").notNull().default(0),
});

export const memoriesTable = pgTable("memories_table", {
  id: uuid("id").notNull().primaryKey().$defaultFn(uuidv7),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  word: text("word").notNull(),
});

export const progressTable = pgTable("progress_table", {
  id: uuid("id").notNull().primaryKey().$defaultFn(uuidv7),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  index: smallint("index").notNull(),
  start_date: date("start_date", { mode: "date" }).notNull(),
  end_date: date("end_date", { mode: "date" }).notNull(),
});

export const bookmarkTable = pgTable("bookmark_table", {
  id: uuid("id").notNull().primaryKey().$defaultFn(uuidv7),
  authors: text("authors").notNull(),
  bookTile: text("bookTile").notNull(),
  page: smallint("page").notNull(),
  location: text("location").notNull(),
  dateOfCreation: text("dateOfCreation").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  selected: boolean("selected").notNull().default(false),
  like: smallint("like").notNull().default(0),
});

export const diaryTable = pgTable("diary_table", {
  id: uuid("id").notNull().primaryKey().$defaultFn(uuidv7),
  date: date("date", { mode: "date" }).notNull(),
  count: smallint("count").notNull(),
});

export const weatherTable = pgTable("weather_table", {
  id: uuid("id").notNull().primaryKey().$defaultFn(uuidv7),
  name: text("name").notNull(),
  lat: numeric("lat").notNull(),
  lon: numeric("lon").notNull(),
  default: boolean("default").notNull().default(false),
});

export type InsertVocab = typeof vocabTable.$inferInsert;
export type SelectVocab = typeof vocabTable.$inferSelect;

export type InsertSchedule = typeof scheduleTable.$inferInsert;
export type SelectSchedule = typeof scheduleTable.$inferSelect;

export type InsertMemories = typeof memoriesTable.$inferInsert;
export type SelectMemories = typeof memoriesTable.$inferSelect;

export type InsertProgress = typeof progressTable.$inferInsert;
export type SelectProgress = typeof progressTable.$inferSelect;

export type InsertBookmark = typeof bookmarkTable.$inferInsert;
export type SelectBookmark = typeof bookmarkTable.$inferSelect;

export type InsertDiary = typeof diaryTable.$inferInsert;
export type SelectDiary = typeof diaryTable.$inferSelect;

export type InsertWeather = typeof weatherTable.$inferInsert;
export type SelectWeather = typeof weatherTable.$inferSelect;
