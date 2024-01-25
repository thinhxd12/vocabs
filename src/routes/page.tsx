import {
  Component,
  Index,
  JSX,
  Show,
  createResource,
  createSignal,
} from "solid-js";
import { RouteDefinition, createAsync } from "@solidjs/router";
import { getUser } from "~/api";
import { supabase } from "~/api/supabase";
import { BookmarkType, VocabularyType } from "~/types";
import { debounce } from "@solid-primitives/scheduled";
import { createAudio } from "@solid-primitives/audio";
import { getBookmarkText, getSearchText, setBookmark } from "~/api/api";
import { createStore } from "solid-js/store";

// export const route = {
//   load: () => getUser(),
// } satisfies RouteDefinition;

const page: Component<{}> = (props) => {
  const user = createAsync(getUser, { deferStream: true });
  const [searchResult, setSearchResult] = createSignal<VocabularyType[]>([]);
  const [searchTerm, setSearchTerm] = createSignal<string>("");
  const [currentText, setCurrentText] = createSignal<VocabularyType | null>();
  const [audioSource, setAudioSource] = createSignal("");
  const [showDefinitions, setShowDefinitions] = createSignal(false);
  const [currentQuote, setCurrentQuote] = createStore<BookmarkType>({
    check: false,
    value: "",
  });
  const [showQuotes, setShowQuotes] = createSignal(false);
  const [playing, setPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(1);
  const [audio, { seek }] = createAudio(audioSource, playing, volume);

  let divRef: HTMLDivElement | undefined;

  const trigger = debounce(async (str: string) => {
    const res = await getSearchText(str);
    if (res) {
      setSearchResult(res);
    }
  }, 300);

  const onKeyDownDiv: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (
    event
  ) => {
    // console.log(event);
    const keyDown = event.key;
    if (keyDown.match(/^[a-z]$/)) {
      setSearchTerm(searchTerm() + keyDown);
      if (searchTerm().length > 2) {
        trigger(searchTerm());
      }
    }
    if (keyDown?.match(/^[1-9]$/) && searchResult().length > 0) {
      handleRenderText(searchResult()[Number(keyDown) - 1]);
      setSearchTerm("");
      setSearchResult([]);
    }
    if (keyDown === "Backspace") {
      setSearchTerm(searchTerm().slice(0, -1));
      if (searchTerm().length > 2) {
        trigger(searchTerm());
      }
    }
    if (keyDown === " ") {
      event.preventDefault();
      setSearchTerm("");
      setSearchResult([]);
    }
  };

  const handleRenderText = (text: VocabularyType) => {
    setCurrentText(text);
    setAudioSource(text.sound);
    setPlaying(true);
    setShowDefinitions(true);
    // handlecheck function
  };

  const getQuote = async (numb: number) => {
    if (!showQuotes()) setShowQuotes(true);
    const data = await getBookmarkText(numb);
    setCurrentQuote({ ...data });
    console.log({ ...data });
  };

  const checkQuote = async (check: boolean) => {
    setCurrentQuote("check", check);
    const data = await setBookmark(check);
    // setCurrentQuote((prevState)=>{...prevState,check:true});
    // setCurrentQuote((prevState) => ({ ...prevState, check: true }));
    console.log({ ...data });
  };

  return (
    <div
      ref={divRef}
      tabIndex={0}
      onMouseOver={() => divRef?.focus()}
      onKeyDown={onKeyDownDiv}
      style={{ width: "100vw", height: "90vh", outline: "none" }}
    >
      <div style={{ border: "1px solid black;", height: "18px" }}>
        {searchTerm()}
      </div>

      <Index each={searchResult()}>
        {(data, i) => (
          <p onclick={() => handleRenderText(data())}>
            {i + 1} - {data().text}
          </p>
        )}
      </Index>
      <br></br>
      <button onclick={() => getQuote(0)}>Show Quote</button>
      <button onclick={() => getQuote(-1)}>Prev Quote</button>
      <button onclick={() => checkQuote(!currentQuote.check)}>
        Check Quote
      </button>
      <button onclick={() => getQuote(1)}>Next Quote</button>
      <Show when={showQuotes()}>
        <button onClick={() => setShowQuotes(false)}>X</button>
        <p>{currentQuote.check ? "*" : ""}</p>
        <p>{currentQuote.value}</p>
      </Show>
      <br></br>
      <Show when={showDefinitions()}>
        <button onClick={() => setShowDefinitions(false)}>X</button>
        <h4>{currentText()?.text}</h4>
        <p>{currentText()?.phonetic}</p>
        <p>{currentText()?.number}</p>
        <p>{currentText()?.meaning}</p>
        <br></br>
        <p>
          Definition of <b>{currentText()?.text}</b>
        </p>
        <Index each={currentText()?.definitions}>
          {(item, i) => <div innerHTML={item()} />}
        </Index>
      </Show>
    </div>
  );
};

export default page;
