import { Component, Index, JSX, Show, createSignal } from "solid-js";
import { RouteDefinition, useAction } from "@solidjs/router";
import { getUser } from "~/api";
import { BookmarkType, VocabularyType } from "~/types";
import { debounce } from "@solid-primitives/scheduled";
import { createAudio } from "@solid-primitives/audio";
import { getBookmarkText, getSearchText, setBookmark } from "~/api/api";
import { createStore } from "solid-js/store";
import {
  OcTrash2,
  OcChevronleft2,
  OcStar2,
  OcStarfill2,
  OcChevronright2,
  OcPaste2,
  OcX2,
} from "solid-icons/oc";
import Definition from "~/components/definition";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;

const page: Component<{}> = (props) => {
  const [searchResult, setSearchResult] = createSignal<VocabularyType[]>([]);
  const [searchTerm, setSearchTerm] = createSignal<string>("");
  const [currentText, setCurrentText] = createSignal<VocabularyType>();
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

  //call sever action search text
  const getSearchTextAction = useAction(getSearchText);

  const trigger = debounce(async (str: string) => {
    const res = await getSearchTextAction(str);
    setSearchResult(res || []);
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
    setSearchTerm("");
    setSearchResult([]);
    // handlecheck function
  };

  const handleCloseDefinition = () => {
    setShowDefinitions(false);
  };

  const getQuote = async (numb: number) => {
    if (!showQuotes()) setShowQuotes(true);
    const data = await getBookmarkText(numb);
    setCurrentQuote(data);
  };

  const checkQuote = async (check: boolean) => {
    setCurrentQuote("check", check);
    setBookmark(check);
  };

  const copyQuoteToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      ref={divRef}
      tabIndex={0}
      onMouseOver={() => divRef?.focus()}
      onKeyDown={onKeyDownDiv}
      class="vocabulary"
    >
      <div class="flashCardContainer">
        {/* <FlipNumber />
        <FlipCard /> */}
      </div>

      <div class="myInputContainer">
        <img
          src="/images/main/input-left-corner.png"
          class="myInputLeftOrnament"
        />
        <div class="myInputText">{searchTerm()}</div>
        <div class="myInputTransContent">
          <input class="myInput" />
          <button class="myInputBtn">
            <img src="/images/main/center.png" />
          </button>
        </div>
        <img
          src="/images/main/input-right-corner.png"
          class="myInputRightOrnament"
        />
      </div>
      <div class="vocabularyContainer">
        <div class="searchContainer">
          {/* Search result */}
          <Index each={searchResult()}>
            {(data, i) => (
              <div class="my-item" onclick={() => handleRenderText(data())}>
                <span class="itemText">
                  <span>
                    <small>{i + 1}</small>
                    <span>{data().text}</span>
                  </span>
                  <span class="itemNumb">{data().number}</span>
                </span>
                <button class="itemDeleteBtn">
                  <OcTrash2 size={12} />
                </button>
              </div>
            )}
          </Index>
          {/* Quote content */}
          <Show when={showQuotes()}>
            <div class="quoteContainer">
              <div class="quoteHeader">
                <div class="quoteHeaderLeft">
                  <button class="quoteBtn" onclick={() => getQuote(-1)}>
                    <OcChevronleft2 size={17} />
                  </button>
                  <button
                    class={
                      currentQuote.check
                        ? "quoteBtn quoteBtnActive"
                        : "quoteBtn"
                    }
                    onclick={() => checkQuote(!currentQuote.check)}
                  >
                    {currentQuote.check ? (
                      <OcStarfill2 size={17} />
                    ) : (
                      <OcStar2 size={17} />
                    )}
                  </button>
                  <button class="quoteBtn" onclick={() => getQuote(1)}>
                    <OcChevronright2 size={17} />
                  </button>
                  <button
                    class="quoteBtn"
                    onclick={() => copyQuoteToClipboard(currentQuote.value)}
                  >
                    <OcPaste2 size={17} />
                  </button>
                </div>
                <button
                  class="quoteBtnClose"
                  onClick={() => setShowQuotes(false)}
                >
                  <OcX2 size={12} />
                </button>
              </div>
              <div class="quoteBody">
                <span class="quoteDropCap">
                  {currentQuote.value.slice(0, 1)}
                </span>
                <span>{currentQuote.value.slice(1)}</span>
              </div>
            </div>
          </Show>
          {/* Definition */}
          <Show when={showDefinitions()}>
            <Definition item={currentText()!} onClose={handleCloseDefinition} />
            {/* <button onClick={() => setShowDefinitions(false)}>X</button>
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
            </Index> */}
          </Show>
        </div>
      </div>

      <div class="vocabularyBtnContainer">
        <button class="vocabularyBtn" onClick={() => getQuote(0)}>
          Π
        </button>
        <button class="vocabularyBtn">Ν</button>
        <button class="vocabularyBtn">Ε</button>
        <button class="vocabularyBtn">Λ</button>
        <button class="vocabularyBtn">Δ</button>
        <button class="vocabularyBtn">Χ</button>
        <button class="vocabularyBtn">Σ</button>
        <button class="vocabularyBtn">Ξ</button>
        <button class="vocabularyBtn timerBtn timerBtnActive">6m</button>
      </div>
    </div>
  );
};

export default page;
