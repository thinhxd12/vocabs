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
  getThisWeekIndex,
  submitNewHistory,
  submitNewMonth,
  submitNewWeek,
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

let refEl: HTMLDivElement;

export const route = {
  load: () => getScheduleData(),
};

const Calendar: Component<{}> = (props) => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const schedule = createAsync(() => getScheduleData(), { deferStream: true });

  onMount(async () => {
    if (mainStore.historyList.length === 0) {
      const dataHistory = await getCalendarHistory();
      if (dataHistory) setMainStore("historyList", dataHistory);
    }
    if (!mainStore.thisWeekIndex) {
      const index = await getThisWeekIndex();
      if (index) setMainStore("thisWeekIndex", index + 1);
    }
  });

  const handleUpdateHistoryList = () => {
    setTimeout(async () => {
      const data = await getCalendarHistory();
      if (data) setMainStore("historyList", data);
    }, 1000);
    setShowNewWeek(false);
    setShowNewHistory(false);
    setShowNewMonth(false);
  };

  const [todayDate] = createSignal<Date>(new Date());

  // ---------------------POP UP---------------------------
  const [showNewWeek, setShowNewWeek] = createSignal<boolean>(false);
  const [showTodayReset, setShowTodayReset] = createSignal<boolean>(false);
  const [showNewHistory, setShowNewHistory] = createSignal<boolean>(false);
  const [showNewMonth, setShowNewMonth] = createSignal<boolean>(false);
  // ---------------------POP UP---------------------------

  onMount(() => {
    refEl.addEventListener("wheel", (event) => {
      event.preventDefault();
      refEl.scrollBy({
        left: event.deltaY < 0 ? -60 : 60,
      });
    });
  });

  return (
    <MetaProvider>
      <Title>📆</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div class={styles.calendar}>
        <div class={styles.calendarCard}>
          <div class={styles.calendarImage}>
            <img
              src={`/images/main/${format(todayDate(), "M")}.webp`}
              width={360}
              height={240}
            />
            <div class={styles.calendarImageContent}>
              <p
                class={styles.setNewMonth}
                onClick={() => setShowNewMonth(true)}
              >
                {format(todayDate(), "MMMM")}
              </p>
              <p class={styles.setNewWeek} onClick={() => setShowNewWeek(true)}>
                {format(todayDate(), "yyyy")}
              </p>
              <p
                class={styles.setNewHistory}
                onClick={() => setShowNewHistory(true)}
              >
                {mainStore.thisWeekIndex} &#183; {mainStore.thisWeekIndex + 199}
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
                                when={date().month === todayDate().getMonth()}
                                fallback={
                                  <div class={styles.dateText}>
                                    {date().date}
                                  </div>
                                }
                              >
                                <Show
                                  when={
                                    date().month === todayDate().getMonth() &&
                                    date().date === todayDate().getDate()
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
                                  when={date().date === todayDate().getDate()}
                                  fallback={
                                    <div
                                      class={
                                        date().time1 > 0
                                          ? `${styles.dateTimeIndex} ${styles.dateTimeIndexDone}`
                                          : styles.dateTimeIndex
                                      }
                                    >
                                      <div>{date().time1}</div>
                                      <div>{date().time2}</div>
                                    </div>
                                  }
                                >
                                  <div
                                    class={`${styles.dateTimeIndex} ${styles.dateTimeIndexToday}`}
                                  >
                                    <div>{date().time1}</div>
                                    <div>{date().time2}</div>
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

        <Suspense fallback={<div class={styles.calendarHistoryLoading}></div>}>
          <div class={styles.calendarHistory} ref={refEl}>
            <Index each={mainStore.historyList}>
              {(data, i) => {
                return (
                  <HistoryCard
                    item={data()}
                    class={i % 2 === 0 ? "oddCard" : "evenCard"}
                  />
                );
              }}
            </Index>
          </div>
        </Suspense>

        {/* new week */}
        <Presence>
          <Show when={showNewWeek()}>
            <Motion
              initial={{ minHeight: "0px" }}
              animate={{ minHeight: "85px" }}
              exit={{ minHeight: "0px" }}
              transition={{ duration: 0.5 }}
              class={styles.calendarDropdownContainer}
            >
              <CalendarDropdown
                onClose={setShowNewWeek}
                header="Set new schedule!"
              >
                <form
                  class={forms.formBody}
                  action={submitNewWeek}
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
                        name="startIndex"
                      >
                        <option value="0">1 - 200</option>
                        <option value="200">201 - 400</option>
                        <option value="400">401 - 600</option>
                        <option value="600">601 - 800</option>
                        <option value="800">801 - 1000</option>
                        <option value="1000">1001 - 1200</option>
                        <option value="1200">1201 - 1400</option>
                        <option value="1400">1401 - 1600</option>
                        <option value="1600">1601 - 1800</option>
                        <option value="1800">1801 - 2000</option>
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
        {/* showNewHistory */}
        <Presence>
          <Show when={showNewHistory()}>
            <Motion
              initial={{ minHeight: "0px" }}
              animate={{ minHeight: "85px" }}
              exit={{ minHeight: "0px" }}
              transition={{ duration: 0.5 }}
              class={styles.calendarDropdownContainer}
            >
              <CalendarDropdown
                onClose={setShowNewHistory}
                header="Set new history row!"
              >
                <form
                  class={forms.formBody}
                  action={submitNewHistory}
                  method="post"
                >
                  <input
                    name="monthId"
                    value={mainStore.historyList[0].created_at}
                    style={{ display: "none" }}
                  />
                  <div class={forms.calendarFormGroupContainer}>
                    <div class={forms.calendarFormInputGroup}>
                      <select
                        class={forms.calendarFormSelect}
                        name="indexWeek"
                        value={mainStore.thisWeekIndex}
                      >
                        <option value="1">1 - 200</option>
                        <option value="201">201 - 400</option>
                        <option value="401">401 - 600</option>
                        <option value="601">601 - 800</option>
                        <option value="801">801 - 1000</option>
                        <option value="1001">1001 - 1200</option>
                        <option value="1201">1201 - 1400</option>
                        <option value="1401">1401 - 1600</option>
                        <option value="1601">1601 - 1800</option>
                        <option value="1801">1801 - 2000</option>
                      </select>
                    </div>
                    <div class={forms.calendarFormInputGroup}>
                      <input
                        class={forms.calendarFormInputDate}
                        name="fromDate"
                        autocomplete="off"
                        type="date"
                      />
                    </div>
                    <div class={forms.calendarFormInputGroup}>
                      <input
                        class={forms.calendarFormInput}
                        name="toDate"
                        autocomplete="off"
                        type="date"
                      />
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
        {/* showNewMonth */}
        <Presence>
          <Show when={showNewMonth()}>
            <Motion
              initial={{ minHeight: "0px" }}
              animate={{ minHeight: "85px" }}
              exit={{ minHeight: "0px" }}
              transition={{ duration: 0.5 }}
              class={styles.calendarDropdownContainer}
            >
              <CalendarDropdown
                onClose={setShowNewMonth}
                header="Set new history slide!"
              >
                <form
                  class={styles.calendarDropdownForm}
                  action={submitNewMonth}
                  method="post"
                >
                  <div class={forms.calendarFormGroupContainer}>
                    <div class={forms.calendarFormInputGroup}>
                      <select
                        class={forms.calendarFormSelect}
                        name="startMonthIndex"
                      >
                        <option value="1">1 - 1000</option>
                        <option value="1001">1001 - 2000</option>
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
