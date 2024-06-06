import {
  Accessor,
  Component,
  Index,
  Show,
  Signal,
  createEffect,
  createSignal,
  lazy,
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
import { BsTrash3Fill } from "solid-icons/bs";
import { FaSolidFeather } from "solid-icons/fa";
import { format } from "date-fns";
import { createAsync } from "@solidjs/router";
import { mainStore, setListStore, setMainStore } from "~/lib/mystore";
import styles from "./vocabulary.module.scss";
import FlipCard from "~/components/flipcard";
import Definition from "~/components/definition";
import { getUser } from "~/lib";
const Translation = lazy(() => import("~/components/translation"));
const Edit = lazy(() => import("~/components/edit"));
const Bookmark = lazy(() => import("~/components/bookmark"));

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      searchWord: Signal<VocabularyType[]>;
    }
  }
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      searchWordMobile: Signal<string>;
    }
  }
}

let mobileInput: HTMLInputElement;

const todayDate = format(new Date(), "yyyy-MM-dd");
export const route = {
  load: () =>
    getTodayData(todayDate).then((data) => {
      if (data) {
        setListStore("listToday", data);
      }
    }),
};

const Vocabulary: Component<{}> = () => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const [searchResult, setSearchResult] = createSignal<VocabularyType[]>([]);
  const [searchTerm, setSearchTerm] = createSignal<string>("");

  const [searchInputColor, setSearchInputColor] =
    createSignal<string>("#957c3e");

  onMount(async () => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
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

  const handleRenderText = async (text: VocabularyType) => {
    if (mobileInput) mobileInput.value = "";
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
  const [editWord, setEditWord] = createSignal<VocabularyType>();
  const handleEditVocabulary = (text: VocabularyType) => {
    setEditWord(text);
    setMainStore("showEdit", true);
    setSearchTerm("");
    setSearchResult([]);
  };
  // -------------------EDIT END-------------------- //

  // -------------------MOBILE START-------------------- //
  const [isMobile, setIsMobile] = createSignal(false);
  // -------------------MOBILE END-------------------- //

  const searchWord = (
    element: HTMLDivElement,
    value: Accessor<Signal<VocabularyType[]>>
  ) => {
    const [field, setField] = value();
    element.addEventListener("keydown", (e) => {
      const keyDown = e.key;
      if (keyDown.match(/^[a-zA-Z\-]$/)) {
        setSearchTerm(searchTerm() + String(keyDown).toLowerCase());
        if (searchTerm().length > 2) {
          trigger(searchTerm());
        }
      }
      if (keyDown?.match(/^[1-9]$/)) {
        const keyDonwNumber = Number(keyDown);
        if (field().length > 0 && keyDonwNumber <= field().length) {
          setSelectedItemIndex(Number(keyDown));
          setTimeout(() => {
            setSelectedItemIndex(0);
          }, 300);
          setTimeout(() => {
            handleRenderText(field()[Number(keyDown) - 1]);
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
        setSearchTerm("");
        setField([]);
      }
      if (keyDown === "Enter" && field().length === 0)
        setMainStore("showTranslate", true);
    });
  };

  const searchWordMobile = (
    element: HTMLDivElement,
    value: Accessor<Signal<string>>
  ) => {
    const [field, setField] = value();
    element.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value;
      setField(value);
      if (field().length > 2) {
        trigger(field());
      }
    });
  };

  const clearSearchResult = () => {
    setSearchTerm("");
    setSearchResult([]);
    mobileInput.value = "";
  };

  return (
    <MetaProvider>
      <Title>{mainStore.renderWord?.word || "main"}</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div
        class={styles.vocabularyContainer}
        use:searchWord={[searchResult, setSearchResult]}
      >
        <div tabIndex={0} class={styles.vocabulary}>
          <div class={styles.flashCardContainer}>
            <FlipCard />
          </div>

          <Show
            when={isMobile()}
            fallback={
              <>
                <div class={styles.newInputContainer}>
                  <div class={styles.newInputContent}>
                    <img
                      src="/images/main/inputbackground.webp"
                      width={360}
                      height={36}
                      class={styles.newInputBackground}
                    />
                    <Motion.p
                      animate={{ color: searchInputColor() }}
                      transition={{ duration: 0.3, easing: "ease" }}
                    >
                      {searchTerm()}
                    </Motion.p>
                  </div>
                </div>
              </>
            }
          >
            <div class={styles.myInputContainer}>
              <img
                src="/images/main/input-left-corner.webp"
                class={styles.myInputLeftOrnament}
                height={38}
              />
              <div class={styles.myInputCenterContent}>
                <input
                  type="text"
                  autocomplete="off"
                  class={styles.myInput}
                  use:searchWordMobile={[searchTerm, setSearchTerm]}
                  ref={mobileInput}
                />
              </div>
              <img
                src="/images/main/input-right-corner.webp"
                class={styles.myInputRightOrnament}
                height={38}
              />
              <img
                src="/images/main/center.webp"
                class={styles.myInputButton}
                height={24}
                onClick={clearSearchResult}
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
            {/* <button onClick={() => getSoundUrl("xin chào")}>click</button> */}

            {/* Bookmark */}
            <Show when={mainStore.showBookmark}>
              <Bookmark onClose={() => setMainStore("showBookmark", false)} />
            </Show>

            {/* Definition */}
            <Definition
              onEdit={() => handleEditVocabulary(mainStore.renderWord!)}
            />
          </div>
        </div>
        {/* Edit */}
        <Presence>
          <Show when={mainStore.showEdit}>
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
              <Edit word={editWord()!} />
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
              <Translation translateText={translateTerm()} />
            </Motion.div>
          </Show>
        </Presence>
      </div>
    </MetaProvider>
  );
};

export default Vocabulary;
