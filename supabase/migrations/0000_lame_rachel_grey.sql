CREATE TABLE "bookmark_table" (
	"id" uuid PRIMARY KEY NOT NULL,
	"authors" text NOT NULL,
	"bookTile" text NOT NULL,
	"page" smallint NOT NULL,
	"location" text NOT NULL,
	"dateOfCreation" text NOT NULL,
	"content" text NOT NULL,
	"type" text NOT NULL,
	"selected" boolean DEFAULT false NOT NULL,
	"like" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diary_table" (
	"id" uuid PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"count" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memories_table" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"word" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_table" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"index" smallint NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_table" (
	"id" uuid PRIMARY KEY NOT NULL,
	"date" date,
	"index" smallint NOT NULL,
	"count" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocab_table" (
	"id" uuid PRIMARY KEY NOT NULL,
	"word" text NOT NULL,
	"phonetics" text NOT NULL,
	"number" smallint DEFAULT 240 NOT NULL,
	"audio" text NOT NULL,
	"translations" jsonb NOT NULL,
	"definitions" jsonb NOT NULL,
	CONSTRAINT "vocab_table_word_unique" UNIQUE("word")
);
--> statement-breakpoint
CREATE TABLE "weather_table" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"lat" numeric NOT NULL,
	"lon" numeric NOT NULL,
	"default" boolean DEFAULT false NOT NULL
);
