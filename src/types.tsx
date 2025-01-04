export interface VocabularySearchType {
  id: string;
  word: string;
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
  definition: DefinitionSenseType[];
  image: string;
  hash: string;
}

export interface DefinitionSenseType {
  letter?: string;
  num?: string;
  sense: string;
}

export interface ExampleType {
  sentence: string;
  author: string;
  title: string;
  year: string;
}

export interface CalendarType {
  date: number;
  month: number;
  count: number;
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

export type LoginImageType = {
  title: string;
  hs1_title: string;
  hs2_title: string;
  image_L: string;
  image_P: string;
  hash: string;
};

export type BookDetailType = {
  title: string | null;
  authors: string[];
  coverImage: string | null;
  rating: string | null;
  numberOfRatings: string | null;
  numberOfReviews: string | null;
  series: string | null;
  genres: string[];
  description: string | null;
  firstPublished: string | null;
  numberOfPages: string | null;
};

export type BookSearchType = {
  title: string | null;
  authors: any[];
  coverImage: string | null;
  detailsUrl: string | null;
  goodreadsId: string | null;
  publishedYear: string | null;
  averageRating: string | null;
  numberOfRatings: string | null;
};
