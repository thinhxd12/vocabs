import { createAudio } from "@solid-primitives/audio";
import { useAction } from "@solidjs/router";
import {
  Accessor,
  Setter,
  createContext,
  useContext,
  createSignal,
  JSX,
  onMount,
} from "solid-js";
import { getMemoriesLength } from "~/api/api";
import { ScheduleType, VocabularyType } from "~/types";

interface ContextProps {
  totalMemories: Accessor<number>;
  setTotalMemories: Setter<number>;
  bottomIndex: Accessor<number>;
  setBottomIndex: Setter<number>;
  bottomActive: Accessor<boolean>;
  setBottomActive: Setter<boolean>;
  showMenubar: Accessor<boolean>;
  setShowMenubar: Setter<boolean>;
  counter: Accessor<number>;
  setCounter: Setter<number>;
  wordListType: Accessor<0 | 1 | 2>;
  setWordListType: Setter<0 | 1 | 2>;
  wordList: Accessor<VocabularyType[]>;
  setWordList: Setter<VocabularyType[]>;
  todayData: Accessor<ScheduleType>;
  setTodayData: Setter<ScheduleType>;
  audioSrc: Accessor<string>;
  setAudioSrc: Setter<string>;
}

const GlobalContext = createContext<ContextProps>();

export function GlobalContextProvider(props: { children: JSX.Element }) {
  const [bottomIndex, setBottomIndex] = createSignal<number>(0);
  const [showMenubar, setShowMenubar] = createSignal(false);
  const [bottomActive, setBottomActive] = createSignal(false);
  const [counter, setCounter] = createSignal<number>(0);
  const [wordListType, setWordListType] = createSignal<0 | 1 | 2>(0);
  const [wordList, setWordList] = createSignal<VocabularyType[]>([]);
  const [totalMemories, setTotalMemories] = createSignal<number>(0);
  const [todayData, setTodayData] = createSignal<ScheduleType>({
    date: "",
    index1: 0,
    index2: 0,
    time1: 0,
    time2: 0,
  });

  const [audioSrc, setAudioSrc] = createSignal<string>("");
  const [playing, setPlaying] = createSignal(true);
  const [volume, setVolume] = createSignal(1);
  const [audio, controls] = createAudio(audioSrc, playing, volume);

  const getMemoriesLengthAction = useAction(getMemoriesLength);

  onMount(async () => {
    const count = await getMemoriesLengthAction();
    setTotalMemories(count);
  });

  return (
    <GlobalContext.Provider
      value={{
        totalMemories,
        setTotalMemories,
        bottomIndex,
        setBottomIndex,
        bottomActive,
        setBottomActive,
        counter,
        setCounter,
        wordList,
        setWordList,
        showMenubar,
        setShowMenubar,
        wordListType,
        setWordListType,
        todayData,
        setTodayData,
        audioSrc,
        setAudioSrc,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => useContext(GlobalContext)!;
