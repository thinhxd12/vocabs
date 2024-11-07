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
  getListContentQuiz,
  handleCheckQuizWord,
  updateTodayData,
  updateTodaySchedule
} from "~/lib/api";
import { format } from "date-fns";
import { shuffleQuiz } from "~/utils";


const Quiz: Component<{}> = (props) => {
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
          }, 1000);
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

  const [choices, setChoices] = createSignal<{ created_at: string, translation: string }[]>([{ created_at: "", translation: "" }, { created_at: "", translation: "" }, { created_at: "", translation: "" }, { created_at: "", translation: "" }]);
  const [checked, setChecked] = createSignal<boolean>(false);
  const [indexChecked, setIndexChecked] = createSignal<number>(0);

  const getRandomChoices = () => {
    const filteredChoices = listStore.quizContent.filter(choice => choice.created_at !== listStore.quizRender.created_at);
    let randomChoices = shuffleQuiz(filteredChoices).slice(0, 5);
    randomChoices = shuffleQuiz([...randomChoices, listStore.quizRender]);
    const allChoices = randomChoices.map(item => {
      const trans = item.translations
        .map((tran) => tran.translations.join(", "))
        .join(", ");
      return {
        created_at: item.created_at,
        translation: trans
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
      }, 2100);
    }
    else {
      setTimeout(async () => {
        setListStore("quizCount", 0);
        setIndexChecked(0);
        setChecked(false);
        await updateTodaySchedule(todayDate, listStore.listType);
        await updateTodayData(todayDate);
        handleGetListContentQuiz();
      }, 2100);
    }
  }

  const handleGetListContentQuiz = async () => {
    switch (listStore.listType) {
      case 1:
        const data1 = await getListContentQuiz(
          listStore.listToday.index1,
          listStore.listToday.index1 + 49
        );
        if (data1) setListStore("quizContent", shuffleQuiz(data1));
        break;
      case 2:
        const data2 = await getListContentQuiz(
          listStore.listToday.index2,
          listStore.listToday.index2 + 49
        );
        if (data2) setListStore("quizContent", shuffleQuiz(data2));
        break;
      default:
        break;
    }
    setListStore("quizRender", listStore.quizContent[0]);
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
              {listStore.quizRender.word}
            </span>
            <span class={styles.quizTextPhonetic}>
              {listStore.quizRender.phonetics}
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
                      >{data().translation}</div>
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
                          {data().translation}
                        </Motion.div>
                      }
                    >
                      <Motion.div
                        class={styles.quizChoice}
                        animate={{ backgroundColor: data().created_at === listStore.quizRender.created_at ? "#38e07b" : "#f90000" }}
                      >
                        {data().translation}
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
        autoplay
        hidden
        src={listStore.quizRender.audio}
      />
    </MetaProvider >
  );
};

export default Quiz;

