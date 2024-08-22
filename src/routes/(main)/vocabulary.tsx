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
import FlipCard from "~/components/flipcard";
import Definition from "~/components/definition";
import { getUser } from "~/lib";
const Translation = lazy(() => import("~/components/translation"));
const Edit = lazy(() => import("~/components/edit"));

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      searchWordMobile: null;
    }
  }
}

const Vocabulary: Component<{}> = () => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  //search text
  const trigger = debounce(async (str: string) => {
    const res = await searchText(str);
    if (res) {
      if (res.length === 0) {
        setMainStore("searchTermColor", "#f90000");
      }
      setMainStore("searchResult", res);
      mainStore.searchDeleteIndex !== 0 && setMainStore("searchDeleteIndex", 0);
    }
  }, 450);

  const handleRenderText = async (text: VocabularySearchType) => {
    setMainStore("searchTermColor", "#ffffffe6");
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

  return (
    <MetaProvider>
      <Title>{mainStore.renderWord?.word || "main"}</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div class={styles.vocabulary}>
        <div class={styles.flipCardContent}>
          <FlipCard />
        </div>
        <img
          src="images/main/input-wall.webp"
          height={33}
          width={360}
          alt="inputbackground"
          class={styles.vocabularyBackground}
        />
        <div class={styles.vocabularyContent}>
          <Show when={mainStore.searchResult.length > 0}>
            <div class={styles.searchContainer}>
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
          </Show>

          <Definition
            onEdit={() =>
              handleEditVocabularyFromDefinition(mainStore.renderWord!)
            }
          />

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
      </div>
    </MetaProvider>
  );
};

export default Vocabulary;
