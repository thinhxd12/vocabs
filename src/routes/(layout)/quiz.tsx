import { format } from "date-fns";
import { Component, createEffect, createSignal, For, on, Show } from "solid-js";
import { navStore, quizStore, setQuizStore } from "~/lib/store";
import { createAsync } from "@solidjs/router";
import { getUser } from "~/lib/login";
import arrayShuffle from "array-shuffle";
import {
  handleCheckQuizWord,
  updateTodaySchedule,
  updateTodayScheduleStore,
} from "~/lib/server";
import { Meta, MetaProvider, Title } from "@solidjs/meta";

const Quiz: Component<{}> = (props) => {
  let audioRef: HTMLAudioElement | undefined;
  const [audioSrc, setAudioSrc] = createSignal<string>(
    "/assets/sounds/mp3_Ding.mp3",
  );

  const todayDate = format(new Date(), "yyyy-MM-dd");
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  createEffect(
    on(
      () => quizStore.quizContent,
      (v) => {
        if (v.length > 0) {
          setTimeout(() => {
            getRandomChoices();
          }, 500);
        }
      },
    ),
  );

  const [choices, setChoices] = createSignal<
    { created_at: string; choice: string }[]
  >([
    { created_at: "", choice: "" },
    { created_at: "", choice: "" },
    { created_at: "", choice: "" },
    { created_at: "", choice: "" },
  ]);
  const [checked, setChecked] = createSignal<boolean>(false);
  const [indexChecked, setIndexChecked] = createSignal<number>(0);

  const getRandomChoices = () => {
    const filteredChoices = quizStore.quizContent.filter(
      (choice) => choice.created_at !== quizStore.quizRender.created_at,
    );
    let randomChoices = arrayShuffle(filteredChoices).slice(0, 3);
    randomChoices = arrayShuffle([...randomChoices, quizStore.quizRender]);
    const allChoices = randomChoices.map((item) => {
      return {
        created_at: item.created_at,
        choice: item.word,
      };
    });
    setChoices(allChoices);
  };

  const selectChoice = async (time: string, index: number) => {
    setIndexChecked(index);
    setChecked(true);
    if (time === quizStore.quizRender.created_at) {
      handleCheckQuizWord(quizStore.quizRender);
      setQuizStore("quizRender", {
        ...quizStore.quizRender,
        number: quizStore.quizRender.number - 1,
      });
      setAudioSrc(quizStore.quizRender.audio);
      audioRef?.load();
      audioRef?.addEventListener("canplaythrough", () => {
        audioRef?.play();
      });
    } else {
      setAudioSrc("/assets/sounds/mp3_Ding.mp3");
      audioRef?.load();
      audioRef?.addEventListener("canplaythrough", () => {
        audioRef?.play();
      });
    }

    const nextCount = quizStore.quizCount + 1;
    if (nextCount < quizStore.quizContent.length) {
      setTimeout(() => {
        setIndexChecked(0);
        setChecked(false);
        setQuizStore("quizCount", nextCount);
        setQuizStore("quizRender", quizStore.quizContent[nextCount]);
        getRandomChoices();
      }, 1000);
    } else {
      setTimeout(async () => {
        setAudioSrc("/assets/sounds/mp3_Ding.mp3");
        audioRef?.load();
        audioRef?.addEventListener("canplaythrough", () => {
          audioRef?.play();
        });
        setQuizStore("quizContent", []);
        setQuizStore("quizCount", 0);
        setIndexChecked(0);
        setChecked(false);
        const res = await updateTodaySchedule(todayDate, navStore.listType);
        updateTodayScheduleStore(res);
      }, 1000);
    }
  };

  return (
    <MetaProvider>
      <Title>🤔</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio ref={audioRef} hidden src={audioSrc()} />
      <main class="no-scrollbar relative h-[calc(100vh-40px)] w-[360px] overflow-y-scroll py-0.5">
        <div class="mx-auto mb-6 mt-9 h-[90px] w-2/3">
          <div class="no-scrollbar light-layout relative flex h-full w-full select-none flex-col items-center justify-center overflow-hidden rounded-3 !backdrop-blur-lg">
            <h1 class="absolute -top-3 left-0 z-10 w-full bg-transparent text-center text-[125px] leading-[90px] text-white/20">
              {quizStore.quizRender.number}
            </h1>

            <p class="relative z-30 w-full bg-black/60 px-1 pb-1.5 text-center text-5 font-400 leading-7 text-white shadow-lg shadow-black/60 backdrop-blur-xl">
              {quizStore.quizRender.translations
                .map((tran) => tran.translations.join(", "))
                .join(", ")}
            </p>
          </div>
        </div>

        <Show when={quizStore.quizContent.length > 0}>
          <div class="flex w-full flex-col items-center justify-center">
            <Show
              when={checked()}
              fallback={
                <For each={choices()}>
                  {(item, index) => (
                    <button
                      onClick={() => selectChoice(item.created_at, index() + 1)}
                      class="quiz-choice"
                    >
                      {item.choice}
                    </button>
                  )}
                </For>
              }
            >
              <For each={choices()}>
                {(item, index) => (
                  <Show
                    when={index() + 1 === indexChecked()}
                    fallback={
                      <div
                        class={
                          item.created_at === quizStore.quizRender.created_at
                            ? "quiz-choice-true"
                            : "quiz-choice"
                        }
                      >
                        {item.choice}
                      </div>
                    }
                  >
                    <div
                      class={
                        item.created_at === quizStore.quizRender.created_at
                          ? "quiz-choice-true"
                          : "quiz-choice-false"
                      }
                    >
                      {item.choice}
                    </div>
                  </Show>
                )}
              </For>
            </Show>
          </div>
        </Show>
      </main>
    </MetaProvider>
  );
};

export default Quiz;
