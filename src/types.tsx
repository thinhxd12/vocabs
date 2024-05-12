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

export interface CurrentlyType {
  time: number;
  summary: string;
  icon: string;
  nearestStormDistance: number;
  nearestStormBearing: number;
  precipIntensity: number;
  precipProbability: number;
  precipIntensityError: number;
  precipType: string;
  temperature: number;
  apparentTemperature: number;
  dewPoint: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windGust: number;
  windBearing: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  ozone: number;
  isDayTime?: boolean;
}

export interface FixCurrentlyType {
  timeText: string;
  icon: string;
  summary: string;
  temperature: number;
  humidity: number;
  apparentTemperature: number;
  uvIndex: number;
  windSpeed: number;
  windBearing: number;
  isDayTime: boolean;
}

export interface MinutelyType {
  time: number;
  precipIntensity: number;
  precipProbability: number;
  precipIntensityError: number;
  precipType: string;
}

export interface FixMinutelyType {
  diffTime: number;
  intensity: number;
  probability: number;
}

export interface HourlyType {
  time: number;
  icon: string;
  summary: string;
  precipIntensity: number;
  precipProbability: number;
  precipIntensityError: number;
  precipAccumulation: number;
  precipType: string;
  temperature: number;
  apparentTemperature: number;
  dewPoint: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windGust: number;
  windBearing: number;
  cloudCover: number;
  uvIndex: number;
  visibility: number;
  ozone: number;
}

export interface WeatherDataType {
  currentData: FixCurrentlyType;
  minuteData: FixMinutelyType[];
  prediction: string;
}
