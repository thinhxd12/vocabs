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

interface ContextProps {
  bottomIndex: Accessor<number>;
  setBottomIndex: Setter<number>;
  bottomActive: Accessor<boolean>;
  setBottomActive: Setter<boolean>;
  bottomLooping: Accessor<boolean>;
  setBottomLooping: Setter<boolean>;
}

const GlobalContext = createContext<ContextProps>();

export function GlobalContextProvider(props: { children: JSX.Element }) {
  const [bottomIndex, setBottomIndex] = createSignal<number>(0);
  const [bottomActive, setBottomActive] = createSignal(false);
  const [bottomLooping, setBottomLooping] = createSignal(false);

  return (
    <GlobalContext.Provider
      value={{
        bottomIndex,
        setBottomIndex,
        bottomActive,
        setBottomActive,
        bottomLooping,
        setBottomLooping,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => useContext(GlobalContext)!;
