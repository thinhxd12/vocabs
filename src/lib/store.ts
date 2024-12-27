import { createStore } from "solid-js/store";
import {
  SelectDiary,
  SelectProgress,
  SelectSchedule,
  SelectVocab,
  SelectWeather,
} from "~/db/schema";
import { CalendarType, VocabularySearchType } from "~/types";

type QuizStoreType = {
  quizCount: number;
  quizRender: SelectVocab | undefined;
};

export const [quizStore, setQuizStore] = createStore<QuizStoreType>({
  quizCount: 0,
  quizRender: undefined,
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
  editWord: SelectVocab | undefined;
  searchTerm: string;
  searchResults: VocabularySearchType[];
  renderWord: SelectVocab | undefined;
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
  progressList: SelectProgress[];
  calendarList: CalendarType[];
  thisWeekIndex: number;
  diaryList: SelectDiary[];
};

export const [scheduleStore, setScheduleStore] = createStore<ScheduleStoreType>(
  {
    progressList: [],
    calendarList: [],
    thisWeekIndex: -1,
    diaryList: [],
  },
);

type NavStore = {
  defaultLocation: SelectWeather;
  locationList: SelectWeather[];
  totalMemories: number;
  todaySchedule: SelectSchedule[];
  currentSchedule: SelectSchedule | undefined;
  listCount: number;
  listContent: SelectVocab[];
  playButton: boolean;
};

export const [navStore, setNavStore] = createStore<NavStore>({
  defaultLocation: {
    id: "0194033c-fa9f-7719-ba80-d7a657153032",
    name: "Default Location",
    lat: "10.588468",
    lon: "106.40065",
    default: true,
  },
  locationList: [],
  totalMemories: 0,
  todaySchedule: [],
  currentSchedule: undefined,
  listCount: 0,
  listContent: [],
  playButton: false,
});
