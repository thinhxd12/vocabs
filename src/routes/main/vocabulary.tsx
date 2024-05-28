import {
  Component,
  Index,
  JSX,
  Show,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import { VocabularyType } from "~/types";
import { debounce } from "@solid-primitives/scheduled";
import {
  deleteVocabulary,
  searchText,
  handleCheckWord,
  getTodayData,
} from "~/lib/api";
import { Motion, Presence } from "solid-motionone";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import FlipCard from "~/components/flipcard";
import Definition from "~/components/definition";
import Translation from "~/components/translation";
import Edit from "~/components/edit";
import Bookmark from "~/components/bookmark";
import { BsTrash3Fill } from "solid-icons/bs";
import { FaSolidFeather } from "solid-icons/fa";
import { format } from "date-fns";
import styles from "./vocabulary.module.scss";
import { getUser } from "~/lib";
import { createAsync } from "@solidjs/router";
import { mainStore, setListStore, setMainStore } from "~/lib/mystore";

const Vocabulary: Component<{}> = () => {
  // ***************check login**************
  const user = createAsync(() => getUser());
  // ***************check login**************

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
    handleGetTodayData();
  });

  createEffect(() => {
    if (searchResult().length > 0) {
      setSearchInputColor("#957c3e");
    }
  });

  const handleGetTodayData = async () => {
    const todayDate = format(new Date(), "yyyy-MM-dd");
    const data = await getTodayData(todayDate);
    if (data) {
      setListStore("listToday", data);
    }
  };

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
      setMainStore("showTranslate", true);
  };

  const handleRenderText = async (text: VocabularyType) => {
    setSearchTerm("");
    setSearchResult([]);
    handleCheckWord(text);
  };

  // -------------------TRANSLATE START-------------------- //
  const [translateTerm, setTranslateTerm] = createSignal<string>("");
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

  // -------------------MOBILE END-------------------- //

  return (
    <MetaProvider>
      <Title>{mainStore.renderWord?.word || "main"}</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />

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
            <FlipCard item={mainStore.renderWord!} />
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
            {/* <button onClick={test}>click</button> */}

            {/* Bookmark */}
            <Show when={mainStore.showBookmark}>
              <Bookmark onClose={() => setMainStore("showBookmark", false)} />
            </Show>

            {/* Definition */}
            <Show when={mainStore.renderWord}>
              <Definition
                item={mainStore.renderWord!}
                onEdit={handleEditFromDefinition}
              />
            </Show>
          </div>

          {/* <Presence>
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
                  <button class={buttons.buttonMenu} onClick={handleLogout}>
                    E
                  </button>
                </div>
              </Motion.div>
            </Show>
          </Presence> */}

          {/* <Presence>
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
          </Presence> */}
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
          <Show when={mainStore.showTranslate}>
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
                onClose={() => setMainStore("showTranslate", false)}
              />
            </Motion.div>
          </Show>
        </Presence>
      </Motion.div>
    </MetaProvider>
  );
};

export default Vocabulary;
