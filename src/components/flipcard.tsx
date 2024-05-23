import {
  Component,
  Index,
  Show,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { VocabularyType } from "~/types";
import { Motion } from "solid-motionone";
import { useGlobalContext } from "~/globalcontext/store";
import styles from "./flipcard.module.scss";

const FlipCard: Component<{
  item: VocabularyType;
}> = (props) => {
  let timeoutId1: NodeJS.Timeout;
  let timeoutId2: NodeJS.Timeout;
  let timeoutId3: NodeJS.Timeout;

  const currenText = createMemo(() => props.item);
  const [partOfSpeechs, setPartOfSpeechs] = createSignal<string>("");
  const [hoverClass, setHoverClass] = createSignal<string>("");

  const createNumberArray = (num: number) => {
    let arr = Array.from(String(num), Number);
    while (arr.length < 3) {
      arr.unshift(0);
    }
    return arr;
  };

  const [renderNumber, setRenderNumber] = createSignal<number>(3);
  const [numbArray, setNumbArray] = createSignal<number[]>([3, 6, 9]);

  const { audioSrc, setAudioSrc } = useGlobalContext();

  createEffect(() => {
    clearTimeout(timeoutId1);
    clearTimeout(timeoutId2);
    clearTimeout(timeoutId3);

    let currentSound = currenText()?.audio;
    let translations = currenText()
      ?.translations.map((item) => item.translations.join(", "))
      .join(", ");

    let partOfSpeech = currenText()
      ?.translations.map((item) => item.partOfSpeech)
      .join("-");

    setPartOfSpeechs(partOfSpeech);

    if (currentSound) {
      setAudioSrc(currentSound);
    }
    if (currenText()?.number > 1) {
      setRenderNumber(currenText().number);
      setHoverClass(styles.cardContent);
      setNumbArray(createNumberArray(currenText()?.number));
      timeoutId1 = setTimeout(() => {
        setRenderNumber(renderNumber() - 1);
        setNumbArray(createNumberArray(renderNumber()));
      }, 2500);
    }
    if (translations) {
      timeoutId2 = setTimeout(() => {
        setHoverClass(`${styles.cardContent} ${styles.cardContentHover1}`);
        const soundUrl = `https://myapp-9r5h.onrender.com/hear?lang=vi&text=${translations}`;
        setAudioSrc(soundUrl);
      }, 3000);
      timeoutId3 = setTimeout(() => {
        setHoverClass(`${styles.cardContent} ${styles.cardContentHover2}`);
      }, 5500);
    }
  });

  return (
    <>
      <div class={styles.flipCardLeftContent}>
        <div class={styles.numberFlipContainer}>
          <div class={styles.numberFlipBackground}></div>
          <div class={styles.numberFlipContent}>
            <Show when={currenText()}>
              <Show
                when={props.item?.number > 1}
                fallback={
                  <div class={styles.flipImage}>
                    <Motion.div
                      class={styles.flipImageList}
                      initial={{ y: -22 }}
                      animate={{ y: 24, transition: { delay: 3 } }}
                      transition={{ duration: 0.6, easing: "ease-in-out" }}
                    >
                      <img src="/images/main/cup.png" />
                      <span class={styles.number}>1</span>
                    </Motion.div>
                  </div>
                }
              >
                <div class={styles.numbersContentBackground}>
                  <div class={styles.numbersContent}>
                    {renderNumber() >= 100 && (
                      <Motion.div
                        class={styles.numbers}
                        animate={{
                          y: -numbArray()[0] * 46,
                          width: numbArray()[0] === 1 ? "8px" : "11px",
                        }}
                        transition={{ duration: 0.3 }}
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
                      </Motion.div>
                    )}
                    {renderNumber() >= 10 && (
                      <Motion.div
                        class={styles.numbers}
                        animate={{
                          y: -numbArray()[1] * 46,
                          width: numbArray()[1] === 1 ? "8px" : "13px",
                        }}
                        transition={{ duration: 0.3 }}
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
                      </Motion.div>
                    )}
                    <Motion.div
                      class={styles.numbers}
                      animate={{
                        y: -numbArray()[2] * 46,
                        width: numbArray()[2] === 1 ? "8px" : "13px",
                      }}
                      transition={{ duration: 0.3 }}
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
                    </Motion.div>
                  </div>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </div>
      <div class={styles.flipCardRightContent}>
        <Show
          when={currenText()}
          fallback={<div class={styles.cardContent}></div>}
        >
          <div class={hoverClass()}>
            <div class={styles.cardBottom}>
              <p class={styles.cardBottomPhonetic}>{currenText()?.phonetics}</p>
              <p class={styles.cardBottomText}>{currenText()?.word}</p>
              <p class={styles.cardBottomClass}>【 {partOfSpeechs()} 】</p>
              <p class={styles.cardBottomDate}>05/07/22</p>
            </div>
            <div class={styles.cardTop}>
              <Index
                each={currenText()?.translations}
                fallback={<p class={styles.cardTopText}>No items</p>}
              >
                {(item, index) => (
                  <>
                    <p class={styles.cardTopClass}>{item().partOfSpeech}</p>
                    <Index each={item().translations}>
                      {(m) => <p class={styles.cardTopText}>{m()}</p>}
                    </Index>
                  </>
                )}
              </Index>
            </div>
            <div class={styles.cardBottom}>
              <p class={styles.cardBottomPhonetic}>{currenText()?.phonetics}</p>
              <p class={styles.cardBottomText}>{currenText()?.word}</p>
              <p class={styles.cardBottomClass}>【 {partOfSpeechs()} 】</p>
            </div>
          </div>
        </Show>
      </div>
    </>
  );
};

export default FlipCard;
