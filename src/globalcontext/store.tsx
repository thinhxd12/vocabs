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
import { VocabularyType } from "~/types";

interface ContextProps {
  totalMemories: Accessor<number>;
  setTotalMemories: Setter<number>;
  bottomIndex: Accessor<number>;
  setBottomIndex: Setter<number>;
  bottomActive: Accessor<boolean>;
  setBottomActive: Setter<boolean>;
  bottomLooping: Accessor<boolean>;
  setBottomLooping: Setter<boolean>;
  counter: Accessor<number>;
  setCounter: Setter<number>;
  wordList: Accessor<VocabularyType[]>;
  setWordList: Setter<VocabularyType[]>;
}

const GlobalContext = createContext<ContextProps>();

export function GlobalContextProvider(props: { children: JSX.Element }) {
  const [bottomIndex, setBottomIndex] = createSignal<number>(0);
  const [bottomActive, setBottomActive] = createSignal(false);
  const [bottomLooping, setBottomLooping] = createSignal(false);
  const [counter, setCounter] = createSignal<number>(0);
  const [wordList, setWordList] = createSignal<VocabularyType[]>([]);
  const [totalMemories, setTotalMemories] = createSignal<number>(0);

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
        bottomLooping,
        setBottomLooping,
        counter,
        setCounter,
        wordList,
        setWordList,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => useContext(GlobalContext)!;
