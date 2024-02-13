import { RouteSectionProps } from "@solidjs/router";
import {
  Accessor,
  Setter,
  createContext,
  useContext,
  createSignal,
  Component,
  JSX,
} from "solid-js";
import { createStore } from "solid-js/store";
import { VocabularyType } from "~/types";

interface ContextProps {
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

  return (
    <GlobalContext.Provider
      value={{
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
