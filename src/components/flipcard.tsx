import {
  Component,
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
  const [turnBoxClass, setTurnBoxClass] = createSignal<string>("");

  const renderMeaning = () => {
    if (currenText()?.meaning) {
      let cardMeaning = currenText().meaning.replace(
        /\s\-(.+?)\-/g,
        `<p class="turnBoxItemMeaningClass">【 $1 】</p><p class="turnBoxItemMeaningText">`
      );
      cardMeaning =
        cardMeaning.replace(/\-/g, `</p><p class="turnBoxItemMeaningText">`) +
        "</p>";
      return cardMeaning;
    }
    return "";
  };

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
    const currentSound = currenText()?.sound;
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
    if (currenText()?.meaning) {
      const timer2 = setTimeout(() => {
        setTurnBoxClass(" turnBoxHover");
        const meaningTTS = currenText()
          .meaning.replace(/\s\-(.+?)\-/g, "+")
          .replace(/\-/g, "+");
        const soundUrl = `https://myapp-9r5h.onrender.com/hear?lang=vi&text=${meaningTTS}`;
        setAudioSource(soundUrl);
      }, 3500);
      const timer3 = setTimeout(() => {
        setTurnBoxClass("");
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
          <div class="numberFlipBackground">
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
      </div>
      <div class="flipCardRightContent">
        <div class={`turnBoxContainer${turnBoxClass()}`}>
          <div class="turnBoxFace turnBoxFaceNum1">
            <div class="turnBoxContent1">
              <p class="turnBoxItemClass">{currenText()?.class}</p>
              <p class="turnBoxItemText">{currenText()?.text}</p>
              <p class="turnBoxItemPhonetic">{currenText()?.phonetic}</p>
              <p class="turnBoxItemDate">05/07/22</p>
            </div>
          </div>
          <div class="turnBoxFace turnBoxFaceNum2">
            <div class="turnBoxContent2">
              <div class="turnBoxItemMeaning" innerHTML={renderMeaning()}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlipCard;
