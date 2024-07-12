import {
  Component,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";
import styles from "./flipcard.module.scss";
import { mainStore } from "~/lib/mystore";
import Flips from "./Flips";
import { Motion, Presence } from "solid-motionone";

const FlipCard: Component<{}> = (props) => {
  let audio: HTMLAudioElement | null;
  let timeoutId1: NodeJS.Timeout;

  const [flag, setFlag] = createSignal<boolean>(false);
  const [showNumber, setShowNumber] = createSignal<boolean>(false);

  createEffect(() => {
    clearTimeout(timeoutId1);
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
        timeoutId1 = setTimeout(() => {
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
      clearTimeout(timeoutId1);
    });
  });

  return (
    <div class={styles.flashCardContainer}>
      <Show when={!mainStore.searchTerm}>
        <Show when={mainStore.renderWord}>
          <div class={styles.flipcardTextContainer}>
            <div class={styles.flipcardTextContent}>
              <p class={styles.flipcardText}>{mainStore.renderWord!.word}</p>
              <p class={styles.flipcardPhonetic}>
                <span>{mainStore.renderWord!.phonetics}</span>
                <small>({mainStore.renderWord!.number - 1})</small>
              </p>
              <p class={styles.flipcardText}>{mainStore.renderWord!.word}</p>
            </div>
          </div>
        </Show>
      </Show>

      <Show when={mainStore.renderWord}>
        <Presence>
          <Show when={showNumber()}>
            <Motion.div
              class={styles.flipCardNumberContainer}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.3 },
              }}
            >
              <div class={styles.ticksContainer}>
                <Show when={flag()} fallback={<Flips />}>
                  <Flips />
                </Show>
              </div>
            </Motion.div>
          </Show>
        </Presence>
      </Show>
    </div>
  );
};

export default FlipCard;
