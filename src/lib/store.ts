import { createStore } from "solid-js/store";
import {
  CalendarType,
  HistoryItemType,
  ScheduleProgressType,
  ScheduleType,
  VocabularyQuizType,
  VocabularySearchType,
  VocabularyType,
  WeatherGeoType,
} from "~/types";

type QuizStoreType = {
  quizCount: number;
  quizContent: VocabularyQuizType[];
  quizRender: VocabularyQuizType;
};

export const [quizStore, setQuizStore] = createStore<QuizStoreType>({
  quizCount: 0,
  quizContent: [],
  quizRender: {
    created_at: "",
    word: "",
    number: 0,
    audio: "",
    translations: [],
  },
});

type LayoutStoreType = {
  showLayout: boolean;
  showSearchResults: boolean;
  showBookmark: boolean;
  layoutMainRef: HTMLDivElement | null;
  isMobile: boolean;
};

export const [layoutStore, setLayoutStore] = createStore<LayoutStoreType>({
  showLayout: false,
  showSearchResults: false,
  showBookmark: false,
  layoutMainRef: null as HTMLDivElement | null,
  isMobile: false,
});

type VocabStoreType = {
  translateTerm: string;
  showTranslate: boolean;
  showEdit: boolean;
  editWord: VocabularyType | undefined;
  searchTerm: string;
  searchResults: VocabularySearchType[];
  renderWord: VocabularyType | undefined;
  searchTermColor: boolean;
};

export const [vocabStore, setVocabStore] = createStore<VocabStoreType>({
  showTranslate: false,
  showEdit: false,
  editWord: undefined,
  searchTerm: "",
  translateTerm: "",
  searchResults: [],
  renderWord: undefined,
  searchTermColor: true,
});

type ScheduleStoreType = {
  historyList: HistoryItemType[];
  calendarList: CalendarType[];
  thisWeekIndex: number;
  progressList: ScheduleProgressType[];
};

export const [scheduleStore, setScheduleStore] = createStore<ScheduleStoreType>(
  {
    historyList: [],
    calendarList: [],
    thisWeekIndex: -1,
    progressList: [],
  },
);

type NavStore = {
  defaultLocation: WeatherGeoType;
  locationList: WeatherGeoType[];
  totalMemories: number;
  todaySchedule: ScheduleType;
  listType: 0 | 1 | 2;
  listCount: number;
  listContent: VocabularySearchType[];
  playButton: boolean;
};

export const [navStore, setNavStore] = createStore<NavStore>({
  defaultLocation: {
    name: "Default Location",
    lat: 10.6023,
    lon: 106.4021,
    default: false,
  },
  locationList: [],
  totalMemories: 0,
  todaySchedule: {
    created_at: "",
    date: "",
    index1: 0,
    index2: 0,
    time1: 0,
    time2: 0,
  },
  listType: 0,
  listCount: 0,
  listContent: [],
  playButton: false,
});
