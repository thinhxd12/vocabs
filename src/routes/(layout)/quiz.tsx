import { format } from "date-fns";
import { Component, createEffect, createSignal, For, on, Show } from "solid-js";
import { navStore, quizStore, setNavStore, setQuizStore } from "~/lib/store";
import { createAsync } from "@solidjs/router";
import { getUser } from "~/lib/login";
import arrayShuffle from "array-shuffle";
import { handleCheckQuizWord, updateTodayScheduleLocal } from "~/lib/server";
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
      () => quizStore.quizRender,
      (v) => {
        if (v) {
          setTimeout(() => {
            getRandomChoices();
          }, 500);
        }
      },
    ),
  );

  const [choices, setChoices] = createSignal<{ id: string; choice: string }[]>([
    { id: "", choice: "" },
    { id: "", choice: "" },
    { id: "", choice: "" },
    { id: "", choice: "" },
  ]);
  const [checked, setChecked] = createSignal<boolean>(false);
  const [indexChecked, setIndexChecked] = createSignal<number>(0);

  const getRandomChoices = () => {
    const filteredChoices = navStore.listContent.filter(
      (choice) => choice.id !== quizStore.quizRender?.id,
    );
    let randomChoices = arrayShuffle(filteredChoices).slice(0, 3);
    randomChoices = arrayShuffle([...randomChoices, quizStore.quizRender!]);
    const allChoices = randomChoices.map((item) => {
      return {
        id: item.id,
        choice: item.word,
      };
    });
    setChoices(allChoices);
  };

  const selectChoice = async (id: string, index: number) => {
    setIndexChecked(index);
    setChecked(true);
    if (id === quizStore.quizRender?.id) {
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
      setAudioSrc("/assets/sounds/mp3_Boing.mp3");
      audioRef?.load();
      audioRef?.addEventListener("canplaythrough", () => {
        audioRef?.play();
      });
    }

    const nextCount = quizStore.quizCount + 1;
    if (nextCount < navStore.listContent.length) {
      setTimeout(() => {
        setIndexChecked(0);
        setChecked(false);
        setQuizStore("quizCount", nextCount);
        setQuizStore("quizRender", navStore.listContent[nextCount]);
        getRandomChoices();
      }, 1000);
    } else {
      setTimeout(async () => {
        setAudioSrc("/assets/sounds/mp3_Ding.mp3");
        audioRef?.load();
        audioRef?.addEventListener("canplaythrough", () => {
          audioRef?.play();
        });
        setNavStore("listContent", []);
        setQuizStore("quizCount", 0);
        setIndexChecked(0);
        setChecked(false);
        await updateTodayScheduleLocal(todayDate);
      }, 1000);
    }
  };

  return (
    <MetaProvider>
      <Title>🤔</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio ref={audioRef} hidden src={audioSrc()} />
      <main class="no-scrollbar h-main w-main relative overflow-hidden">
        <Show when={quizStore.quizRender}>
          <div class="mx-auto mb-6 mt-9 h-[120px] w-2/3">
            <div class="no-scrollbar light-layout relative flex h-full w-full select-none flex-col items-center justify-center overflow-hidden rounded-3 !backdrop-blur-lg">
              <h1 class="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 bg-transparent text-center text-[168px] leading-[115px] text-white/20">
                {quizStore.quizRender?.number}
              </h1>

              <div class="relative z-30 flex min-h-11 w-full items-center bg-black/60 shadow-lg shadow-black/60 backdrop-blur-xl">
                <p class="w-full px-1 pb-1.5 text-center text-5 font-400 leading-7 text-white">
                  {quizStore.quizRender?.translations
                    .map((tran) => tran.translations.join(", "))
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>

          <div class="flex w-full flex-col items-center justify-center">
            <Show
              when={checked()}
              fallback={
                <For each={choices()}>
                  {(item, index) => (
                    <button
                      onClick={() => selectChoice(item.id, index() + 1)}
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
                          item.id === quizStore.quizRender?.id
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
                        item.id === quizStore.quizRender?.id
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
