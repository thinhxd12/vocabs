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

const FlipCard: Component<{}> = (props) => {
  let audio: HTMLAudioElement | null;
  let timeoutId1: NodeJS.Timeout;
  let timeoutId2: NodeJS.Timeout;

  const [hoverClassNumber, setHoverClassNumber] = createSignal<string>(
    styles.flipCardNumberContainer
  );
  const [flag, setFlag] = createSignal<boolean>(false);

  createEffect(() => {
    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);
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

      setHoverClassNumber(styles.flipCardNumberContainer);
      if (translations) {
        timeoutId1 = setTimeout(() => {
          setHoverClassNumber(
            `${styles.flipCardNumberContainer} ${styles.flipCardNumberContainerFadeOut}`
          );
          const soundUrl = `https://vocabs3.vercel.app/speech?text=${translations}`;
          audio!.src = soundUrl;
          audio!.play();
        }, 3500);
        timeoutId2 = setTimeout(() => {
          setHoverClassNumber(
            `${styles.flipCardNumberContainer} ${styles.flipCardNumberContainerHidden}`
          );
        }, 4800);
      }
    }
    untrack(() => {
      setFlag(!flag());
    });
    onCleanup(() => {
      audio?.pause();
      audio = null;
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
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
        <div class={hoverClassNumber()}>
          <div class={styles.ticksContainer}>
            <Show when={flag()} fallback={<Flips />}>
              <Flips />
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default FlipCard;
