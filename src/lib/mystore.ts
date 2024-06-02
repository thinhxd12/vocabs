import { createStore } from "solid-js/store";
import { HistoryType, ScheduleType, VocabularyType } from "~/types";

type ListStoreType = {
  listType: 0 | 1 | 2;
  listCount: number;
  listContent: VocabularyType[],
  listButton: boolean;
  listToday: ScheduleType;
}

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
})


type MainStoreType = {
  totalMemories: number;
  audioSrc: string;
  showBookmark: boolean;
  showTranslate: boolean;
  showEdit: boolean;
  renderWord: VocabularyType | null;
  editWord: VocabularyType | null;
  historyList: HistoryType[];
  thisWeekIndex: number;
  mainToggle: boolean;
}

export const [mainStore, setMainStore] = createStore<MainStoreType>({
  totalMemories: 0,
  audioSrc: "",
  showBookmark: false,
  showTranslate: false,
  showEdit: false,
  renderWord: null,
  editWord: null,
  historyList: [],
  thisWeekIndex: 0,
  mainToggle: false,
})


