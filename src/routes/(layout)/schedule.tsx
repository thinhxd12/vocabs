import { format } from "date-fns";
import {
  Component,
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
  getAllProgressList,
  getCalendarList,
  getDiaryList,
  getLastPartProgressList,
  getThisWeekIndex,
  submitNewSchedule,
  submitTodayReset,
} from "~/lib/server";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import toast from "solid-toast";
import { VsCalendar } from "solid-icons/vs";

const todayDate = format(new Date(), "yyyy-MM-dd");
export const route = {
  preload: () => {
    getCalendarList(todayDate),
      getThisWeekIndex(todayDate),
      getLastPartProgressList(scheduleStore.progressList.length > 0);
  },
};

const Schedule: Component<{}> = (props) => {
  let audioRef: HTMLAudioElement | undefined;
  const [audioSrc, setAudioSrc] = createSignal<string>("");

  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const progressList_data = createAsync(() =>
    getLastPartProgressList(scheduleStore.progressList.length > 0),
  );

  const calendarList_data = createAsync(() => getCalendarList(todayDate));

  const thisWeekIndex_data = createAsync(() => getThisWeekIndex(todayDate));

  createEffect(() => {
    if (progressList_data()) {
      setScheduleStore("progressList", progressList_data()!);
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
    if (scheduleStore.diaryList.length > 0) return;
    const data = await getDiaryList();
    if (data) {
      setScheduleStore("diaryList", data);
    }
  });

  const [openDialogSchedule, setOpenDialogSchedule] =
    createSignal<boolean>(false);
  const [openDialogReset, setOpenDialogReset] = createSignal<boolean>(false);

  const submitNewScheduleAction = useSubmission(submitNewSchedule);

  createEffect(
    on(
      () => submitNewScheduleAction.result,
      (v) => {
        if (!v) return;
        if (v.status) {
          toast.success(v.message, {
            className: "text-4 font-sfpro",
            position: "top-right",
          });
          setAudioSrc("/assets/sounds/mp3_Ding.mp3");
          if (audioRef) {
            audioRef.load();
            audioRef.addEventListener("canplaythrough", () => {
              audioRef.play();
            });
          }
        } else if (!v.status) {
          toast.error(v.message, {
            position: "top-right",
            className: "text-4 font-sfpro",
          });
          setAudioSrc("/assets/sounds/mp3_Boing.mp3");
          if (audioRef) {
            audioRef.load();
            audioRef.addEventListener("canplaythrough", () => {
              audioRef.play();
            });
          }
        }
        setOpenDialogSchedule(false);
        submitNewScheduleAction.clear();
      },
    ),
  );

  const submitTodayResetAction = useSubmission(submitTodayReset);

  createEffect(
    on(
      () => submitTodayResetAction.result,
      (v) => {
        if (!v) return;
        if (v.status) {
          toast.success(v.message, {
            className: "text-4 font-sfpro",
            position: "top-right",
          });
          setAudioSrc("/assets/sounds/mp3_Ding.mp3");
          if (audioRef) {
            audioRef.load();
            audioRef.addEventListener("canplaythrough", () => {
              audioRef.play();
            });
          }
        } else if (!v.status) {
          toast.error(v.message, {
            className: "text-4 font-sfpro",
            position: "top-right",
          });
          setAudioSrc("/assets/sounds/mp3_Boing.mp3");
          if (audioRef) {
            audioRef.load();
            audioRef.addEventListener("canplaythrough", () => {
              audioRef.play();
            });
          }
        }
        submitTodayResetAction.clear();
      },
    ),
  );

  const handleLoadAllHistory = async () => {
    const data = await getAllProgressList();
    if (data) {
      setScheduleStore("progressList", data);
    }
  };

  return (
    <MetaProvider>
      <Title>📆</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio ref={audioRef} hidden src={audioSrc()} />
      <main class="no-scrollbar h-main w-main relative overflow-y-scroll">
        <div class="dark-layout w-content relative !my-2 overflow-hidden rounded-2">
          <div class="relative h-[210px] w-full">
            <img
              class="h-full w-full rounded-t-2 object-cover brightness-90"
              src={`/images/${format(new Date(), "M")}.webp`}
            />
            <div class="absolute left-2 top-2 cursor-default rounded-2 bg-black/30 px-2 py-0.5 shadow-xl shadow-black/30 backdrop-blur-xl">
              <Suspense>
                <For each={scheduleStore.diaryList}>
                  {(item) => (
                    <p class="text-[7px] font-400 leading-3.5 text-white">
                      {format(new Date(item.date), "yyyy-MM-dd")} {item.count}
                    </p>
                  )}
                </For>
              </Suspense>
            </div>

            <div class="absolute bottom-2 right-2 min-w-[60px]">
              <p
                class="mb-0.5 cursor-pointer rounded-1 bg-black/30 px-1 text-center text-3.5 font-500 uppercase leading-5 text-white shadow-sm shadow-black/15 backdrop-blur-xl transition duration-100 hover:bg-black/5"
                onClick={handleLoadAllHistory}
              >
                {format(new Date(), "MMMM")}
              </p>
              <p
                class="mb-0.5 cursor-pointer rounded-1 bg-black/30 px-1 pb-1 pt-0.5 text-center text-6 font-500 uppercase leading-6 text-white shadow-sm shadow-black/15 backdrop-blur-xl transition duration-100 hover:bg-black/5"
                onClick={() => setOpenDialogReset(true)}
              >
                {format(new Date(), "yyyy")}
              </p>
              <p
                class="leading-45 cursor-pointer rounded-1 bg-black/30 px-1 text-center text-2.5 font-500 uppercase leading-4 text-white shadow-sm shadow-black/15 backdrop-blur-xl transition duration-100 hover:bg-black/5"
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
          <div class="relative flex w-full cursor-default flex-wrap justify-center overflow-hidden rounded-b-2 pt-3">
            <div class="schedule-title rounded-l-2 !text-[#f90000]">Sun</div>
            <div class="schedule-title">Mon</div>
            <div class="schedule-title">Tue</div>
            <div class="schedule-title">Wed</div>
            <div class="schedule-title">Thu</div>
            <div class="schedule-title">Fri</div>
            <div class="schedule-title rounded-r-2">Sat</div>
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
                      class={`schedule-date ${isThisMoth ? "text-white" : "text-secondary-white/50"}`}
                    >
                      <Show
                        when={item.count >= 0}
                        fallback={
                          <span
                            class={`${isToday ? "today-date mx-0.5 h-6.5 w-7.5 rounded-sm bg-[#38E07B] shadow-md" : ""}`}
                          >
                            {item.date}
                          </span>
                        }
                      >
                        <span class="font-rubik text-2.5 font-600 uppercase leading-2.5 text-black/30 opacity-0">
                          {item.count}
                        </span>
                        <span
                          class={`${isToday ? "today-date mx-0.5 h-6.5 w-7.5 rounded-1 bg-[#38E07B] shadow-lg shadow-black/30" : "mx-0.5"}`}
                        >
                          {item.date}
                        </span>
                        <span class="font-rubik text-2.5 font-600 uppercase leading-2.5 text-secondary-white/80">
                          {item.count}
                        </span>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </Suspense>
          </div>
        </div>

        <div class="w-content relative !my-2 overflow-hidden rounded-2">
          <Suspense fallback={<div>Loading...</div>}>
            <div class="relative flex w-full snap-x snap-mandatory overflow-x-auto [&::-webkit-scrollbar-thumb]:bg-black/60 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/15 [&::-webkit-scrollbar]:h-1">
              <For each={chunk(scheduleStore.progressList, 5).reverse()}>
                {(data) => (
                  <div class="min-w-full select-none snap-start overflow-hidden pl-1 pr-1 pt-1">
                    <For each={data}>
                      {(item) => (
                        <div class="mb-1 flex w-full items-center overflow-hidden rounded-2 bg-white/15 p-1 shadow-sm shadow-black/45 backdrop-blur-lg">
                          <div class="w-[90px] rounded-2 bg-black/30 pl-3 text-3.5 leading-6 text-white shadow-[0_0_3px_0px_#00000078_inset]">
                            {item.index + 1} - {item.index + 200}
                          </div>
                          <div class="flex-1 text-center text-3.5 leading-6 text-white">
                            {format(new Date(item.start_date), "yyyy-MM-dd")}
                          </div>
                          <div class="flex-1 text-center text-3.5 leading-6 text-white">
                            {format(new Date(item.end_date), "yyyy-MM-dd")}
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
        </div>

        <div class="light-layout w-content relative !my-2 overflow-hidden rounded-2 !bg-green-400/15 p-2">
          <p class="font-garamond text-4 font-500 leading-4.5">
            The tree that is supposed to grow to a proud height can dispense
            with bad weather and storms. Whether misfortune and external
            resistance, some kinds of hatred, jealousy, stubbornness, mistrust,
            hardness, avarice, and violence do not belong among the favorable
            conditions without which any great growth. The poison of which
            weaker natures perish strengthens the strong — nor do they call it
            poison.
          </p>
        </div>

        {/* ///////////////////////////////////////////////////////////// */}
        <Dialog open={openDialogReset()} onOpenChange={setOpenDialogReset}>
          <Dialog.Portal>
            <Dialog.Content
              class={`no-scrollbar w-content light-layout fixed p-2 ${layoutStore.showLayout ? "right-0 -translate-x-4" : "left-1/2 -translate-x-1/2"} top-2 z-50 flex h-[calc(100vh-54px)] items-center justify-center overflow-y-scroll rounded-2 p-2 outline-none`}
            >
              <div class="w-2/3 overflow-hidden rounded-2">
                <div class="flex h-8 w-full justify-between border-b border-black/30 bg-black/90">
                  <Dialog.Label class="pl-2 text-4 font-400 leading-8 text-white">
                    Reset today task
                  </Dialog.Label>
                  <Dialog.Close class="btn-close">
                    <OcX2 size={15} />
                  </Dialog.Close>
                </div>
                <form
                  action={submitTodayReset}
                  method="post"
                  class="w-full bg-white/30 p-2"
                >
                  <input
                    hidden
                    name="id0"
                    autocomplete="off"
                    value={navStore.todaySchedule[0].id}
                  />
                  <input
                    hidden
                    name="id1"
                    autocomplete="off"
                    value={navStore.todaySchedule[1].id}
                  />
                  <div class="mb-1 grid grid-cols-2 gap-1">
                    <input
                      class="my-1 rounded-8 bg-black/15 px-3 text-4.5 leading-4 shadow-[0_0_3px_0px_#00000054_inset] outline-none"
                      name="count0"
                      autocomplete="off"
                      type="number"
                      min={0}
                      value={navStore.todaySchedule[0].count}
                    />
                    <input
                      class="my-1 rounded-8 bg-black/15 px-3 text-4.5 leading-4 shadow-[0_0_3px_0px_#00000054_inset] outline-none"
                      name="count1"
                      autocomplete="off"
                      type="number"
                      min={0}
                      value={navStore.todaySchedule[1].count}
                    />
                  </div>

                  <button type="submit" class="btn-bookmark">
                    <BiSolidSave size={15} />
                  </button>
                </form>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>

        <Dialog
          open={openDialogSchedule()}
          onOpenChange={setOpenDialogSchedule}
        >
          <Dialog.Portal>
            <Dialog.Content
              class={`no-scrollbar w-content light-layout fixed p-2 ${layoutStore.showLayout ? "right-0 -translate-x-4" : "left-1/2 -translate-x-1/2"} top-2 z-50 flex h-[calc(100vh-54px)] items-center justify-center overflow-y-scroll rounded-2 p-2 outline-none`}
            >
              <div class="w-1/2 overflow-hidden rounded-2">
                <div class="flex h-8 w-full justify-between border-b border-black/30 bg-black/90">
                  <Dialog.Label class="pl-2 text-4 font-400 leading-8 text-white">
                    Create new schedule
                  </Dialog.Label>
                  <Dialog.Close class="btn-close">
                    <OcX2 size={15} />
                  </Dialog.Close>
                </div>
                <form
                  class="w-full bg-white/30 p-2"
                  action={submitNewSchedule}
                  method="post"
                >
                  <button type="submit" class="btn-bookmark">
                    <VsCalendar size={15} />
                  </button>
                </form>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </main>
    </MetaProvider>
  );
};

export default Schedule;
