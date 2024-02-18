import { Component, createEffect, createSignal, on, onCleanup } from "solid-js";
import { VocabularyType } from "~/types";
import "/public/styles/flipcard.scss";
import { Motion } from "solid-motionone";
import { createAudio } from "@solid-primitives/audio";

const [playing, setPlaying] = createSignal(false);

const FlipCard: Component<{
  item: VocabularyType;
}> = (props) => {
  const [audioSource, setAudioSource] = createSignal<string>(props.item?.sound);
  const [turnBoxClass, setTurnBoxClass] = createSignal<string>("");
  const [volume, setVolume] = createSignal(1);
  const [audio, { seek }] = createAudio(audioSource, playing, volume);

  const renderMeaning = () => {
    if (props.item) {
      let cardMeaning = props.item?.meaning.replace(
        /\s\-(.+?)\-/g,
        `<p class="turnBoxItemMeaningClass">【 $1 】</p><p class="turnBoxItemMeaningText">`
      );
      cardMeaning =
        cardMeaning.replace(/\-/g, `</p><p class="turnBoxItemMeaningText">`) +
        "</p>";
      return cardMeaning;
    }
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

  createEffect(
    on(
      () => props.item?.text,
      () => {
        if (props.item?.sound) {
          setAudioSource(props.item.sound);
          setPlaying(true);
        }
        if (props.item?.number > 1) {
          setRenderNumber(props.item.number);
          setNumbArray(createNumberArray(props.item.number));
          const timer1 = setTimeout(() => {
            setRenderNumber(renderNumber() - 1);
            setNumbArray(createNumberArray(renderNumber()));
            setPlaying(false);
          }, 2500);

          const timer2 = setTimeout(() => {
            setTurnBoxClass(" turnBoxHover");
            const meaningTTS = props.item?.meaning
              .replace(/\s\-(.+?)\-/g, "+")
              .replace(/\-/g, "+");
            const soundUrl = `https://myapp-9r5h.onrender.com/hear?lang=vi&text=${meaningTTS}`;
            setAudioSource(soundUrl);
            setPlaying(true);
          }, 3500);

          const timer3 = setTimeout(() => {
            setTurnBoxClass("");
          }, 5500);
          onCleanup(() => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
          });
        }
      }
    )
  );

  return (
    <>
      <div class="flipCardLeftContent">
        <div class="numberFlipContainer">
          <div class="numberFlipBackground">
            <div class="numberFlipContent">
              {props.item?.number > 1 ? (
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
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
      <div class="flipCardRightContent">
        <div class={`turnBoxContainer${turnBoxClass()}`}>
          <div class="turnBoxFace turnBoxFaceNum1">
            <div class="turnBoxContent1">
              <p class="turnBoxItemClass">{props.item?.class}</p>
              <p class="turnBoxItemText">{props.item?.text}</p>
              <p class="turnBoxItemPhonetic">{props.item?.phonetic}</p>
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
