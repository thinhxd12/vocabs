import {
  Component,
  Index,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import { VocabularyType } from "~/types";
import "/public/styles/flipcard.scss";
import { Motion } from "solid-motionone";

const FlipCard: Component<{
  item: VocabularyType;
}> = (props) => {
  const currenText = createMemo(() => props.item);
  const [audioSource, setAudioSource] = createSignal<string>("");
  const [hover, setHover] = createSignal<boolean>(false);
  const [partOfSpeechs, setPartOfSpeechs] = createSignal<string>("");

  const createNumberArray = (num: number) => {
    let arr = Array.from(String(num), Number);
    while (arr.length < 3) {
      arr.unshift(0);
    }
    return arr;
  };

  const [renderNumber, setRenderNumber] = createSignal<number>(3);
  const [numbArray, setNumbArray] = createSignal<number[]>([3, 6, 9]);

  createEffect(() => {
    let currentSound = currenText()?.audio;
    let translations = currenText()
      ?.translations.map((item) => item.translations.join(", "))
      .join(", ");

    let partOfSpeech = currenText()
      ?.translations.map((item) => item.partOfSpeech)
      .join("-");

    setPartOfSpeechs(partOfSpeech);

    if (currentSound) {
      setAudioSource(currentSound);
    }
    if (currenText()?.number > 1) {
      setRenderNumber(currenText().number);
      setNumbArray(createNumberArray(currenText()?.number));
      const timer1 = setTimeout(() => {
        setRenderNumber(renderNumber() - 1);
        setNumbArray(createNumberArray(renderNumber()));
      }, 2500);
      onCleanup(() => {
        clearTimeout(timer1);
      });
    }
    if (translations) {
      const timer2 = setTimeout(() => {
        setHover(true);
        const soundUrl = `https://myapp-9r5h.onrender.com/hear?lang=vi&text=${translations}`;
        setAudioSource(soundUrl);
      }, 3000);
      const timer3 = setTimeout(() => {
        setHover(false);
      }, 5500);
      onCleanup(() => {
        clearTimeout(timer2);
        clearTimeout(timer3);
      });
    }
  });

  return (
    <>
      <audio src={audioSource()} hidden autoplay></audio>
      <div class="flipCardLeftContent">
        <div class="numberFlipContainer">
          <div class="numberFlipBackground"></div>
          <div class="numberFlipContent">
            <Show
              when={props.item?.number > 1}
              fallback={
                <div class="flipImage">
                  <Motion.div
                    class="flipImageList"
                    initial={{ y: -22 }}
                    animate={{ y: 24, transition: { delay: 2.5 } }}
                    transition={{ duration: 0.6, easing: "ease-in-out" }}
                  >
                    <img src="/images/main/cup.png" />
                    <span class="number">1</span>
                  </Motion.div>
                </div>
              }
            >
              <div class="numbersContentBackground">
                <div class="numbersContent">
                  {renderNumber() >= 100 && (
                    <Motion.div
                      class="numbers"
                      animate={{
                        y: -numbArray()[0] * 46,
                        width: numbArray()[0] === 1 ? "8px" : "11px",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div class="number">0</div>
                      <div class="number">1</div>
                      <div class="number">2</div>
                      <div class="number">3</div>
                      <div class="number">4</div>
                      <div class="number">5</div>
                      <div class="number">6</div>
                      <div class="number">7</div>
                      <div class="number">8</div>
                      <div class="number">9</div>
                    </Motion.div>
                  )}
                  {renderNumber() >= 10 && (
                    <Motion.div
                      class="numbers"
                      animate={{
                        y: -numbArray()[1] * 46,
                        width: numbArray()[1] === 1 ? "8px" : "13px",
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div class="number">0</div>
                      <div class="number">1</div>
                      <div class="number">2</div>
                      <div class="number">3</div>
                      <div class="number">4</div>
                      <div class="number">5</div>
                      <div class="number">6</div>
                      <div class="number">7</div>
                      <div class="number">8</div>
                      <div class="number">9</div>
                    </Motion.div>
                  )}
                  <Motion.div
                    class="numbers"
                    animate={{
                      y: -numbArray()[2] * 46,
                      width: numbArray()[2] === 1 ? "8px" : "13px",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div class="number">0</div>
                    <div class="number">1</div>
                    <div class="number">2</div>
                    <div class="number">3</div>
                    <div class="number">4</div>
                    <div class="number">5</div>
                    <div class="number">6</div>
                    <div class="number">7</div>
                    <div class="number">8</div>
                    <div class="number">9</div>
                  </Motion.div>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </div>
      <div class="flipCardRightContent">
        <div class={hover() ? "cardContent cardContent--hover" : "cardContent"}>
          <div class="cardTop">
            <Index
              each={currenText()?.translations}
              fallback={<p class="cardTop--text">No items</p>}
            >
              {(item, index) => (
                <>
                  <p class="cardTop--class">【 {item().partOfSpeech} 】</p>
                  <Index each={item().translations}>
                    {(m) => <p class="cardTop--text">{m()}</p>}
                  </Index>
                </>
              )}
            </Index>
          </div>
          <div class="cardBottom">
            <p class="cardBottom--phonetic">{currenText()?.phonetics}</p>
            <Motion.p
              class="cardBottom--text"
              animate={{
                fontSize: currenText()?.word.length > 14 ? "27px" : "33px",
              }}
            >
              {currenText()?.word}
            </Motion.p>
            <p class="cardBottom--class">【 {partOfSpeechs()} 】</p>
            <p class="cardBottom--date">05/07/22</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlipCard;
