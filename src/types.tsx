export interface VocabularyType {
  word: string;
  audio: string;
  phonetics: string;
  number: number;
  created_at: string;
  translations: VocabularyTranslationType[];
  definitions: VocabularyDefinitionType[];
}

export interface VocabularySearchType {
  created_at: string;
  word: string;
}

export interface VocabularyQuizType {
  created_at: string;
  word: string;
  audio: string;
  number: number;
  translations: VocabularyTranslationType[];
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
  definition: { sense: string; similar?: string }[];
  image: string;
  hash: string;
}

export interface ExampleType {
  sentence: string;
  author: string;
  title: string;
  year: string;
}

export interface BookmarkType {
  created_at: string;
  authors: string;
  bookTile: string;
  page: number;
  location: string;
  dateOfCreation: string;
  content: string;
  type: string;
  selected: boolean;
  like: number;
}

export interface ScheduleType {
  created_at: string;
  date: string;
  index1: number;
  index2: number;
  time1: number;
  time2: number;
}

export interface CalendarType {
  date: number;
  month: number;
  time1: number;
  time2: number;
}

export interface HistoryItemType {
  created_at: string;
  index: number;
  from_date: string;
  to_date: string;
}

export interface LayoutImageType {
  mainImage: string;
  shareDate: string;
  title: string;
  attr: string;
  authorImage: string;
  author: string;
  authorYears: string;
  content: string;
  alsoItems: { url: string | undefined; img: string | undefined }[];
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
  apparentTemperature: number;
  isDayTime: boolean;
  humidity: number;
  temperature: number;
  uvIndex: number;
  icon: number;
  windDirection: number;
  windSpeed: number;
}

export interface HourlyWeatherType {
  time: string;
  temperature: number;
  icon: string;
  probability: number;
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
  lat: number;
  lon: number;
  default: boolean;
}

export interface WeatherCodeData {
  [key: string]: {
    day: {
      description: string;
      image: string;
    };
    night: {
      description: string;
      image: string;
    };
    textdescription: string;
  };
}

export interface ScheduleProgressType {
  date: string;
  count: number;
}

export type LoginImageType = {
  title: string;
  hs1_title: string;
  hs2_title: string;
  image_L: string;
  image_P: string;
};
