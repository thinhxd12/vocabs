import { createStore } from "solid-js/store";
import {
  BookmarkType,
  CalendarType,
  CurrentlyWeatherType,
  HistoryItemType,
  ScheduleType,
  VocabularySearchType,
  VocabularyType,
  WeatherGeoType,
} from "~/types";

type ListStoreType = {
  listType: 0 | 1 | 2;
  listCount: number;
  listContent: VocabularySearchType[];
  listButton: boolean;
  listToday: ScheduleType;
};

export const [listStore, setListStore] = createStore<ListStoreType>({
  listType: 0,
  listCount: 0,
  listContent: [],
  listButton: false,
  listToday: {
    date: "",
    index1: 0,
    index2: 0,
    time1: 0,
    time2: 0,
  },
});

type MainStoreType = {
  totalMemories: number;
  showBookmark: boolean;
  showTranslate: boolean;
  showEdit: boolean;
  renderWord: VocabularyType | null;
  historyList: HistoryItemType[];
  calendarList: CalendarType[];
  thisWeekIndex: number;
  mainToggle: boolean;
  searchResult: VocabularySearchType[];
  translateTerm: string;
  searchTerm: string;
  searchTermColor: string;
  searchSelectedIndex: number;
  searchDeleteIndex: number;
};

export const [mainStore, setMainStore] = createStore<MainStoreType>({
  totalMemories: 0,
  showBookmark: false,
  showTranslate: false,
  showEdit: false,
  renderWord: null,
  historyList: [],
  calendarList: [],
  thisWeekIndex: -1,
  mainToggle: false,
  searchResult: [],
  translateTerm: "",
  searchTerm: "",
  searchTermColor: "#ffffff",
  searchSelectedIndex: 0,
  searchDeleteIndex: 0,
});
