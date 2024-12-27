import { pgTable, uuid, text, smallint, boolean, date, timestamp, unique, jsonb, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const bookmarkTable = pgTable("bookmark_table", {
	id: uuid().primaryKey().notNull(),
	authors: text().notNull(),
	bookTile: text().notNull(),
	page: smallint().notNull(),
	location: text().notNull(),
	dateOfCreation: text().notNull(),
	content: text().notNull(),
	type: text().notNull(),
	selected: boolean().default(false).notNull(),
	like: smallint().default(0).notNull(),
});

export const diaryTable = pgTable("diary_table", {
	id: uuid().primaryKey().notNull(),
	date: date().notNull(),
	count: smallint().notNull(),
});

export const memoriesTable = pgTable("memories_table", {
	id: uuid().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	word: text().notNull(),
});

export const progressTable = pgTable("progress_table", {
	id: uuid().primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	index: smallint().notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
});

export const scheduleTable = pgTable("schedule_table", {
	id: uuid().primaryKey().notNull(),
	date: date(),
	index: smallint().notNull(),
	count: smallint().notNull(),
});

export const vocabTable = pgTable("vocab_table", {
	id: uuid().primaryKey().notNull(),
	word: text().notNull(),
	phonetics: text().notNull(),
	number: smallint().default(240).notNull(),
	audio: text().notNull(),
	translations: jsonb().notNull(),
	definitions: jsonb().notNull(),
}, (table) => [
	unique("vocab_table_word_unique").on(table.word),
]);

export const weatherTable = pgTable("weather_table", {
	id: uuid().primaryKey().notNull(),
	name: text().notNull(),
	lat: numeric().notNull(),
	lon: numeric().notNull(),
	default: boolean().default(false).notNull(),
});
