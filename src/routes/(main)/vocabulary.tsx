import { Component, Index, Show, createSignal, lazy, onMount } from "solid-js";
import { VocabularySearchType, VocabularyType } from "~/types";
import { debounce } from "@solid-primitives/scheduled";
import {
  deleteVocabulary,
  searchText,
  handleCheckWord,
  getWordData,
} from "~/lib/api";
import { Motion, Presence } from "solid-motionone";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { BsTrash3Fill } from "solid-icons/bs";
import { FaSolidFeather } from "solid-icons/fa";
import { createAsync } from "@solidjs/router";
import { mainStore, setMainStore } from "~/lib/mystore";
import styles from "./vocabulary.module.scss";
import buttons from "../../assets/styles/buttons.module.scss";
import FlipCard from "~/components/flipcard";
import Definition from "~/components/definition";
import { getUser } from "~/lib";
const Translation = lazy(() => import("~/components/translation"));
const Edit = lazy(() => import("~/components/edit"));
const Bookmark = lazy(() => import("~/components/bookmark"));

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      searchWordMobile: null;
    }
  }
}

let mobileInput: HTMLInputElement;

const Vocabulary: Component<{}> = () => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  //search text
  const trigger = debounce(async (str: string) => {
    const res = await searchText(str);
    if (res) {
      if (res.length === 0) {
        setMainStore("searchTermColor", "#ca140c");
      }
      setMainStore("searchResult", res);
      mainStore.searchDeleteIndex !== 0 && setMainStore("searchDeleteIndex", 0);
    }
  }, 450);

  const handleRenderText = async (text: VocabularySearchType) => {
    if (mobileInput) mobileInput.value = "";
    setMainStore("searchTerm", "");
    setMainStore("searchResult", []);
    handleCheckWord(text);
  };

  // -------------------DELETE START-------------------- //
  const handleDeleteVocabulary = (time: string) => {
    setMainStore("searchTerm", "");
    setMainStore("searchResult", []);
    deleteVocabulary(time);
  };
  // -------------------DELETE END-------------------- //

  // -------------------EDIT START-------------------- //
  const [editWord, setEditWord] = createSignal<VocabularyType>();
  const handleEditVocabulary = async (text: VocabularySearchType) => {
    const wordData = await getWordData(text.created_at);
    setEditWord(wordData);
    setMainStore("showEdit", true);
    setMainStore("searchTerm", "");
    setMainStore("searchResult", []);
  };

  const handleEditVocabularyFromDefinition = (text: VocabularyType) => {
    setEditWord({ ...text, number: text.number - 1 });
    setMainStore("showEdit", true);
    setMainStore("searchTerm", "");
    setMainStore("searchResult", []);
  };
  // -------------------EDIT END-------------------- //

  // -------------------MOBILE START-------------------- //
  const [isMobile, setIsMobile] = createSignal(false);

  onMount(async () => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  });

  const searchWordMobile = (element: HTMLDivElement) => {
    element.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value.toLowerCase();
      setMainStore("searchTerm", value);
      if (value.length > 2) {
        trigger(value);
      }
    });
  };
  // -------------------MOBILE END-------------------- //

  const clearSearchResult = () => {
    setMainStore("searchTerm", "");
    setMainStore("searchResult", []);
    mobileInput.value = "";
  };

  return (
    <MetaProvider>
      <Title>{mainStore.renderWord?.word || "main"}</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div class={styles.vocabularyContainer}>
        <div class={styles.vocabulary}>
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
                      src="images/main/inputbackground.webp"
                      height={33}
                      width={360}
                      alt="inputbackground"
                      class={styles.newInputBackground}
                    />
                    <p style={{ color: mainStore.searchTermColor }}>
                      {mainStore.searchTerm}
                    </p>
                  </div>
                </div>
              </>
            }
          >
            <div class={styles.myInputContainer}>
              <img
                src="images/main/inputbackground.webp"
                height={33}
                width={360}
                alt="inputbackground"
                class={styles.myInputBackground}
              />
              <input
                type="text"
                autocomplete="off"
                class={styles.myInput}
                use:searchWordMobile={null}
                ref={mobileInput}
              />
              <button class={buttons.buttonMyInput} onClick={clearSearchResult}>
                <img src="images/main/clover.webp" height={18} width={18} />
              </button>
            </div>
          </Show>

          <Show when={mainStore.searchResult.length > 0}>
            <div class={styles.searchContainer}>
              <div>
                <Index each={mainStore.searchResult}>
                  {(data, i: number) => (
                    <div
                      class={
                        i + 1 === mainStore.searchSelectedIndex
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
                        <Show when={i + 1 !== mainStore.searchDeleteIndex}>
                          <button
                            class={styles.myItemDeleteButton}
                            onClick={() =>
                              setMainStore("searchDeleteIndex", i + 1)
                            }
                          ></button>
                        </Show>
                        <Show when={i + 1 === mainStore.searchDeleteIndex}>
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
            {/* Definition */}
            <Definition
              onEdit={() =>
                handleEditVocabularyFromDefinition(mainStore.renderWord!)
              }
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
              <Translation translateText={mainStore.translateTerm} />
            </Motion.div>
          </Show>
        </Presence>
      </div>
    </MetaProvider>
  );
};

export default Vocabulary;
