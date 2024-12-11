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
import FlipNumber from "~/components/FlipNumber";

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
      <main class="relative h-full w-full bg-[url('/images/jungle.webp')] bg-cover bg-center">
        <audio ref={audioRef} hidden src={audioSrc()} />
        <div class="no-scrollbar h-[calc(100vh-36px)] w-full overflow-y-scroll">
          <div class="relative h-11 w-full border-b border-[#343434] bg-[url('/images/input-wall.webp')] bg-cover">
            <Show when={quizStore.quizContent.length > 0}>
              <p
                class="h-full w-full truncate text-center font-sfpro text-5.5 font-700 leading-10 text-white"
                style={{
                  "text-shadow": "0 2px 2px rgba(0, 0, 0, 0.9)",
                }}
              >
                {quizStore.quizRender.translations
                  .map((tran) => tran.translations.join(", "))
                  .join(", ")}
              </p>
              <span class="absolute left-[135px] top-0 z-10 w-[90px] text-center font-helvetica text-[45px] font-600 leading-11 text-white/45">
                {quizStore.quizRender.number}
              </span>
            </Show>
          </div>

          <Show when={quizStore.quizCount}>
            <div class="progress__track">
              <div
                class="progress__fill"
                style={{
                  width: `${((quizStore.quizCount + 1) / quizStore.quizContent.length) * 100}%`,
                }}
              ></div>
            </div>
          </Show>

          <Show when={quizStore.quizContent.length > 0}>
            <div class="mt-5 grid w-full grid-cols-1 gap-1">
              <Show
                when={checked()}
                fallback={
                  <For each={choices()}>
                    {(item, index) => (
                      <button
                        onClick={() =>
                          selectChoice(item.created_at, index() + 1)
                        }
                        class="mx-auto h-11 w-2/3 cursor-pointer select-none rounded-sm bg-[#fffeff] text-center font-sfpro text-5 font-500 leading-11 text-black shadow-md transition hover:bg-[#ececec]"
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
                          class={`${item.created_at === quizStore.quizRender.created_at ? "bg-green-400" : "bg-[#fffeff]"} mx-auto h-11 w-2/3 cursor-pointer select-none rounded-sm text-center font-sfpro text-5 font-500 leading-11 text-black shadow-md transition`}
                        >
                          {item.choice}
                        </div>
                      }
                    >
                      <div
                        class={`${item.created_at === quizStore.quizRender.created_at ? "bg-green-400" : "bg-[rgba(249,0,0,0.9)]"} mx-auto h-11 w-2/3 cursor-pointer select-none rounded-sm text-center font-sfpro text-5 font-500 leading-11 text-black shadow-md transition`}
                      >
                        {item.choice}
                      </div>
                    </Show>
                  )}
                </For>
              </Show>
            </div>
          </Show>
        </div>
      </main>
    </MetaProvider>
  );
};

export default Quiz;
