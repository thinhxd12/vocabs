import { createStore } from "solid-js/store";
import {
  CalendarType,
  HistoryItemType,
  ScheduleType,
  VocabularyQuizType,
  VocabularySearchType,
  VocabularyType,
  WeatherGeoType,
} from "~/types";

type ListStoreType = {
  listType: 0 | 1 | 2;
  listCount: number;
  quizCount: number;
  quizContent: VocabularyQuizType[];
  quizRender: VocabularyQuizType;
  listContent: VocabularySearchType[];
  listButton: boolean;
  vocabPage: boolean;
};

export const [listStore, setListStore] = createStore<ListStoreType>({
  listType: 0,
  listCount: 0,
  listContent: [],
  listButton: false,
  quizCount: 0,
  quizContent: [],
  quizRender: {
    created_at: "",
    word: "",
    number: 0,
    audio: "",
    translations: [],
  },
  vocabPage: false,
});

type CalendarStoreType = {
  todaySchedule: ScheduleType;
  historyList: HistoryItemType[];
  calendarList: CalendarType[];
  thisWeekIndex: number;
};
export const [calendarStore, setCalendarStore] = createStore<CalendarStoreType>(
  {
    todaySchedule: {
      created_at: "",
      date: "",
      index1: 0,
      index2: 0,
      time1: 0,
      time2: 0,
    },
    historyList: [],
    calendarList: [],
    thisWeekIndex: -1,
  }
);

type MainStoreType = {
  totalMemories: number;
  showBookmark: boolean;
  showTranslate: boolean;
  showEdit: boolean;
  renderWord: VocabularyType | null;
  mainToggle: boolean;
  searchResult: VocabularySearchType[];
  translateTerm: string;
  searchTerm: string;
  searchTermColor: string;
  searchSelectedIndex: number;
  searchDeleteIndex: number;
  audioSrc: string;
  audioRef: HTMLAudioElement | null;
};

export const [mainStore, setMainStore] = createStore<MainStoreType>({
  totalMemories: 0,
  showBookmark: false,
  showTranslate: false,
  showEdit: false,
  renderWord: null,
  mainToggle: false,
  searchResult: [],
  translateTerm: "",
  searchTerm: "",
  searchTermColor: "#ffffff",
  searchSelectedIndex: 0,
  searchDeleteIndex: 0,
  audioSrc: "/sounds/mp3_Ding.mp3",
  audioRef: null,
});

type WeatherStoreType = {
  defaultLocation: WeatherGeoType;
  locationList: WeatherGeoType[];
};
export const [weatherStore, setWeatherStore] = createStore<WeatherStoreType>({
  defaultLocation: {
    name: "Default Location",
    lat: 10.6023,
    lon: 106.4021,
    default: false,
  },
  locationList: [],
});
