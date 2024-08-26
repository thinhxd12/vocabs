import {
  Component,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import styles from "./flipcard.module.scss";
import { mainStore, setMainStore } from "~/lib/mystore";
import Flips from "./Flips";
import { Motion, Presence } from "solid-motionone";
import { debounce } from "@solid-primitives/scheduled";
import { searchText } from "~/lib/api";

const FlipCard: Component<{}> = (props) => {
  let audio: HTMLAudioElement | null;
  let timeoutId: NodeJS.Timeout;

  const [flag, setFlag] = createSignal<boolean>(false);
  const [showNumber, setShowNumber] = createSignal<boolean>(false);

  createEffect(() => {
    clearTimeout(timeoutId);
    const v = mainStore.renderWord;
    if (v) {
      audio = new Audio();
      const currentSound = v.audio;
      const translations = v.translations
        .map((item) => item.translations.join(", "))
        .join(", ");

      if (currentSound) {
        audio.src = currentSound;
        audio.play();
      }

      setShowNumber(true);
      if (translations) {
        timeoutId = setTimeout(() => {
          const soundUrl = `https://vocabs3.vercel.app/speech?text=${translations}`;
          audio!.src = soundUrl;
          audio!.play();
          setShowNumber(false);
        }, 3500);
      }
    }
    untrack(() => {
      setFlag(!flag());
    });
    onCleanup(() => {
      audio?.pause();
      audio = null;
      clearTimeout(timeoutId);
    });
  });

  // -------------------MOBILE START-------------------- //
  const [isMobile, setIsMobile] = createSignal<boolean>(false);

  onMount(async () => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  });

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

  const searchWordMobile = (element: HTMLDivElement) => {
    element.addEventListener("input", (e) => {
      const value = (e.target as HTMLInputElement).value.toLowerCase();
      setMainStore("searchTerm", value);
      if (value.length > 2) {
        trigger(value);
      }
    });
  };

  const clearSearchResult = (e: any) => {
    setMainStore("searchTerm", "");
    setMainStore("searchTermColor", "#ffffff");
    e.currentTarget.value = "";
  };
  // -------------------MOBILE END-------------------- //

  return (
    <div class={styles.flipCard}>
      <div class={styles.flipCardTextContainer}>
        <Show
          when={isMobile()}
          fallback={
            <div class={styles.flipCardTextWord}>
              <span class={styles.flipCardTextNumber}>
                {mainStore.renderWord && mainStore.renderWord!.number - 1}
              </span>
              <p
                style={{
                  color: mainStore.searchTermColor,
                }}
              >
                {mainStore.searchTerm || mainStore.renderWord?.word}
              </p>
              <span class={styles.flipCardTextPhonetic}>
                {mainStore.renderWord && mainStore.renderWord!.phonetics}
              </span>
            </div>
          }
        >
          <div class={styles.flipCardTextWord}>
            <span class={styles.flipCardTextNumber}>
              {mainStore.renderWord && mainStore.renderWord!.number - 1}
            </span>
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
            <span class={styles.flipCardTextPhonetic}>
              {mainStore.renderWord && mainStore.renderWord!.phonetics}
            </span>
          </div>
        </Show>
      </div>

      <Presence>
        <Show when={showNumber()}>
          <Motion.div
            class={styles.flipCardNumberContainer}
            initial={{
              y: "-100%",
              opacity: 0,
            }}
            animate={{ y: 0, opacity: 1 }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
            transition={{ duration: 0.25, easing: "ease-in-out" }}
          >
            <div class={styles.ticksContainer}>
              <Show when={flag()} fallback={<Flips />}>
                <Flips />
              </Show>
            </div>
          </Motion.div>
        </Show>
      </Presence>

      <Presence>
        <Show when={showNumber()}>
          <Motion.div
            class={styles.flipCardNumberContainerBackground}
            animate={{ y: 0, opacity: 1 }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
            transition={{ duration: 0.25, easing: "ease-in-out" }}
          ></Motion.div>
        </Show>
      </Presence>
    </div>
  );
};

export default FlipCard;
