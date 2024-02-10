import {
  Component,
  Index,
  JSX,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
} from "solid-js";
import {
  RouteDefinition,
  useAction,
  useSubmission,
  useSubmissions,
} from "@solidjs/router";
import { getUser } from "~/api";
import { BookmarkType, TranslateType, VocabularyType } from "~/types";
import { debounce } from "@solid-primitives/scheduled";
import {
  deleteVocabulary,
  getBookmarkText,
  getSearchText,
  getTranslate,
  checkVocabulary,
  setBookmark,
  archiveVocabulary,
  getCalendarTodayData,
  getVocabularyFromRange,
  submitTodayProgress,
  getMemoriesLength,
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
import QuoteDummy from "~/components/quote";
import { createIntervalCounter, createPolled } from "@solid-primitives/timer";
import { useGlobalContext } from "~/globalcontext/store";
import { createAudio } from "@solid-primitives/audio";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;

let timerRef: NodeJS.Timeout;
const [counter, setCounter] = createSignal<number>(0);
const [timerCounter, setTimerCounter] = createSignal<number>(6);
const [currentText, setCurrentText] = createSignal<VocabularyType>();
const [showDefinitions, setShowDefinitions] = createSignal(false);

const Vocabulary: Component<{}> = (props) => {
  const [searchResult, setSearchResult] = createSignal<VocabularyType[]>([]);
  const [searchTerm, setSearchTerm] = createSignal<string>("");
  const [searchInputBackground, setSearchInputBackground] =
    createSignal<string>("unset");
  let divRef: HTMLDivElement | undefined;

  onMount(async () => {
    await getCalendarTodayDataAction();
    await getMemoriesLengthAction();
    onCleanup(() => {
      clearInterval(timerRef);
    });
  });

  createEffect(() => {
    if (searchTerm().length > 0) {
      setSearchInputBackground("#272727");
    } else setSearchInputBackground("unset");
  });

  //call sever action search text
  const getSearchTextAction = useAction(getSearchText);

  const trigger = debounce(async (str: string) => {
    const res = await getSearchTextAction(str);
    if (res) {
      if (res.length === 0) {
        setSearchInputBackground("#000000");
      } else setSearchResult(res);
    }
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

  const checkVocabularyAction = useAction(checkVocabulary);
  const archiveVocabularyAction = useAction(archiveVocabulary);
  const getMemoriesLengthAction = useAction(getMemoriesLength);

  const handleRenderText = async (text: VocabularyType, count?: number) => {
    setCurrentText(text);
    setShowDefinitions(true);
    setSearchTerm("");
    setSearchResult([]);
    // handlecheck function
    if (text.number > 1) {
      checkVocabularyAction(text.text);
    } else {
      await archiveVocabularyAction(text.text);
      deleteVocabularyAction(text.text);
      getMemoriesLengthAction();
    }
  };

  const handleCloseDefinition = () => {
    setShowDefinitions(false);
  };

  const handleCloseTranslation = () => {
    setShowTranslate(false);
    setTranslateTerm("");
  };

  // -------------------QUOTE START-------------------- //
  const [currentQuote, setCurrentQuote] = createStore<BookmarkType>({
    check: false,
    value: "",
  });
  const [showQuotes, setShowQuotes] = createSignal(false);
  const getBookmarkAction = useAction(getBookmarkText);
  const getBookmarkTextResult = useSubmission(getBookmarkText);
  const setBookmarkAction = useAction(setBookmark);

  const getQuote = async (numb: number) => {
    setShowQuotes(true);
    const result = await getBookmarkAction(numb);
    setCurrentQuote(result!);
    // getBookmarkAction(numb);
  };

  const checkQuote = (check: boolean) => {
    setCurrentQuote("check", check);
    setBookmarkAction(check);
  };

  const copyQuoteToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  // -------------------QUOTE END-------------------- //

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
  // -------------------AUTOPLAY START-------------------- //
  const getCalendarTodayDataAction = useAction(getCalendarTodayData);
  const getCalendarTodayDataResult = useSubmission(getCalendarTodayData);
  const getVocabularyFromRangeAction = useAction(getVocabularyFromRange);
  const [wordList, setWordList] = createStore<VocabularyType[]>([]);

  const handleAutoplay = () => {
    handleRenderText(wordList[counter()]);
    setCounter(counter() + 1);
  };

  const submitTodayProgressAction = useAction(submitTodayProgress);

  const startAutoplay = async () => {
    setBottomLooping(true);
    if (counter() === 0) {
      const newProgress =
        todayIndex() === 1
          ? getCalendarTodayDataResult.result!.time1 + 1
          : getCalendarTodayDataResult.result!.time2 + 1;
      await submitTodayProgressAction(todayIndex(), newProgress);
      await getCalendarTodayDataAction();
    }
    handleAutoplay();
    timerRef = setInterval(() => {
      if (counter() < wordList.length) {
        handleAutoplay();
      } else {
        stopAutoplay();
        //start timmer countdown
        startTimer();
      }
    }, 7500);
  };

  const pauseAutoplay = () => {
    clearInterval(timerRef);
  };

  const stopAutoplay = () => {
    //wordlist index
    setCounter(0);
    //bottom button input background
    setBottomLooping(false);
    clearInterval(timerRef);
    setBottomActive(false);
  };

  const {
    bottomIndex,
    setBottomIndex,
    bottomActive,
    setBottomActive,
    bottomLooping,
    setBottomLooping,
  } = useGlobalContext();

  createEffect(
    on(
      bottomActive,
      () => {
        if (bottomActive() && wordList.length > 0) {
          startAutoplay();
        } else {
          pauseAutoplay();
        }
      },
      { defer: true }
    )
  );

  const [todayIndex, setTodayIndex] = createSignal<number>(0);

  const handleSetDailyWord = async (id: number) => {
    switch (id) {
      case 1:
        //get 50 word
        setTodayIndex(1);
        const start1 = getCalendarTodayDataResult.result!.index1;
        const data1 = await getVocabularyFromRangeAction(start1, start1 + 49);
        if (data1) {
          setWordList(data1);
        }
        setBottomIndex(getCalendarTodayDataResult.result!.index1 + 1);
        stopAutoplay();
        break;
      case 2:
        //get 49word
        setTodayIndex(2);
        const start2 = getCalendarTodayDataResult.result!.index2;
        const data2 = await getVocabularyFromRangeAction(start2, start2 + 49);
        if (data2) {
          setWordList(data2);
        }
        setBottomIndex(getCalendarTodayDataResult.result!.index2 + 1);
        stopAutoplay();
        break;
      default:
        break;
    }
  };

  // -------------------AUTOPLAY END-------------------- //
  // -------------------TIMMER START-------------------- //
  const [delay, setDelay] = createSignal<number | false>(false);
  const countDownTimer = createIntervalCounter(delay);
  const [audioSource, setAudioSource] = createSignal<string>("");
  const [playing, setPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(1);
  const [audio, { seek }] = createAudio(audioSource, playing, volume);

  createEffect(
    on(
      countDownTimer,
      () => {
        if (timerCounter() > 0) {
          setTimerCounter(timerCounter() - 1);
        } else {
          stopTimer();
          showDesktopNotification();
          setAudioSource("/sounds/09_Autumn_Mvt_3_Allegro.mp3");
          setPlaying(true);
        }
      },
      { defer: true }
    )
  );

  const startTimer = () => {
    setDelay(60000);
  };

  const stopTimer = () => {
    setDelay(false);
    setTimerCounter(6);
  };

  const showDesktopNotification = () => {
    const img = "https://cdn-icons-png.flaticon.com/512/2617/2617511.png";
    const letter = todayIndex() === 1 ? "A" : "B";
    const newProgress =
      todayIndex() === 1
        ? getCalendarTodayDataResult.result!.time1 + 1
        : getCalendarTodayDataResult.result!.time2 + 1;
    const notification = new Notification("Start Focusing", {
      icon: img,
      requireInteraction: true,
      body: `${letter}${newProgress}`,
    });

    notification.onclose = (event) => {
      if (wordList.length > 0) {
        setBottomActive(true);
      }
      setPlaying(false);
    };
  };

  // -------------------TIMMER END-------------------- //

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
                // background: searchTerm().length > 0 ? "#272727" : "unset",
                backgroundColor: searchInputBackground(),
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
            <Show when={showQuotes()}>
              <Show
                when={getBookmarkTextResult.result}
                fallback={<QuoteDummy />}
              >
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
                  <Show
                    when={bottomLooping()}
                    fallback={
                      <Definition
                        item={currentText()!}
                        onClose={handleCloseDefinition}
                      />
                    }
                  >
                    <Definition
                      item={currentText()!}
                      onClose={handleCloseDefinition}
                      count={bottomIndex() + counter() - 1}
                    />
                  </Show>
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
                    text={translateTerm()}
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
          <button class="vocabularyBtn">&#x39D;</button>
          <button class="vocabularyBtn">&#x395;</button>
          <button
            class={
              getCalendarTodayDataResult.result &&
              getCalendarTodayDataResult.result.time1 > 0
                ? "vocabularyBtn vocabularyBtnActive"
                : "vocabularyBtn"
            }
            onClick={() => handleSetDailyWord(1)}
          >
            <span>&#x391;</span>
            <small>{getCalendarTodayDataResult.result?.time1}</small>
          </button>
          <button
            class={
              getCalendarTodayDataResult.result &&
              getCalendarTodayDataResult.result.time2 > 0
                ? "vocabularyBtn vocabularyBtnActive"
                : "vocabularyBtn"
            }
            onClick={() => handleSetDailyWord(2)}
          >
            <span>&#x392;</span>
            <small>{getCalendarTodayDataResult.result?.time2}</small>
          </button>
          <button class="vocabularyBtn" onClick={startTimer}>
            &#x3A7;
          </button>
          <button class="vocabularyBtn">Σ</button>
          <button class="vocabularyBtn">Ξ</button>
          <Show when={delay()}>
            <button
              class="vocabularyBtn timerBtn timerBtnActive"
              onClick={stopTimer}
            >
              {timerCounter()}m
            </button>
          </Show>
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
            <Edit item={editText()!} onClose={handleCloseEdit} />
          </Motion.div>
        </Show>
      </Presence>
    </div>
  );
};

export default Vocabulary;
