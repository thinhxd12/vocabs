import {
  Component,
  Index,
  JSX,
  Show,
  createEffect,
  createSignal,
  on,
  onMount,
} from "solid-js";
import { RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import { getUser } from "~/api";
import { BookmarkType, VocabularyType } from "~/types";
import { debounce } from "@solid-primitives/scheduled";
import {
  deleteVocabulary,
  getBookmarkText,
  getSearchText,
  setBookmark,
  getCalendarTodayData,
  getVocabularyFromRange,
  submitTodayProgress,
  checkVocabulary,
  archiveVocabulary,
  getMemoriesLength,
} from "~/api/api";
import { createStore } from "solid-js/store";
import {
  OcChevronleft2,
  OcStar2,
  OcStarfill2,
  OcChevronright2,
  OcX2,
  OcCopy2,
  OcAlertfill2,
} from "solid-icons/oc";
import Definition from "~/components/definition";
import "/public/styles/vocabulary.scss";
import "/public/styles/quote.scss";
import FlipCard from "~/components/flipcard";
import { Motion, Presence } from "solid-motionone";
import Translation from "~/components/translation";
import Edit from "~/components/edit";
import { createIntervalCounter } from "@solid-primitives/timer";
import { useGlobalContext } from "~/globalcontext/store";
import { Meta, MetaProvider, Title } from "@solidjs/meta";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;

let timerRef: NodeJS.Timeout;
let audioRef: HTMLAudioElement;

const [currentText, setCurrentText] = createSignal<VocabularyType>();
const [showDefinitions, setShowDefinitions] = createSignal(false);

const Vocabulary: Component<{}> = () => {
  const [searchResult, setSearchResult] = createSignal<VocabularyType[]>([]);
  const [searchTerm, setSearchTerm] = createSignal<string>("");

  const [searchInputColor, setSearchInputColor] =
    createSignal<string>("#957c3e");
  let divRef: HTMLDivElement | undefined;

  onMount(async () => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
    await getCalendarTodayDataAction();
  });

  createEffect(() => {
    if (searchResult().length > 0) setSearchInputColor("#957c3e");
  });

  //call sever action search text
  const getSearchTextAction = useAction(getSearchText);

  const trigger = debounce(async (str: string) => {
    const res = await getSearchTextAction(str);
    if (res) {
      if (res.length === 0) {
        setSearchResult([]);
        setSearchInputColor("#ca140c");
        setTranslateTerm(str);
      } else setSearchResult(res);
    }
  }, 300);

  const onKeyDownDiv: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (
    event
  ) => {
    // console.log(event);
    const keyDown = event.key;
    if (keyDown.match(/^[a-z\-]$/)) {
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
      setSearchInputColor("#957c3e");
      event.preventDefault();
      setSearchTerm("");
      setSearchResult([]);
      showDefinitions() && setShowDefinitions(false);
    }
  };

  const checkVocabularyAction = useAction(checkVocabulary);
  const archiveVocabularyAction = useAction(archiveVocabulary);
  const getMemoriesLengthAction = useAction(getMemoriesLength);

  const handleRenderText = async (text: VocabularyType) => {
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
      const count = await getMemoriesLengthAction();
      setTotalMemories(count);
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
    if (keyDown === "Enter") setShowTranslate(true);
  };

  const handleTranslate = () => {
    setShowTranslate(true);
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

  const handleAutoplay = () => {
    handleRenderText(wordList()[counter()]);
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
      if (counter() < wordList().length) {
        handleAutoplay();
      } else {
        stopAutoplay();
        //get wordlist to update lastest changed
        handleSetDailyWord(todayIndex());
        //start timmer countdown
        if (getCalendarTodayDataResult.result) {
          getCalendarTodayDataResult.result.time2 < 9 && startTimer();
        }
      }
    }, 7500);
  };

  const pauseAutoplay = () => {
    clearInterval(timerRef);
  };

  const stopAutoplay = () => {
    clearInterval(timerRef);
    //wordlist index
    setCounter(0);
    //bottom button input background
    setBottomLooping(false);
    setBottomActive(false);
  };

  const {
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
    setTotalMemories,
  } = useGlobalContext();

  createEffect(
    on(bottomActive, () => {
      if (bottomActive() && wordList().length > 0) {
        startAutoplay();
      } else {
        pauseAutoplay();
      }
    })
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
        //get 59word
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
  const [timerCounter, setTimerCounter] = createSignal<number>(7);

  createEffect(
    on(countDownTimer, () => {
      if (timerCounter() > 1) {
        setTimerCounter(timerCounter() - 1);
      } else {
        stopTimer();
        showDesktopNotification();
        audioRef.play();
      }
    })
  );

  const startTimer = () => {
    setDelay(60000);
  };

  const stopTimer = () => {
    setDelay(false);
    setTimerCounter(7);
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

    notification.onclose = () => {
      setBottomActive(true);
      audioRef.pause();
    };
  };

  // -------------------TIMMER END-------------------- //
  // -------------------MOBILE START-------------------- //

  const [isMobile, setIsMobile] = createSignal(false);

  const onInputSearch: JSX.InputEventHandlerUnion<
    HTMLInputElement,
    InputEvent
  > = async (event) => {
    event.stopPropagation();
    const inputValue = event.currentTarget.value;
    if (inputValue.length > 2) {
      trigger(inputValue);
    }
  };

  // -------------------MOBILE END-------------------- //

  return (
    <MetaProvider>
      <Title>Übermensch</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio
        src="/sounds/09_Autumn_Mvt_3_Allegro.mp3"
        hidden
        ref={audioRef}
      ></audio>
      <Motion.div
        class="vocabularyContainer"
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.6 }}
      >
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

          <Show
            when={isMobile()}
            fallback={
              <>
                <div class="newInputContainer">
                  <div class="newInputContain">
                    <div class="newInputBackground">
                      <Motion.p
                        animate={{ color: searchInputColor() }}
                        transition={{ duration: 0.3, easing: "ease" }}
                      >
                        {searchTerm()}
                      </Motion.p>
                    </div>
                  </div>
                </div>
              </>
            }
          >
            <div class="myInputContainer">
              <img
                src="/images/main/input-left-corner.png"
                class="myInputLeftOrnament"
              />
              <div class="myInputCenterContent">
                <input class="myInput" onInput={onInputSearch} />
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
          </Show>

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
                        class="button button--primary"
                        onClick={() => setDeleteBtnIndex(i + 1)}
                      ></button>
                    </Show>
                    <Show when={i + 1 === deleteBtnIndex()}>
                      <button
                        class="button button--primary"
                        onClick={() => handleDeleteVocabulary(data().text)}
                      >
                        <OcAlertfill2 size={12} color="#ca140c" />
                      </button>
                    </Show>
                  </div>
                )}
              </Index>
              <Show when={showQuotes()}>
                <div class="quoteContainer">
                  <div class="quoteHeader">
                    <div class="quoteHeaderLeft">
                      <button
                        class="button button--quote"
                        onclick={() => getQuote(-1)}
                      >
                        <OcChevronleft2 size={17} />
                      </button>
                      <button
                        class="button button--quote"
                        onclick={() => checkQuote(!currentQuote.check)}
                      >
                        {currentQuote.check ? (
                          <OcStarfill2 size={17} color="#ffc107" />
                        ) : (
                          <OcStar2 size={17} />
                        )}
                      </button>
                      <button
                        class="button button--quote"
                        onclick={() => getQuote(1)}
                      >
                        <OcChevronright2 size={17} />
                      </button>
                      <button
                        class="button button--quote"
                        onclick={() => copyQuoteToClipboard(currentQuote.value)}
                      >
                        <OcCopy2 size={14} />
                      </button>
                    </div>
                    <div class="quoteHeaderRight">
                      <button
                        class="button button--close"
                        onClick={() => setShowQuotes(false)}
                      >
                        <OcX2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div
                    class={
                      currentQuote.check ? "quoteBody quoteBody--bookmark" : "quoteBody"
                    }
                  >
                    <Show
                      when={getBookmarkTextResult.result}
                      fallback={<p>loading...</p>}
                    >
                      <p class="quotePassage">{currentQuote.value}</p>
                    </Show>
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
                  ? "vocabularyBtnActive"
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
                  ? "vocabularyBtnActive"
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
            <button
              class="vocabularyBtn"
              onClick={() => setShowTranslate(true)}
            >
              Ξ
            </button>
            <Show when={delay()}>
              <button class="vocabularyBtn timerBtn" onClick={stopTimer}>
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
        {/* Translation */}
        <Presence>
          <Show when={showTranslate()}>
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
              <Translation
                translateText={translateTerm()}
                onClose={handleCloseTranslation}
              />
            </Motion.div>
          </Show>
        </Presence>
      </Motion.div>
    </MetaProvider>
  );
};

export default Vocabulary;
