import {
  Component,
  createEffect,
  createSignal,
  Index,
  on,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { getUser } from "~/lib";
import { createAsync } from "@solidjs/router";
import styles from "./quiz.module.scss";
import { Motion } from "solid-motionone";
import { listStore, mainStore, setListStore, setMainStore } from "~/lib/mystore";
import {
  handleCheckQuizWord,
  updateTodayData,
  updateTodaySchedule
} from "~/lib/api";
import { format } from "date-fns";
import { shuffleQuiz } from "~/utils";


const Quiz: Component<{}> = (props) => {
  let quizAudio: HTMLAudioElement | undefined;
  const todayDate = format(new Date(), "yyyy-MM-dd");
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  createEffect(
    on(
      () => listStore.quizContent,
      (v) => {
        if (listStore.quizContent.length > 0) {
          setTimeout(() => {
            getRandomChoices();
          }, 500);
        }
      }
    )
  );

  onMount(() => {
    setListStore("quizTest", true);
  })

  onCleanup(() => {
    setListStore("quizTest", false);
  })

  const [choices, setChoices] = createSignal<{ created_at: string, choice: string }[]>([{ created_at: "", choice: "" }, { created_at: "", choice: "" }, { created_at: "", choice: "" }, { created_at: "", choice: "" }]);
  const [checked, setChecked] = createSignal<boolean>(false);
  const [indexChecked, setIndexChecked] = createSignal<number>(0);

  const getRandomChoices = () => {
    const filteredChoices = listStore.quizContent.filter(choice => choice.created_at !== listStore.quizRender.created_at);
    let randomChoices = shuffleQuiz(filteredChoices).slice(0, 5);
    randomChoices = shuffleQuiz([...randomChoices, listStore.quizRender]);
    const allChoices = randomChoices.map(item => {
      return {
        created_at: item.created_at,
        choice: item.word,
      }
    })
    setChoices(allChoices);
  }

  const selectChoice = async (time: string, index: number) => {
    setIndexChecked(index);
    setChecked(true);
    if (time === listStore.quizRender.created_at) {
      handleCheckQuizWord(listStore.quizRender);
      setListStore("quizRender", { ...listStore.quizRender, number: listStore.quizRender.number - 1 });
      quizAudio && quizAudio.play();
    }
    else {
      setMainStore("audioSrc", "/sounds/mp3_Boing.mp3");
      if (mainStore.audioRef) {
        mainStore.audioRef.volume = 0.1;
        mainStore.audioRef.play();
      }
    }

    const nextCount = listStore.quizCount + 1;
    if (nextCount < listStore.quizContent.length) {
      setTimeout(() => {
        setIndexChecked(0);
        setChecked(false);
        setListStore("quizCount", nextCount);
        setListStore("quizRender", listStore.quizContent[nextCount]);
        getRandomChoices();
      }, 1000);
    }
    else {
      setTimeout(async () => {
        setMainStore("audioSrc", "/sounds/mp3_Ding.mp3");
        if (mainStore.audioRef) {
          mainStore.audioRef.volume = 1;
          mainStore.audioRef.play();
        }
        setListStore("quizContent", []);
        setListStore("quizCount", 0);
        setIndexChecked(0);
        setChecked(false);
        await updateTodaySchedule(todayDate, listStore.listType);
        await updateTodayData(todayDate);
      }, 1000);
    }
  }

  return (
    <MetaProvider>
      <Title>🤔</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div class={styles.quiz}>
        <div class={styles.quizText}>
          <Show when={listStore.quizContent.length > 0}>
            <span class={styles.quizTextContent}>
              {
                listStore.quizRender.translations
                  .map((tran) => tran.translations.join(", "))
                  .join(", ")
              }
            </span>
            <span class={styles.quizTextNumber}>
              {listStore.quizRender.number}
            </span>
          </Show>
        </div>

        <Show when={listStore.quizCount}>
          <Motion.div class={styles.quizProgessBar}
            animate={{
              width: `${(listStore.quizCount + 1) * 2}%`,
            }}
            transition={{ duration: 0.3, easing: [0.4, 0, 0.2, 1] }}
          ></Motion.div>
        </Show>

        <div class={styles.quizChoices}>
          <Show when={listStore.quizContent.length > 0}>
            <Show when={checked()}
              fallback={
                <Index each={choices()}>
                  {
                    (data, index) => {
                      return <div class={styles.quizChoice}
                        onclick={() => selectChoice(data().created_at, index + 1)}
                      >{data().choice}</div>
                    }
                  }
                </Index>
              }>
              <Index each={choices()}>
                {
                  (data, index) => {
                    return <Show when={index + 1 === indexChecked()}
                      fallback={
                        <Motion.div
                          class={styles.quizChoice}
                          animate={{ backgroundColor: data().created_at === listStore.quizRender.created_at ? "#38e07b" : "#fffeff" }}
                        >
                          {data().choice}
                        </Motion.div>
                      }
                    >
                      <Motion.div
                        class={styles.quizChoice}
                        animate={{ backgroundColor: data().created_at === listStore.quizRender.created_at ? "#38e07b" : "#f90000" }}
                      >
                        {data().choice}
                      </Motion.div>
                    </Show>
                  }
                }
              </Index>
            </Show>

          </Show>
        </div>
      </div>

      <audio
        ref={quizAudio}
        hidden
        src={listStore.quizRender.audio}
      />
    </MetaProvider >
  );
};

export default Quiz;

