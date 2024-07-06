import {
  Component,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import styles from "./flipcard.module.scss";
import { mainStore } from "~/lib/mystore";

const FlipCard: Component<{}> = (props) => {
  let audio: HTMLAudioElement | null;
  let timeoutId1: NodeJS.Timeout;
  let timeoutId2: NodeJS.Timeout;
  let timeoutId3: NodeJS.Timeout;

  const [hoverClassText, setHoverClassText] = createSignal<string>("");
  const [hoverClassNumber, setHoverClassNumber] = createSignal<string>("");

  const createNumberArray = (num: number) => {
    let arr = Array.from(String(num), Number);
    while (arr.length < 3) {
      arr.unshift(0);
    }
    return arr;
  };

  const [renderNumber, setRenderNumber] = createSignal<number>(3);
  const [numbArray, setNumbArray] = createSignal<number[]>([3, 6, 9]);

  const currenText = createMemo(() => mainStore.renderWord!);

  createEffect(() => {
    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);
    clearTimeout(timeoutId3);

    if (currenText()) {
      audio = new Audio();
      let currentSound = currenText().audio;
      let translations = currenText()
        .translations.map((item) => item.translations.join(", "))
        .join(", ");

      if (currentSound) {
        audio.src = currentSound;
        audio.play();
      }

      setRenderNumber(currenText().number);
      setHoverClassText(styles.flipcardTextContent);
      setHoverClassNumber(styles.flipCardNumberContainer);
      setNumbArray(createNumberArray(currenText().number));
      timeoutId1 = setTimeout(() => {
        setRenderNumber(renderNumber() - 1);
        setNumbArray(createNumberArray(renderNumber()));
      }, 1500);

      if (translations) {
        timeoutId2 = setTimeout(() => {
          setHoverClassNumber(
            `${styles.flipCardNumberContainer} ${styles.flipCardNumberContainerFadeOut}`
          );
          const soundUrl = `https://vocabs3.vercel.app/speech?text=${translations}`;
          audio!.src = soundUrl;
          audio!.play();
        }, 3500);

        timeoutId3 = setTimeout(() => {
          setHoverClassNumber(
            `${styles.flipCardNumberContainer} ${styles.flipCardNumberContainerHidden}`
          );
        }, 4500);
      }
    }
    onCleanup(() => {
      audio?.pause();
      audio = null;
    });
  });

  return (
    <div class={styles.flashCardContainer}>
      <Show when={!mainStore.searchTerm}>
        <Show when={currenText()}>
          <div class={styles.flipcardTextContainer}>
            <div class={hoverClassText()}>
              <p class={styles.flipcardText}>{currenText()?.word}</p>
              <p class={styles.flipcardPhonetic}>
                {currenText()?.phonetics}
                <small>({currenText()?.number - 1})</small>
              </p>
              <p class={styles.flipcardText}>{currenText()?.word}</p>
            </div>
          </div>
        </Show>
      </Show>

      <div class={hoverClassNumber()}>
        <Show when={currenText()}>
          <Show
            when={currenText().number > 1}
            fallback={
              <div class={styles.numberFlipContent}>
                <div class={styles.numbersContentImg}>
                  <div
                    class={styles.numbers}
                    style={{
                      transform:
                        renderNumber() === 0
                          ? `translate(0px, 15px)`
                          : `translate(0px, -85px)`,
                      transition: "0.3s",
                    }}
                  >
                    <img
                      src="images/main/cup.webp"
                      height={80}
                      alt="flag"
                      loading="lazy"
                    />
                    <span class={styles.number}>1</span>
                  </div>
                </div>
              </div>
            }
          >
            <div class={styles.numberFlipContent}>
              <div class={styles.numbersContent}>
                <Show when={renderNumber() >= 100}>
                  <div
                    class={styles.numbers}
                    style={{
                      // width: numbArray()[0] === 1 ? "18px" : "unset",
                      transform: `translate(0px, ${-numbArray()[0] * 110}px)`,
                      transition: "0.3s",
                    }}
                  >
                    <div class={styles.number}>0</div>
                    <div class={styles.number}>1</div>
                    <div class={styles.number}>2</div>
                    <div class={styles.number}>3</div>
                    <div class={styles.number}>4</div>
                    <div class={styles.number}>5</div>
                    <div class={styles.number}>6</div>
                    <div class={styles.number}>7</div>
                    <div class={styles.number}>8</div>
                    <div class={styles.number}>9</div>
                  </div>
                </Show>
                <Show when={renderNumber() >= 10}>
                  <div
                    class={styles.numbers}
                    style={{
                      // width: numbArray()[1] === 1 ? "18px" : "unset",
                      transform: `translate(0px, ${-numbArray()[1] * 110}px)`,
                      transition: "0.3s",
                    }}
                  >
                    <div class={styles.number}>0</div>
                    <div class={styles.number}>1</div>
                    <div class={styles.number}>2</div>
                    <div class={styles.number}>3</div>
                    <div class={styles.number}>4</div>
                    <div class={styles.number}>5</div>
                    <div class={styles.number}>6</div>
                    <div class={styles.number}>7</div>
                    <div class={styles.number}>8</div>
                    <div class={styles.number}>9</div>
                  </div>
                </Show>
                <div
                  class={styles.numbers}
                  style={{
                    // width: numbArray()[2] === 1 ? "18px" : "unset",
                    transform: `translate(0px, ${-numbArray()[2] * 110}px)`,
                    transition: "0.3s",
                  }}
                >
                  <div class={styles.number}>0</div>
                  <div class={styles.number}>1</div>
                  <div class={styles.number}>2</div>
                  <div class={styles.number}>3</div>
                  <div class={styles.number}>4</div>
                  <div class={styles.number}>5</div>
                  <div class={styles.number}>6</div>
                  <div class={styles.number}>7</div>
                  <div class={styles.number}>8</div>
                  <div class={styles.number}>9</div>
                </div>
              </div>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
};

export default FlipCard;
