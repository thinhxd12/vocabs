export interface VocabularyType {
  word: string;
  audio: string;
  phonetics: string;
  number: number;
  created_at: string;
  translations: VocabularyTranslationType[];
  definitions: VocabularyDefinitionType[];
}

export interface VocabularyTranslationType {
  partOfSpeech: string;
  translations: string[];
}

export interface VocabularyDefinitionType {
  partOfSpeech: string;
  definitions: DefinitionType[];
  synonyms: string;
  example: ExampleType[];
}
export interface DefinitionType {
  definition: { sense: string; similar: string }[];
  image: string;
}

export interface ExampleType {
  sentence: string;
  author: string;
  title: string;
  year: string;
}

// export interface BookmarkType {
//   check: boolean;
//   value: string;
// }

export interface BookmarkType {
  created_at: string;
  authors: string;
  bookTile: string;
  page: number;
  location: string;
  dateOfCreation: string;
  content: string;
  type: string;
  checked: boolean;
  selected: boolean;
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

export interface CalendarScheduleType {
  date: number;
  index1: number;
  index2: number;
  time1: number;
  time2: number;
  month: number;
}

export interface HistoryType {
  created_at: string;
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

export interface CurrentlyWeatherType {
  time: string;
  icon: string;
  summary: string;
  humidity: number;
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  windBearing: number;
  isDayTime: boolean;
}

export interface MinutelyWeatherType {
  time: number;
  precipIntensity: number;
  precipProbability: number;
  precipIntensityError: number;
  precipType: string;
}

export interface FixMinutelyTWeatherType {
  diffTime: number;
  intensity: number;
  probability: number;
}

export interface WeatherGeoType {
  name: string;
  geo: string;
}
