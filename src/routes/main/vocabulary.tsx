import { Component, Index, JSX, Show, createSignal } from "solid-js";
import { RouteDefinition, useAction } from "@solidjs/router";
import { getUser } from "~/api";
import { BookmarkType, TranslateType, VocabularyType } from "~/types";
import { debounce } from "@solid-primitives/scheduled";
import {
  deleteVocabulary,
  getBookmarkText,
  getSearchText,
  getTranslate,
  setBookmark,
} from "~/api/api";
import { createStore } from "solid-js/store";
import {
  OcTrash2,
  OcChevronleft2,
  OcStar2,
  OcStarfill2,
  OcChevronright2,
  OcPaste2,
  OcX2,
  OcCopy2,
  OcCopy3,
} from "solid-icons/oc";
import Definition from "~/components/definition";
import "/public/styles/vocabulary.scss";
import "/public/styles/quote.scss";
import FlipCard from "~/components/flipcard";
import { Motion, Presence } from "solid-motionone";
import Translation from "~/components/translation";
import { Portal } from "solid-js/web";
import Edit from "~/components/edit";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;

const page: Component<{}> = (props) => {
  const [searchResult, setSearchResult] = createSignal<VocabularyType[]>([]);
  const [searchTerm, setSearchTerm] = createSignal<string>("");
  const [currentText, setCurrentText] = createSignal<VocabularyType>();
  const [showDefinitions, setShowDefinitions] = createSignal(false);
  const [currentQuote, setCurrentQuote] = createStore<BookmarkType>({
    check: false,
    value: "",
  });
  const [showQuotes, setShowQuotes] = createSignal(false);

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
      showDefinitions() && setShowDefinitions(false);
      if (searchTerm().length > 2) {
        trigger(searchTerm());
      }
    }
    if (keyDown?.match(/^[1-9]$/)) {
      const keyDonwNumber = Number(keyDown);
      if (searchResult().length > 0 && keyDonwNumber <= searchResult().length) {
        handleRenderText(searchResult()[Number(keyDown) - 1]);
      }
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
      showDefinitions() && setShowDefinitions(false);
    }
  };

  const handleRenderText = (text: VocabularyType) => {
    setCurrentText(text);
    setShowDefinitions(true);
    setSearchTerm("");
    setSearchResult([]);
    // handlecheck function
  };

  const handleCloseDefinition = () => {
    setShowDefinitions(false);
  };

  const handleCloseTranslation = () => {
    setShowTranslate(false);
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

  // -------------------TRANSLATE START-------------------- //
  const [translateTerm, setTranslateTerm] = createSignal<string>("");
  const [translateText, setTranslateText] = createSignal<TranslateType>();
  const [showTranslate, setShowTranslate] = createSignal(false);

  const onKeyDownTrans: JSX.EventHandlerUnion<
    HTMLInputElement,
    KeyboardEvent
  > = (event) => {
    event.stopPropagation();
    const keyDown = event.key;
    if (keyDown === " ") {
      setTranslateTerm("");
      setShowTranslate(false);
    }
    if (keyDown === "Enter") handleTranslate();
  };
  const handleTranslate = async () => {
    const data = await getTranslate(translateTerm());
    setShowTranslate(true);
    setTranslateText(data);
  };
  // -------------------TRANSLATE END-------------------- //
  // -------------------DELETE START-------------------- //
  const [deleteBtnIndex, setDeleteBtnIndex] = createSignal<number>(0);

  const deleteVocabularyAction = useAction(deleteVocabulary);
  const handleDeleteVocabulary = (text: string) => {
    deleteVocabularyAction(text);
    setSearchTerm("");
    setDeleteBtnIndex(0);
    setSearchResult([]);
  };
  // -------------------DELETE END-------------------- //
  // -------------------EDIT START-------------------- //
  const [showEdit, setShowEdit] = createSignal(false);
  const [editText, setEditText] = createSignal<VocabularyType>();

  const handleCloseEdit = () => {
    setShowEdit(false);
  };

  const handleEditVocabulary = (text: VocabularyType) => {
    setEditText(text);
    setShowEdit(true);
    setSearchTerm("");
    setSearchResult([]);
  };
  // -------------------EDIT END-------------------- //

  return (
    <div class="vocabularyContainer">
      <div
        ref={divRef}
        tabIndex={0}
        onMouseOver={() => divRef?.focus()}
        onKeyDown={onKeyDownDiv}
        class="vocabulary"
      >
        <div class="flashCardContainer">
          <FlipCard item={currentText()!} />
        </div>

        <div class="myInputContainer">
          <img
            src="/images/main/input-left-corner.png"
            class="myInputLeftOrnament"
          />
          <div class="myInputCenterContent">
            <Motion.div
              class="myInputText"
              animate={{
                background: searchTerm().length > 0 ? "#272727" : "unset",
              }}
              transition={{ duration: 0.6, easing: "linear" }}
            >
              {searchTerm()}
            </Motion.div>
            <div class="myInputTransContent">
              <input
                class="myInput"
                value={translateTerm()}
                onInput={(e) => setTranslateTerm(e.target.value)}
                onKeyDown={onKeyDownTrans}
              />
              <button class="myInputBtn" onClick={handleTranslate}>
                <img src="/images/main/center.png" />
              </button>
            </div>
          </div>
          <img
            src="/images/main/input-right-corner.png"
            class="myInputRightOrnament"
          />
        </div>

        <div class="vocabularyContent">
          <div class="searchContainer">
            {/* Search result */}
            <Index each={searchResult()}>
              {(data, i) => (
                <div class="my-item">
                  <span
                    class="itemText"
                    onclick={() => handleRenderText(data())}
                  >
                    <span>
                      <small>{i + 1}</small>
                      <span>{data().text}</span>
                    </span>
                  </span>
                  <button
                    class="itemNumb"
                    onClick={() => handleEditVocabulary(data())}
                  >
                    {data().number}
                  </button>
                  <Show when={i + 1 !== deleteBtnIndex()}>
                    <button
                      class="itemDeleteBtn"
                      onClick={() => setDeleteBtnIndex(i + 1)}
                    ></button>
                  </Show>
                  <Show when={i + 1 === deleteBtnIndex()}>
                    <button
                      class="itemDeleteBtn"
                      onClick={() => handleDeleteVocabulary(data().text)}
                    >
                      <OcTrash2 size={12} />
                    </button>
                  </Show>
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
                        <OcStarfill2 size={17} color="#ffc107" />
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
                      <OcCopy2 size={17} />
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
            <Presence>
              <Show when={showDefinitions()}>
                <Motion
                  initial={{
                    opacity: 0,
                    y: -30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 30,
                  }}
                  transition={{ duration: 0.3, easing: "ease-in-out" }}
                >
                  <Definition
                    item={currentText()!}
                    onClose={handleCloseDefinition}
                  />
                </Motion>
              </Show>
            </Presence>
            {/* Translation */}
            <Presence>
              <Show when={showTranslate()}>
                <Motion
                  initial={{
                    opacity: 0,
                    y: -30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 30,
                  }}
                  transition={{ duration: 0.3, easing: "ease-in-out" }}
                >
                  <Translation
                    item={translateText()!}
                    onClose={handleCloseTranslation}
                  />
                </Motion>
              </Show>
            </Presence>
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
      {/* Edit */}
      <Presence>
        <Show when={showEdit()}>
          <Motion.div
            class="editOverlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{ duration: 0.3, easing: "ease-in-out" }}
          >
            <Edit item={editText()} onClose={handleCloseEdit} />
          </Motion.div>
        </Show>
      </Presence>
    </div>
  );
};

export default page;
