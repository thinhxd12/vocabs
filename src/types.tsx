export const mapTables = {
  vocabulary: "vocabulary",
  schedule: "schedule",
  history: "history",
};

export interface VocabularyType {
  text: string;
  sound: string;
  class: string;
  definitions: string[] | [];
  phonetic: string;
  meaning: string;
  number: number;
}

export interface BookmarkType {
  check: boolean;
  value: string;
}

export interface HistoryItemContentType {
  index: number;
  from_date: string;
  to_date: string;
}

export interface ScheduleType {
  date: string;
  index1: number;
  index2: number;
  time1: number;
  time2: number;
}

export interface HistoryType {
  id: number;
  week1: HistoryItemContentType;
  week2: HistoryItemContentType;
  week3: HistoryItemContentType;
  week4: HistoryItemContentType;
  week5: HistoryItemContentType;
}

export interface ImageType {
  image: string;
  date: string;
  title: string;
  attr: string;
  authorImg: string;
  authorName: string;
  authorYear: string;
  content: string;
  nextImageUrl: string;
}

export interface TranslateType {
  definitions: Object;
  examples: Array<any>;
  translation: string;
  translationTranscription: string | null;
  translations: { [key: string]: any[] };
  word: string;
  wordTranscription: string;
}
