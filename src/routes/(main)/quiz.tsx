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
import { listStore, setListStore } from "~/lib/mystore";
import { VocabularySearchType } from "~/types";
import { getListContent, handleCheckWord, updateTodayData, updateTodaySchedule } from "~/lib/api";
import { format } from "date-fns";


const Quiz: Component<{}> = (props) => {
  const todayDate = format(new Date(), "yyyy-MM-dd");
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  createEffect(
    on(
      () => listStore.listContent,
      (v) => {
        if (listStore.listContent.length > 0) {
          setQuizText(listStore.listContent[0]);
          getRandomChoices();
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

  const [quizText, setQuizText] = createSignal<VocabularySearchType>({
    created_at: "",
    word: "",
    number: 0,
    phonetics: "",
    audio: "",
    translations: []
  });
  const [choices, setChoices] = createSignal<{ created_at: string, translation: string }[]>([{ created_at: "", translation: "" }, { created_at: "", translation: "" }, { created_at: "", translation: "" }, { created_at: "", translation: "" }]);
  const [checked, setChecked] = createSignal<boolean>(false);
  const [indexChecked, setIndexChecked] = createSignal<number>(0);

  const shuffle = (array: VocabularySearchType[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const getRandomChoices = () => {
    const filteredChoices = listStore.listContent.filter(choice => choice.created_at !== quizText().created_at);
    let randomChoices = shuffle(filteredChoices).slice(0, 5);
    randomChoices = shuffle([...randomChoices, quizText()]);
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
    if (time === quizText().created_at) {
      handleCheckWord(quizText());
    }
    else {
      setQuizText({ ...quizText(), audio: "/sounds/mp3_Boing.mp3" })
    }

    const nextCount = listStore.quizCount + 1;
    if (nextCount < listStore.listContent.length) {
      setTimeout(() => {
        setIndexChecked(0);
        setChecked(false);
        setListStore("quizCount", nextCount);
        setQuizText(listStore.listContent[nextCount]);
        getRandomChoices();
      }, 3000);
    }
    else {
      setListStore("quizCount", 0);
      setIndexChecked(0);
      setChecked(false);
      await updateTodaySchedule(todayDate, listStore.listType);
      await updateTodayData(todayDate);

      switch (listStore.listType) {
        case 1:
          const data1 = await getListContent(
            listStore.listToday.index1,
            listStore.listToday.index1 + 49
          );
          if (data1) setListStore("listContent", data1);
          break;
        case 2:
          const data2 = await getListContent(
            listStore.listToday.index2,
            listStore.listToday.index2 + 49
          );
          if (data2) setListStore("listContent", data2);
          break;
        default:
          break;
      }
    }


  }

  return (
    <MetaProvider>
      <Title>🤔</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div class={styles.quiz}>
        <div class={styles.quizText}>
          <Show when={listStore.listContent.length > 0}>
            <span class={styles.quizTextContent}>
              {quizText().word}
            </span>
            <span class={styles.quizTextPhonetic}>
              {quizText().word}
            </span>
            <span class={styles.quizTextNumber}>
              {quizText().number}
            </span>
          </Show>
        </div>

        <Show when={listStore.quizCount > 0}>
          <Motion.div class={styles.quizProgessBar}
            animate={{
              width: `${(listStore.quizCount + 1) * 2}%`,
            }}
            transition={{ duration: 0.3, easing: [0.4, 0, 0.2, 1] }}
          ></Motion.div>
        </Show>

        <div class={styles.quizChoices}>
          <Show when={listStore.listContent.length > 0}>
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
                          animate={{ backgroundColor: data().created_at === quizText().created_at ? "#a6ffca" : "#fffeff" }}
                        >
                          {data().translation}
                        </Motion.div>
                      }
                    >
                      <Motion.div
                        class={styles.quizChoice}
                        animate={{ backgroundColor: data().created_at === quizText().created_at ? "#a6ffca" : "#f90000" }}
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
        src={quizText().audio}
      />
    </MetaProvider >
  );
};

export default Quiz;

