import { format } from "date-fns";
import {
  createEffect,
  createSignal,
  For,
  on,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import "../../styles/layout.css";
import { chunk } from "~/lib/utils";
import Dialog from "@corvu/dialog";
import { OcPluscircle3, OcX2 } from "solid-icons/oc";
import { BiSolidSave } from "solid-icons/bi";
import {
  layoutStore,
  navStore,
  scheduleStore,
  setScheduleStore,
} from "~/lib/store";
import { createAsync, useSubmission } from "@solidjs/router";
import { getUser } from "~/lib/login";
import {
  getAllHistoryList,
  getCalendarList,
  getHistoryList,
  getProgressList,
  getThisWeekIndex,
  submitNewSchedule,
  submitTodayReset,
} from "~/lib/server";
import { toast } from "~/components/Toast";
import { Toast } from "@kobalte/core/toast";
import { Portal } from "solid-js/web";
import { Meta, MetaProvider, Title } from "@solidjs/meta";

const todayDate = format(new Date(), "yyyy-MM-dd");
export const route = {
  preload: () => {
    getCalendarList(todayDate),
      getThisWeekIndex(todayDate),
      getHistoryList(scheduleStore.historyList.length > 0);
  },
};

export default function Schedule() {
  let audioRef: HTMLAudioElement | undefined;
  const [audioSrc, setAudioSrc] = createSignal<string>(
    "/assets/sounds/mp3_Ding.mp3",
  );

  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const historyList_data = createAsync(() =>
    getHistoryList(scheduleStore.historyList.length > 0),
  );

  const calendarList_data = createAsync(() => getCalendarList(todayDate));

  const thisWeekIndex_data = createAsync(() => getThisWeekIndex(todayDate));

  createEffect(() => {
    if (historyList_data()) {
      setScheduleStore("historyList", historyList_data()!);
    }
  });

  createEffect(() => {
    if (calendarList_data()) {
      setScheduleStore("calendarList", calendarList_data()!);
    }
  });

  createEffect(() => {
    if (thisWeekIndex_data()) {
      setScheduleStore("thisWeekIndex", thisWeekIndex_data()!);
    }
  });

  onMount(async () => {
    if (scheduleStore.progressList.length > 0) return;
    const data = await getProgressList();
    if (data) {
      setScheduleStore("progressList", data);
    }
  });

  const [openDialogSchedule, setOpenDialogSchedule] =
    createSignal<boolean>(false);
  const [openDialogReset, setOpenDialogReset] = createSignal<boolean>(false);

  const submitNewScheduleAction = useSubmission(submitNewSchedule);

  createEffect(
    on(
      () => submitNewScheduleAction.result,
      () => {
        if (submitNewScheduleAction.result?.message === "success") {
          toast.success("Done");
          setAudioSrc("/assets/sounds/mp3_Ding.mp3");
          audioRef?.load();
          audioRef?.addEventListener("canplaythrough", () => {
            audioRef?.play();
          });
        } else if (
          submitNewScheduleAction.result?.message !== "success" &&
          submitNewScheduleAction.result?.message !== undefined
        ) {
          toast.error(submitNewScheduleAction.result?.message!);
          setAudioSrc("/assets/sounds/mp3_Boing.mp3");
          audioRef?.load();
          audioRef?.addEventListener("canplaythrough", () => {
            audioRef?.play();
          });
        }
        setOpenDialogSchedule(false);
      },
    ),
  );

  const submitTodayResetAction = useSubmission(submitTodayReset);

  createEffect(
    on(
      () => submitTodayResetAction.result,
      () => {
        if (submitTodayResetAction.result?.message === "success") {
          toast.success("Done");
          setAudioSrc("/assets/sounds/mp3_Ding.mp3");
          audioRef?.load();
          audioRef?.addEventListener("canplaythrough", () => {
            audioRef?.play();
          });
        } else if (
          submitTodayResetAction.result?.message !== "success" &&
          submitTodayResetAction.result?.message !== undefined
        ) {
          toast.error(submitTodayResetAction.result?.message!);
          setAudioSrc("/assets/sounds/mp3_Boing.mp3");
          audioRef?.load();
          audioRef?.addEventListener("canplaythrough", () => {
            audioRef?.play();
          });
        }
        setOpenDialogReset(false);
      },
    ),
  );

  const handleLoadAllHistory = async () => {
    const data = await getAllHistoryList();
    if (data) {
      setScheduleStore("historyList", data);
    }
  };

  return (
    <MetaProvider>
      <Title>📆</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <main class="relative h-full w-full bg-black">
        <audio ref={audioRef} hidden src={audioSrc()} />
        <div class="no-scrollbar h-[calc(100vh-36px)] w-full overflow-y-scroll">
          <div class="relative h-[240px] w-full">
            <img
              class="h-full w-full object-cover"
              src={`/images/${format(new Date(), "M")}.webp`}
            />
            <div
              class="absolute left-0.5 top-0.5 cursor-default bg-black px-1 py-0.1"
              style={{
                "box-shadow": "#0000004d 0 3px 9px,#00000038 0 6px 9px",
              }}
            >
              <Suspense>
                <For each={scheduleStore.progressList}>
                  {(item) => (
                    <p class="font-rubik text-[7px] font-400 leading-3.5 text-white">
                      {item.date} {item.count}
                    </p>
                  )}
                </For>
              </Suspense>
            </div>

            <div class="absolute bottom-0.5 right-0.5">
              <p
                style={{
                  "box-shadow": "#0000004d 0 0 9px,#00000038 0 3px 9px",
                }}
                class="mb-0.1 cursor-pointer bg-black px-1 text-center font-basier text-3.5 font-500 uppercase leading-4.5 text-white"
                onClick={handleLoadAllHistory}
              >
                {format(new Date(), "MMMM")}
              </p>
              <p
                style={{
                  "box-shadow": "#0000004d 0 0 9px,#00000038 0 3px 9px",
                }}
                class="mb-0.1 cursor-pointer bg-black px-1 text-center font-basier text-6 font-500 uppercase leading-7 text-[#f4f4f4] hover:text-white"
                onClick={() => setOpenDialogReset(true)}
              >
                {format(new Date(), "yyyy")}
              </p>
              <p
                style={{
                  "box-shadow": "#0000004d 0 0 9px,#00000038 0 3px 9px",
                }}
                class="mb-0.1 cursor-pointer bg-black px-1 text-center font-basier text-2.5 font-500 uppercase leading-4 text-[#f4f4f4] hover:text-white"
                onClick={() => setOpenDialogSchedule(true)}
              >
                <Show when={scheduleStore.thisWeekIndex > 0} fallback={"hiems"}>
                  {Number(scheduleStore.thisWeekIndex) +
                    " - " +
                    Number(scheduleStore.thisWeekIndex + 199)}
                </Show>
              </p>
            </div>
          </div>

          <div class="flex cursor-default flex-wrap justify-center bg-white">
            <div class="my-1.5 h-7 w-[50px] bg-black text-center font-rubik text-4 font-700 uppercase leading-7 text-[#f90000]">
              Sun
            </div>
            <div class="my-1.5 h-7 w-[50px] bg-black text-center font-rubik text-4 font-700 uppercase leading-7 text-[#f4f4f4]">
              Mon
            </div>
            <div class="my-1.5 h-7 w-[50px] bg-black text-center font-rubik text-4 font-700 uppercase leading-7 text-[#f4f4f4]">
              Tue
            </div>
            <div class="my-1.5 h-7 w-[50px] bg-black text-center font-rubik text-4 font-700 uppercase leading-7 text-[#f4f4f4]">
              Wed
            </div>
            <div class="my-1.5 h-7 w-[50px] bg-black text-center font-rubik text-4 font-700 uppercase leading-7 text-[#f4f4f4]">
              Thu
            </div>
            <div class="my-1.5 h-7 w-[50px] bg-black text-center font-rubik text-4 font-700 uppercase leading-7 text-[#f4f4f4]">
              Fri
            </div>
            <div class="my-1.5 h-7 w-[50px] bg-black text-center font-rubik text-4 font-700 uppercase leading-7 text-[#f4f4f4]">
              Sat
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <For each={scheduleStore.calendarList}>
                {(item) => {
                  const isThisMoth =
                    item.month === new Date(todayDate).getMonth();
                  const isToday =
                    item.month === new Date(todayDate).getMonth() &&
                    item.date === new Date(todayDate).getDate();
                  return (
                    <div
                      class={`scheduleDate flex h-7 w-[50px] items-center justify-center border-b border-dotted border-b-[#16161633] text-center font-rubik text-[13px] font-700 uppercase leading-7 ${isThisMoth ? "text-[#383838]" : "text-[#0000004d]"}`}
                    >
                      <Show
                        when={item.time1 >= 0}
                        fallback={
                          <span
                            class={`${isToday ? "toDayDate mx-0.5 h-6.5 w-7.5 rounded-sm bg-[#38E07B] shadow-md" : ""}`}
                          >
                            {item.date}
                          </span>
                        }
                      >
                        <span class="flex flex-col font-rubik text-2.5 font-600 uppercase leading-2.5 text-[#0000004d] opacity-0">
                          <span>{item.time1}</span>
                          <span>{item.time2}</span>
                        </span>
                        <span
                          class={`${isToday ? "toDayDate mx-0.5 h-6.5 w-7.5 rounded-sm bg-[#38E07B] shadow-md" : ""}`}
                        >
                          {item.date}
                        </span>
                        <span class="flex flex-col font-rubik text-2.5 font-600 uppercase leading-2.5 text-[#0000004d]">
                          <span>{item.time1}</span>
                          <span>{item.time2}</span>
                        </span>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </Suspense>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <div class="relative flex w-full snap-x snap-mandatory overflow-x-auto bg-white [&::-webkit-scrollbar-thumb]:bg-black/90 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar]:h-2">
              <For each={chunk(scheduleStore.historyList, 5).reverse()}>
                {(data) => (
                  <div class="min-w-[360px] snap-start overflow-hidden pl-1 pr-1 pt-1">
                    <For each={data}>
                      {(item) => (
                        <div class="mb-0.5 flex h-6 w-full">
                          <div class="relative h-full w-[90px] bg-black px-1 font-rubik text-3.5 font-500 leading-6 text-white">
                            {item.index + 1} - {item.index + 200}
                            <span
                              class="absolute -right-[5.5px] top-1 h-4 w-2 bg-black"
                              style={{
                                "clip-path":
                                  "polygon(0% 0%, 100% 50%, 0% 100%)",
                              }}
                            ></span>
                          </div>
                          <div class="flex flex-1 bg-white">
                            <div class="h-full w-[120px] pl-8 font-rubik text-3.5 font-500 leading-6">
                              {item.from_date}
                            </div>
                            <div class="h-full w-[120px] pl-8 font-rubik text-3.5 font-500 leading-6">
                              {item.to_date}
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                )}
              </For>
              <button
                class="absolute right-1 top-1 z-50 h-5 w-5 opacity-0 transition hover:opacity-100"
                onclick={handleLoadAllHistory}
              >
                <OcPluscircle3 size={15} />
              </button>
            </div>
          </Suspense>

          <div class="h-fit w-full bg-[url('/images/grunge-image-tree.webp')] bg-cover bg-center">
            <p class="p-1 font-garamond text-4 font-500 leading-4.5">
              The tree that is supposed to grow to a proud height can dispense
              with bad weather and storms. Whether misfortune and external
              resistance, some kinds of hatred, jealousy, stubbornness,
              mistrust, hardness, avarice, and violence do not belong among the
              favorable conditions without which any great growth. The poison of
              which weaker natures perish strengthens the strong — nor do they
              call it poison.
            </p>
          </div>
        </div>

        {/* ///////////////////////////////////////////////////////////// */}
        <Dialog open={openDialogReset()} onOpenChange={setOpenDialogReset}>
          <Dialog.Portal>
            <Dialog.Overlay
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50%-180px)]"} top-0 z-50 h-[calc(100vh-36px)] w-[360px] bg-black/60`}
            />

            <div
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50%-180px)]"} top-0 z-50 flex h-[calc(100vh-36px)] w-[360px] items-center justify-center`}
            >
              <Dialog.Content class="no-scrollbar z-50 w-3/4 overflow-y-scroll rounded-sm outline-none">
                <div class="flex h-8 w-full justify-between border-b border-gray-500 bg-gray-200">
                  <Dialog.Label class="ml-1 font-rubik text-4.5 font-400 leading-8">
                    Reset today task
                  </Dialog.Label>
                  <Dialog.Close class="btn-close">
                    <OcX2 size={15} />
                  </Dialog.Close>
                </div>
                <form
                  action={submitTodayReset}
                  method="post"
                  class="w-full bg-gray-50 p-1"
                >
                  <input
                    hidden
                    name="createdAt"
                    autocomplete="off"
                    value={navStore.todaySchedule.created_at}
                  />
                  <div class="mb-1 grid grid-cols-2 gap-1">
                    <input
                      class="rounded-[3px] border border-gray-200 pl-2 pt-0.5 font-rubik text-4.5 leading-4.5 outline-none"
                      name="todayIndex1"
                      autocomplete="off"
                      type="number"
                      min={0}
                      value={navStore.todaySchedule.time1}
                    />
                    <input
                      class="rounded-[3px] border border-gray-200 pl-2 pt-0.5 font-rubik text-4.5 leading-4.5 outline-none"
                      name="todayIndex2"
                      autocomplete="off"
                      type="number"
                      min={0}
                      value={navStore.todaySchedule.time2}
                    />
                  </div>

                  <button
                    type="submit"
                    class="flex h-9 w-full items-center justify-center rounded-[3px] bg-[#070707] text-[#ececec] shadow transition hover:bg-black hover:text-white"
                  >
                    <BiSolidSave size={15} />
                  </button>
                </form>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        </Dialog>

        <Dialog
          open={openDialogSchedule()}
          onOpenChange={setOpenDialogSchedule}
        >
          <Dialog.Portal>
            <Dialog.Overlay
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50%-180px)]"} top-0 z-50 h-[calc(100vh-36px)] w-[360px] bg-black/60`}
            />

            <div
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50%-180px)]"} top-0 z-50 flex h-[calc(100vh-36px)] w-[360px] items-center justify-center`}
            >
              <Dialog.Content class="no-scrollbar z-50 w-3/4 overflow-y-scroll rounded-sm outline-none">
                <div class="flex h-8 w-full justify-between border-b border-gray-500 bg-gray-200">
                  <Dialog.Label class="ml-1 font-rubik text-4.5 font-400 leading-8">
                    Create new schedule
                  </Dialog.Label>
                  <Dialog.Close class="btn-close">
                    <OcX2 size={15} />
                  </Dialog.Close>
                </div>
                <form
                  class="w-full bg-gray-50 p-1"
                  action={submitNewSchedule}
                  method="post"
                >
                  <button
                    type="submit"
                    class="h-9 w-full items-center justify-center rounded-[3px] bg-[#070707] shadow transition hover:bg-black"
                  >
                    🗓️
                  </button>
                </form>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        </Dialog>

        <Portal>
          <Toast.Region duration={3000}>
            <Toast.List class="toast__list" />
          </Toast.Region>
        </Portal>
      </main>
    </MetaProvider>
  );
}
