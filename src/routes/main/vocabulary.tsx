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
import { RouteDefinition, useAction } from "@solidjs/router";
import { getUser, logout } from "~/lib";
import { VocabularyType } from "~/types";
import { debounce } from "@solid-primitives/scheduled";
import {
  deleteVocabulary,
  getCalendarTodayData,
  getVocabularyFromRange,
  submitTodayProgress,
  checkVocabulary,
  archiveVocabulary,
  getMemoriesLength,
  getSmallestWordNumberFromRange,
  updateArchiveWord,
  deleteSmallestWordNumberFromRange,
  searchText,
} from "~/lib/api";
import { Motion, Presence } from "solid-motionone";
import { useGlobalContext } from "~/globalcontext/store";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import FlipCard from "~/components/flipcard";
import Definition from "~/components/definition";
import Translation from "~/components/translation";
import Edit from "~/components/edit";
import Bookmark from "~/components/bookmark";
import { OcHourglass2 } from "solid-icons/oc";
import { BsTranslate, BsTrash3Fill } from "solid-icons/bs";
import { FaSolidFeather } from "solid-icons/fa";
import { ImBooks } from "solid-icons/im";
import { BiSolidHourglassTop } from "solid-icons/bi";
import { format } from "date-fns";
import styles from "./vocabulary.module.scss";
import buttons from "../../assets/styles/buttons.module.scss";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;

let timerRef: NodeJS.Timeout;
let audioRef: HTMLAudioElement;
let intervalCountdown: NodeJS.Timeout;
const [minutes, setMinutes] = createSignal(6);
const [isRunning, setIsRunning] = createSignal(false);

const Vocabulary: Component<{}> = () => {
  const [currentText, setCurrentText] = createSignal<VocabularyType>();
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
    handleGetCalendarTodayData();
  });

  createEffect(() => {
    if (searchResult().length > 0) {
      setSearchInputColor("#957c3e");
    }
  });

  //search text
  const trigger = debounce(async (str: string) => {
    const res = await searchText(str);
    if (res) {
      if (res.length === 0) {
        setSearchResult([]);
        setSearchInputColor("#ca140c");
        setTranslateTerm(str);
      } else {
        deleteBtnIndex() !== 0 && setDeleteBtnIndex(0);
        setSearchResult(res);
      }
    }
  }, 450);

  const [selectedItemIndex, setSelectedItemIndex] = createSignal<number>(0);

  const onKeyDownDiv: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (
    event
  ) => {
    // console.log(event);
    const keyDown = event.key;
    if (keyDown.match(/^[a-z\-]$/)) {
      setSearchTerm(searchTerm() + keyDown);
      if (searchTerm().length > 2) {
        trigger(searchTerm());
      }
    }
    if (keyDown?.match(/^[1-9]$/)) {
      const keyDonwNumber = Number(keyDown);
      if (searchResult().length > 0 && keyDonwNumber <= searchResult().length) {
        setSelectedItemIndex(Number(keyDown));
        setTimeout(() => {
          setSelectedItemIndex(0);
        }, 300);
        setTimeout(() => {
          handleRenderText(searchResult()[Number(keyDown) - 1]);
        }, 600);
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
    }

    if (keyDown === "Enter" && searchResult().length === 0)
      setShowTranslate(true);
  };

  const getMemoriesLengthAction = useAction(getMemoriesLength);
  const handleRenderText = async (text: VocabularyType) => {
    setCurrentText(text);
    setSearchTerm("");
    setSearchResult([]);

    // handlecheck

    if (text.number > 1) {
      checkVocabulary(text.number - 1, text.created_at);
    } else {
      await archiveVocabulary(text.word);
      const data = await getSmallestWordNumberFromRange(text.word);

      if (data) {
        await deleteSmallestWordNumberFromRange(data.created_at);
        await updateArchiveWord(data, text.created_at);
        const count = await getMemoriesLengthAction();
        setTotalMemories(count);
      } else {
        deleteVocabulary(text.created_at);
        const count = await getMemoriesLengthAction();
        setTotalMemories(count);
      }
    }
  };

  const handleCloseTranslation = () => {
    setShowTranslate(false);
    setTranslateTerm("");
  };

  // -------------------BOOKMARK START-------------------- //
  const [showBookmark, setShowBookmark] = createSignal<boolean>(false);
  // -------------------BOOKMARK END-------------------- //

  // -------------------TRANSLATE START-------------------- //
  const [translateTerm, setTranslateTerm] = createSignal<string>("");
  const [showTranslate, setShowTranslate] = createSignal(false);

  // -------------------TRANSLATE END-------------------- //
  // -------------------DELETE START-------------------- //
  const [deleteBtnIndex, setDeleteBtnIndex] = createSignal<number>(0);
  const handleDeleteVocabulary = (time: string) => {
    deleteVocabulary(time);
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

  const handleEditFromDefinition = (text: VocabularyType) => {
    setEditText({ ...text, number: text.number - 1 });
    setShowEdit(true);
  };
  // -------------------EDIT END-------------------- //
  // -------------------AUTOPLAY START-------------------- //
  const getVocabularyFromRangeAction = useAction(getVocabularyFromRange);
  const handleGetCalendarTodayData = async () => {
    let date = format(new Date(), "yyyy-MM-dd");
    const data = await getCalendarTodayData(date);
    if (data) setTodayData(data);
  };

  const handleAutoplay = () => {
    setAudioSrc("");
    handleRenderText(wordList()[counter()]);
    setCounter(counter() + 1);
  };

  const submitTodayProgressAction = useAction(submitTodayProgress);

  const startAutoplay = async () => {
    const newProgress =
      wordListType() === 1 ? todayData().time1 + 1 : todayData().time2 + 1;
    if (counter() === 0) {
      await submitTodayProgressAction(wordListType(), newProgress);
      handleGetCalendarTodayData();
    }
    handleAutoplay();
    timerRef = setInterval(() => {
      if (counter() < wordList().length) {
        handleAutoplay();
      } else {
        stopAutoplay();
        //get wordlist to update lastest changed
        handleEternalRecurrence();
      }
    }, 7500);
  };

  const handleEternalRecurrence = () => {
    const progress =
      wordListType() === 1 ? todayData().time1 : todayData().time2;
    if (progress < 9) {
      startCountdown();
    } else {
      setWordList([]);
      setWordListType(0);
    }
  };

  const pauseAutoplay = () => {
    clearInterval(timerRef);
  };

  const stopAutoplay = () => {
    clearInterval(timerRef);
    //wordlist index
    setCounter(0);
    //bottom button input background
    setBottomActive(false);
  };

  const {
    setBottomIndex,
    bottomActive,
    setBottomActive,
    counter,
    setCounter,
    wordList,
    setWordList,
    setTotalMemories,
    showMenubar,
    setShowMenubar,
    wordListType,
    setWordListType,
    todayData,
    setTodayData,
    audioSrc,
    setAudioSrc,
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

  const handleSetDailyWord = async (id: number) => {
    switch (id) {
      case 1:
        //get 50 word
        setWordListType(1);
        const data1 = await getVocabularyFromRangeAction(
          todayData().index1,
          todayData().index1 + 49
        );
        if (data1) {
          setWordList(data1);
        }
        setBottomIndex(todayData().index1 + 1);
        // stopAutoplay();
        break;
      case 2:
        //get 59word
        setWordListType(2);
        const data2 = await getVocabularyFromRangeAction(
          todayData().index2,
          todayData().index2 + 49
        );
        if (data2) {
          setWordList(data2);
        }
        setBottomIndex(todayData().index2 + 1);
        // stopAutoplay();
        break;
      default:
        break;
    }
  };

  // -------------------AUTOPLAY END-------------------- //
  // -------------------TIMMER START-------------------- //
  const showDesktopNotification = () => {
    const img = "https://cdn-icons-png.flaticon.com/512/2617/2617511.png";
    const letter = wordListType() === 1 ? "I" : "II";
    const newProgress =
      wordListType() === 1 ? todayData().time1 + 1 : todayData().time2 + 1;

    const notification = new Notification("Start Focusing", {
      icon: img,
      requireInteraction: true,
      body: `${letter}-${newProgress}`,
    });

    notification.onclose = () => {
      setBottomActive(true);
      setAudioSrc("");
      audioRef.pause();
    };
  };

  const startCountdown = () => {
    clearInterval(intervalCountdown);
    setIsRunning(true);
    intervalCountdown = setInterval(() => {
      setMinutes((prev: number) => {
        if (prev === 1) {
          clearInterval(intervalCountdown);
          setIsRunning(false);
          handleSetDailyWord(wordListType());
          showDesktopNotification();
          setAudioSrc("/sounds/09_Autumn_Mvt_3_Allegro.mp3");
          audioRef.play();
          return 6;
        }
        return prev - 1;
      });
    }, 60000);
  };

  const stopCountdown = () => {
    setIsRunning(false);
    clearInterval(intervalCountdown);
    setMinutes(6);
  };

  // -------------------TIMMER END-------------------- //
  // -------------------MOBILE START-------------------- //

  const [isMobile, setIsMobile] = createSignal(false);

  const onInputSearch: JSX.InputEventHandlerUnion<
    HTMLInputElement,
    InputEvent
  > = async (event: any) => {
    event.stopPropagation();
    const inputValue = event.target.value;
    setSearchTerm(inputValue);
    if (inputValue.length > 2) {
      trigger(searchTerm());
    }
  };

  // -------------------LOGOUT-------------------- //
  const logoutAction = useAction(logout);
  // -------------------LOGOUT-------------------- //

  return (
    <MetaProvider>
      <Title>{currentText()?.word || "main"}</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio
        hidden
        ref={audioRef}
        src={audioSrc()}
        onloadeddata={() => audioRef.play()}
        onended={() => setAudioSrc("")}
      ></audio>
      <Motion.div
        class={styles.vocabularyContainer}
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.6 }}
      >
        <div
          ref={divRef}
          tabIndex={0}
          onMouseOver={() => divRef?.focus()}
          onKeyDown={onKeyDownDiv}
          class={styles.vocabulary}
        >
          <div class={styles.flashCardContainer}>
            <FlipCard item={currentText()!} />
          </div>

          <Show
            when={isMobile()}
            fallback={
              <>
                <div class={styles.newInputContainer}>
                  <div class={styles.newInputContent}>
                    <div class={styles.newInputBackground}>
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
            <div class={styles.myInputContainer}>
              <img
                src="/images/main/input-left-corner.png"
                class={styles.myInputLeftOrnament}
              />
              <div class={styles.myInputCenterContent}>
                <input
                  class={styles.myInput}
                  value={searchTerm()}
                  onInput={onInputSearch}
                />
              </div>
              <img
                src="/images/main/input-right-corner.png"
                class={styles.myInputRightOrnament}
              />
              <img
                src="/images/main/center.png"
                class={styles.myInputButton}
                onClick={() => {
                  setSearchResult([]);
                  setSearchTerm("");
                }}
              />
            </div>
          </Show>

          <Show when={searchResult().length > 0}>
            <div class={styles.searchContainer}>
              <div>
                <Index each={searchResult()}>
                  {(data, i: number) => (
                    <div
                      class={
                        i + 1 === selectedItemIndex()
                          ? `${styles.myItem} ${styles.myItemHover}`
                          : styles.myItem
                      }
                    >
                      <div
                        class={`${styles.myItemButton} ${styles.myItemButtonStart}`}
                        onClick={() => handleEditVocabulary(data())}
                      >
                        <div class={styles.myItemNum}>
                          <p>{i + 1}</p>
                        </div>
                        <button class={styles.myItemEditButton}>
                          <FaSolidFeather size={12} color="#ffffff" />
                        </button>
                      </div>
                      <div
                        class={styles.myItemText}
                        onclick={() => handleRenderText(data())}
                      >
                        <p>{data().word}</p>
                      </div>
                      <div
                        class={`${styles.myItemButton} ${styles.myItemButtonEnd}`}
                      >
                        <Show when={i + 1 !== deleteBtnIndex()}>
                          <button
                            class={styles.myItemDeleteButton}
                            onClick={() => setDeleteBtnIndex(i + 1)}
                          ></button>
                        </Show>
                        <Show when={i + 1 === deleteBtnIndex()}>
                          <button
                            class={styles.myItemDeleteButton}
                            onClick={() =>
                              handleDeleteVocabulary(data().created_at)
                            }
                          >
                            <BsTrash3Fill size={12} color="#ca140c" />
                          </button>
                        </Show>
                      </div>
                    </div>
                  )}
                </Index>
              </div>
            </div>
          </Show>

          <div class={styles.vocabularyContent}>
            {/* Bookmark */}
            <Show when={showBookmark()}>
              <Bookmark onClose={() => setShowBookmark(false)} />
            </Show>

            {/* Definition */}
            <Show when={currentText()?.word}>
              <Definition
                item={currentText()!}
                onEdit={handleEditFromDefinition}
              />
            </Show>
          </div>

          <Presence>
            <Show when={showMenubar()}>
              <Motion.div
                class={styles.menubar}
                initial={{
                  opacity: 0,
                  bottom: "-150px",
                }}
                animate={{
                  opacity: 1,
                  bottom: 0,
                }}
                exit={{
                  opacity: 0,
                  bottom: "-150px",
                }}
                transition={{ duration: 0.3, easing: "ease-in-out" }}
              >
                <div class={styles.menubarContent}>
                  <button
                    class={
                      wordListType() === 1
                        ? `${buttons.buttonMenuWordlist} ${buttons.buttonMenuWordlistActive}`
                        : buttons.buttonMenuWordlist
                    }
                    onClick={() => {
                      handleSetDailyWord(1);
                      setShowMenubar(false);
                    }}
                  >
                    <span>I</span>
                    <small>{todayData().time1}</small>
                  </button>
                  <button
                    class={
                      wordListType() === 2
                        ? `${buttons.buttonMenuWordlist} ${buttons.buttonMenuWordlistActive}`
                        : buttons.buttonMenuWordlist
                    }
                    onClick={() => {
                      handleSetDailyWord(2);
                      setShowMenubar(false);
                    }}
                  >
                    <span>II</span>
                    <small>{todayData().time2}</small>
                  </button>
                  <button
                    class={buttons.buttonMenu}
                    onClick={() => {
                      setShowBookmark(true);
                      setShowMenubar(false);
                    }}
                  >
                    <ImBooks size={18} />
                  </button>
                  <button
                    class={buttons.buttonMenu}
                    onClick={() => {
                      setShowTranslate(true);
                      setShowMenubar(false);
                    }}
                  >
                    <BsTranslate size={15} />
                  </button>
                  <button
                    class={buttons.buttonMenu}
                    onClick={() => {
                      startCountdown();
                      setShowMenubar(false);
                    }}
                  >
                    <BiSolidHourglassTop size={16} />
                  </button>
                  <button
                    class={buttons.buttonMenu}
                    onClick={() => logoutAction()}
                  >
                    E
                  </button>
                </div>
              </Motion.div>
            </Show>
          </Presence>

          <Presence>
            <Show when={isRunning()}>
              <Motion.button
                class={buttons.buttonTimer}
                onClick={stopCountdown}
                initial={{
                  opacity: 0,
                  bottom: "-27px",
                }}
                animate={{
                  opacity: 1,
                  bottom: "1px",
                }}
                exit={{
                  opacity: 0,
                  bottom: "-27px",
                }}
                transition={{ duration: 0.3, easing: "ease-in-out" }}
              >
                <OcHourglass2 size={11} />
                <Motion.div
                  class={styles.buttonTimerOverlay}
                  animate={{ height: `${(1 - minutes() / 6) * 100}%` }}
                ></Motion.div>
              </Motion.button>
            </Show>
          </Presence>
        </div>
        {/* Edit */}
        <Presence>
          <Show when={showEdit()}>
            <Motion.div
              class={styles.editOverlay}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{ duration: 0.2, easing: "ease-in-out" }}
            >
              <Edit item={editText()!} onClose={handleCloseEdit} />
            </Motion.div>
          </Show>
        </Presence>

        {/* Translation */}
        <Presence>
          <Show when={showTranslate()}>
            <Motion.div
              class={styles.editOverlay}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{ duration: 0.2, easing: "ease-in-out" }}
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
