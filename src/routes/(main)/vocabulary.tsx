import {
  Component,
  Index,
  Show,
  createEffect,
  createSignal,
  lazy,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
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
import Definition from "~/components/definition";
import { getUser } from "~/lib";
import Flips from "~/components/Flips";
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
        setMainStore("searchTermColor", "#000000");
      }
      setMainStore("searchResult", res);
      mainStore.searchDeleteIndex !== 0 && setMainStore("searchDeleteIndex", 0);
    }
  }, 450);

  const handleRenderText = async (text: VocabularySearchType) => {
    setMainStore("searchTermColor", "#ffffff");
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
  const [isMobile, setIsMobile] = createSignal<boolean>(false);

  onMount(async () => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  });

  const triggerMobile = debounce(async (str: string) => {
    const res = await searchText(str);
    if (res) {
      if (res.length === 0) {
        setMainStore("searchTermColor", "#000000");
      }
      setMainStore("searchResult", res);
      mainStore.searchDeleteIndex !== 0 && setMainStore("searchDeleteIndex", 0);
    }
  }, 450);

  const searchWordMobile = (element: HTMLDivElement) => {
    element.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value.toLowerCase();
      setMainStore("searchTerm", value);
      if (value.length > 2) {
        triggerMobile(value);
      }
    });
  };

  const clearSearchResult = (e: any) => {
    setMainStore("searchTerm", "");
    setMainStore("searchTermColor", "#ffffff");
    e.currentTarget.value = "";
  };
  // -------------------MOBILE END-------------------- //

  let audio1: HTMLAudioElement | null;
  let audio2: HTMLAudioElement | null;
  let timeoutId: NodeJS.Timeout;

  const [flag, setFlag] = createSignal<boolean>(false);
  const [showNumber, setShowNumber] = createSignal<boolean>(false);

  createEffect(() => {
    clearTimeout(timeoutId);
    const v = mainStore.renderWord;
    if (v) {
      audio1 = new Audio();
      const currentSound = v.audio;
      const translations = v.translations
        .map((item) => item.translations.join(", "))
        .join(", ");

      if (currentSound) {
        audio1.src = currentSound;
        audio1.play();
      }

      setShowNumber(true);
      if (translations) {
        timeoutId = setTimeout(() => {
          const soundUrl = `https://vocabs3.vercel.app/speech?text=${translations}`;
          audio2 = new Audio();
          audio2.src = soundUrl;
          audio2.play();
          setShowNumber(false);
        }, 3500);
      }
    }
    untrack(() => {
      setFlag(!flag());
    });
    onCleanup(() => {
      audio1 = audio2 = null;
      clearTimeout(timeoutId);
    });
  });

  return (
    <MetaProvider>
      <Title>{mainStore.renderWord?.word || "main"}</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div class={styles.vocabulary}>
        <div class={styles.flipCardTextContainer}>
          <Show
            when={isMobile()}
            fallback={
              <div class={styles.flipCardTextWord}>
                <div
                  class={styles.flipCardTextWordContent}
                  style={{
                    color: mainStore.searchTermColor,
                  }}
                >
                  {mainStore.searchTerm || mainStore.renderWord?.word}
                  <Show when={mainStore.renderWord}>
                    <span class={styles.flipCardTextNumber}>
                      {showNumber()
                        ? mainStore.renderWord!.number
                        : mainStore.renderWord!.number - 1}
                    </span>
                  </Show>
                </div>
                <span class={styles.flipCardTextPhonetic}>
                  {mainStore.renderWord && mainStore.renderWord!.phonetics}
                </span>
              </div>
            }
          >
            <div class={styles.flipCardTextWord}>
              <input
                type="text"
                autocomplete="off"
                value={mainStore.renderWord?.word || ""}
                use:searchWordMobile={null}
                onfocus={(e) => (e.currentTarget.value = "")}
                onblur={(e) => clearSearchResult(e)}
                style={{
                  color: mainStore.searchTermColor,
                }}
              />
              <div class={styles.flipCardTextPhoneticMobile}>
                <Show when={mainStore.renderWord}>
                  <span class={styles.flipCardTextNumberMobile}>
                    {showNumber()
                      ? mainStore.renderWord!.number
                      : mainStore.renderWord!.number - 1}
                  </span>
                </Show>
                {mainStore.renderWord && mainStore.renderWord!.phonetics}
              </div>
            </div>
          </Show>
        </div>

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
                        onClick={() => setMainStore("searchDeleteIndex", i + 1)}
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

        <div class={styles.vocabularyContent}>
          <Motion.div
            animate={{
              y: showNumber() ? 0 : -180,
            }}
            transition={{ duration: 0.3, easing: "ease" }}
          >
            <Show when={mainStore.renderWord}>
              <div class={styles.ticksContainer}>
                <Show when={flag()} fallback={<Flips />}>
                  <Flips />
                </Show>
              </div>
            </Show>
            <Definition
              item={mainStore.renderWord!}
              onEdit={() =>
                handleEditVocabularyFromDefinition(mainStore.renderWord!)
              }
            />
          </Motion.div>
        </div>

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
    </MetaProvider>
  );
};

export default Vocabulary;
