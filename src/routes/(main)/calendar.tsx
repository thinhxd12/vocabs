import {
  Component,
  Index,
  Show,
  Suspense,
  createSignal,
  lazy,
  onMount,
} from "solid-js";
import {
  getCalendarHistory,
  getScheduleData,
  getThisWeekScheduleIndex,
  submitNewSchedule,
  submitTodayReset,
} from "~/lib/api";
const CalendarDropdown = lazy(() => import("~/components/calendardropdown"));
import { Motion, Presence } from "solid-motionone";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { format } from "date-fns";
import forms from "../../assets/styles/form.module.scss";
import buttons from "../../assets/styles/buttons.module.scss";
import styles from "./calendar.module.scss";
import { getUser } from "~/lib";
import { createAsync } from "@solidjs/router";
import { listStore, mainStore, setMainStore } from "~/lib/mystore";
import HistoryCard from "~/components/historycard";
import { ScheduleType } from "~/types";

let refEl: HTMLDivElement;
const todayDate = format(new Date(), "yyyy-MM-dd");

export const route = {
  load: () => getScheduleData(todayDate),
};

const Calendar: Component<{}> = (props) => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const schedule = createAsync(() => getScheduleData(todayDate), {
    deferStream: true,
  });

  onMount(async () => {
    if (mainStore.historyList.length === 0) {
      const dataHistory = await getCalendarHistory();
      if (dataHistory) setMainStore("historyList", dataHistory);
    }
    if (!mainStore.thisWeekIndex) {
      const data = await getThisWeekScheduleIndex(
        todayDate,
        mainStore.historyList[0]
      );
      if (data) setMainStore("thisWeekIndex", data);
    }
  });

  const handleUpdateHistoryList = () => {
    setMainStore("historyList", []);
    setMainStore("thisWeekIndex", 0);
    setShowSetNewSchedule(false);
  };

  // ---------------------POP UP---------------------------
  const [showTodayReset, setShowTodayReset] = createSignal<boolean>(false);
  const [showSetNewSchedule, setShowSetNewSchedule] =
    createSignal<boolean>(false);
  // ---------------------POP UP---------------------------

  onMount(() => {
    refEl.addEventListener("wheel", (event) => {
      event.preventDefault();
      refEl.scrollBy({
        left: event.deltaY < 0 ? -60 : 60,
      });
    });
  });

  const IndexElement: Component<{
    date: ScheduleType;
  }> = (props) => {
    return (
      <>
        <Show
          when={props.date.time1 >= 0}
          fallback={<div class={styles.dateTimeIndexDot}></div>}
        >
          <div>{props.date.time1}</div>
          <div>{props.date.time2}</div>
        </Show>
      </>
    );
  };

  return (
    <MetaProvider>
      <Title>📆</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div class={styles.calendar}>
        <div class={styles.calendarCard}>
          <div class={styles.calendarImage}>
            <img
              src={`/images/main/${format(new Date(), "M")}.webp`}
              width={360}
              height={240}
            />
            <div class={styles.calendarImageContent}>
              <p class={styles.setNewMonth}>{format(new Date(), "MMMM")}</p>
              <p
                class={styles.setNewWeek}
                onClick={() => setShowSetNewSchedule(true)}
              >
                {format(new Date(), "yyyy")}
              </p>
              <p class={styles.setNewHistory}>
                {mainStore.thisWeekIndex + 1} &#183;{" "}
                {mainStore.thisWeekIndex + 200}
              </p>
            </div>
          </div>
          <div class={styles.calendarDates}>
            <div class={styles.calendarWeek}>
              <div class={styles.calendarWeekTitle}>Sun</div>
              <div class={styles.calendarWeekTitle}>Mon</div>
              <div class={styles.calendarWeekTitle}>Tue</div>
              <div class={styles.calendarWeekTitle}>Wed</div>
              <div class={styles.calendarWeekTitle}>Thu</div>
              <div class={styles.calendarWeekTitle}>Fri</div>
              <div class={styles.calendarWeekTitle}>Sat</div>
            </div>
            <Suspense
              fallback={<div class={styles.calendarWeekLoading}>...</div>}
            >
              <Index each={schedule()}>
                {(data, i) => {
                  return (
                    <div class={styles.calendarWeek}>
                      <Index each={data()}>
                        {(date, n) => {
                          return (
                            <div class={styles.calendarDay}>
                              <Show when={"time1" in date()}>
                                <div class={styles.dateTimeIndexHidden}>
                                  {Math.max(date().time1, date().time2)}
                                </div>
                              </Show>

                              <Show
                                when={date().month === new Date().getMonth()}
                                fallback={
                                  <div class={styles.dateText}>
                                    {date().date}
                                  </div>
                                }
                              >
                                <Show
                                  when={
                                    date().month === new Date().getMonth() &&
                                    date().date === new Date().getDate()
                                  }
                                  fallback={
                                    <div class={styles.dateTextThisMonth}>
                                      {date().date}
                                    </div>
                                  }
                                >
                                  <div
                                    class={`${styles.dateTextThisMonth} ${styles.todayDate}`}
                                    onClick={() => setShowTodayReset(true)}
                                  >
                                    {date().date}
                                  </div>
                                </Show>
                              </Show>

                              <Show when={"time1" in date()}>
                                <Show
                                  when={date().date === new Date().getDate()}
                                  fallback={
                                    <div
                                      class={
                                        date().time1 > 0
                                          ? `${styles.dateTimeIndex} ${styles.dateTimeIndexDone}`
                                          : styles.dateTimeIndex
                                      }
                                    >
                                      <IndexElement date={date()} />
                                    </div>
                                  }
                                >
                                  <div
                                    class={`${styles.dateTimeIndex} ${styles.dateTimeIndexToday}`}
                                  >
                                    <IndexElement date={date()} />
                                  </div>
                                </Show>
                              </Show>
                            </div>
                          );
                        }}
                      </Index>
                    </div>
                  );
                }}
              </Index>
            </Suspense>
          </div>
        </div>

        <Suspense
          fallback={<div class={styles.calendarHistoryLoading}>...</div>}
        >
          <div class={styles.calendarHistory} ref={refEl}>
            <Index each={mainStore.historyList}>
              {(data, i) => {
                return <HistoryCard item={data().data} />;
              }}
            </Index>
          </div>
        </Suspense>

        {/* showTodayReset */}
        <Presence>
          <Show when={showTodayReset()}>
            <Motion
              initial={{ minHeight: "0px" }}
              animate={{ minHeight: "85px" }}
              exit={{ minHeight: "0px" }}
              transition={{ duration: 0.5 }}
              class={styles.calendarDropdownContainer}
            >
              <CalendarDropdown
                onClose={setShowTodayReset}
                header="Reset today schedule!"
              >
                <form
                  class={forms.formBody}
                  action={submitTodayReset}
                  method="post"
                >
                  <div class={forms.calendarFormGroupContainer}>
                    <div class={forms.calendarFormInputGroup}>
                      <input
                        class={forms.calendarFormInput}
                        name="todayIndex1"
                        autocomplete="off"
                        type="number"
                        min={0}
                        value={listStore.listToday.time1}
                      />
                    </div>
                    <div class={forms.calendarFormInputGroup}>
                      <input
                        class={forms.calendarFormInput}
                        name="todayIndex2"
                        autocomplete="off"
                        type="number"
                        min={0}
                        value={listStore.listToday.time2}
                      />
                    </div>
                  </div>
                  <button
                    class={buttons.buttonSubmit}
                    type="submit"
                    onClick={() => setShowTodayReset(false)}
                  >
                    Submit
                  </button>
                </form>
              </CalendarDropdown>
            </Motion>
          </Show>
        </Presence>

        {/* new schedule */}
        <Presence>
          <Show when={showSetNewSchedule()}>
            <Motion
              initial={{ minHeight: "0px" }}
              animate={{ minHeight: "85px" }}
              exit={{ minHeight: "0px" }}
              transition={{ duration: 0.5 }}
              class={styles.calendarDropdownContainer}
            >
              <CalendarDropdown
                onClose={setShowSetNewSchedule}
                header="Set new schedule!"
              >
                <form
                  class={forms.formBody}
                  action={submitNewSchedule}
                  method="post"
                >
                  <div class={forms.calendarFormGroupContainer}>
                    <div class={forms.calendarFormInputGroup}>
                      <input
                        class={forms.calendarFormInput}
                        name="startDay"
                        autocomplete="off"
                        type="date"
                      />
                    </div>
                    <div class={forms.calendarFormInputGroup}>
                      <select
                        class={forms.calendarFormSelect}
                        name="startMonthIndex"
                      >
                        <option value="0">1 - 1000</option>
                        <option value="1000">1001 - 2000</option>
                      </select>
                    </div>
                  </div>
                  <button
                    class={buttons.buttonSubmit}
                    type="submit"
                    onClick={handleUpdateHistoryList}
                  >
                    Submit
                  </button>
                </form>
              </CalendarDropdown>
            </Motion>
          </Show>
        </Presence>

        <div class={styles.calendarQuote}>
          The tree that is supposed to grow to a proud height can dispense with
          bad weather and storms. Whether misfortune and external resistance,
          some kinds of hatred, jealousy, stubbornness, mistrust, hardness,
          avarice, and violence do not belong among the favorable conditions
          without which any great growth. The poison of which weaker natures
          perish strengthens the strong — nor do they call it poison.
        </div>
      </div>
    </MetaProvider>
  );
};

export default Calendar;
