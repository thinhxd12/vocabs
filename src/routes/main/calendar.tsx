import {
  Component,
  Index,
  Show,
  createResource,
  createSignal,
  onMount,
} from "solid-js";
import { createAsync, useAction } from "@solidjs/router";
import {
  getCalendarHistoryData,
  getCalendarScheduleData,
  getThisWeekData,
  submitNewHistory,
  submitNewMonth,
  submitNewWeek,
  submitTodayReset,
} from "~/lib/api";

import { HistoryType } from "~/types";
import { createSlider } from "solid-slider";
import HistoryCard from "~/components/historycard";
import CalendarDropdown from "~/components/calendardropdown";
import { Motion, Presence } from "solid-motionone";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { format } from "date-fns";
import forms from "../../assets/styles/form.module.scss";
import buttons from "../../assets/styles/buttons.module.scss";
import styles from "./calendar.module.scss";
import { getUser } from "~/lib";

let ref: HTMLDivElement;

const Calendar: Component<{}> = (props) => {
  // ***************check login**************
  onMount(async () => {
    const data = sessionStorage.getItem("user");
    const userId = (data && JSON.parse(data).userId) || "";
    createAsync(
      () =>
        getUser(userId).then((data) => {
          if (data) sessionStorage.setItem("user", JSON.stringify(data));
        }),
      { deferStream: true }
    );
  });
  // ***************check login**************
  
  const [historyData, setHistoryData] = createSignal<HistoryType[]>();
  const getCalendarHistoryDataAction = useAction(getCalendarHistoryData);
  const [todayDate] = createSignal<Date>(new Date());
  const [weekIndex, setWeekIndex] = createSignal<number>(0);

  const getThisWeekDataAction = useAction(getThisWeekData);

  const [calendarScheduleData] = createResource(async () => {
    const response = await getCalendarScheduleData();
    return response;
  });

  const options = {
    duration: 1000,
    loop: true,
    initial: -1,
  };
  const [slider, { current, next, prev, moveTo }] = createSlider(options);

  onMount(async () => {
    //******get calendar history
    await getCalendarHistoryDataFromStorage();

    //******set slider
    slider(ref);

    //******get calendarImageContent
    getThisWeekDataFromStorage();
  });

  const getCalendarHistoryDataFromStorage = async () => {
    const data = sessionStorage.getItem("history");
    if (data === null || JSON.parse(data).length === 0) {
      const result = await getCalendarHistoryDataAction();
      setHistoryData(result);
      sessionStorage.setItem("history", JSON.stringify(result));
    } else setHistoryData(JSON.parse(data));
  };

  const getThisWeekDataFromStorage = async () => {
    const data = sessionStorage.getItem("week");
    if (data === null) {
      const result = await getThisWeekDataAction();
      setWeekIndex(result);
      sessionStorage.setItem("week", result);
    } else setWeekIndex(Number(data));
  };

  const CalendarLoading = () => {
    return (
      <>
        <Index each={Array.from(Array(5).keys())}>
          {(item, n) => {
            return (
              <div class={styles.calendarWeek}>
                <div class={styles.calendarDayLoading}>11</div>
                <div class={styles.calendarDayLoading}>12</div>
                <div class={styles.calendarDayLoading}>13</div>
                <div class={styles.calendarDayLoading}>14</div>
                <div class={styles.calendarDayLoading}>15</div>
                <div class={styles.calendarDayLoading}>16</div>
                <div class={styles.calendarDayLoading}>17</div>
              </div>
            );
          }}
        </Index>
      </>
    );
  };

  // ---------------------POP UP---------------------------
  const [showNewWeek, setShowNewWeek] = createSignal<boolean>(false);
  const handleShowSetNewWeek = () => {
    sessionStorage.removeItem("week");
    setShowNewWeek(true);
  };

  const [showTodayReset, setShowTodayReset] = createSignal<boolean>(false);

  const [showNewHistory, setShowNewHistory] = createSignal<boolean>(false);
  const handleShowSetNewHistory = () => {
    sessionStorage.removeItem("history");
    setShowNewHistory(true);
  };

  const [showNewMonth, setShowNewMonth] = createSignal<boolean>(false);
  const handleShowSetNewMonth = () => {
    sessionStorage.removeItem("history");
    setShowNewMonth(true);
  };

  return (
    <MetaProvider>
      <Title>schedule</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <Motion.div
        class={styles.calendar}
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.6 }}
      >
        <div class={styles.calendarCard}>
          <div
            class={styles.calendarImage}
            style={{
              "background-image": `url('/images/main/${format(
                todayDate(),
                "M"
              )}.jpg')`,
            }}
          >
            <div class={styles.calendarImageContent}>
              <p class={styles.setNewMonth} onClick={handleShowSetNewMonth}>
                {format(todayDate(), "MMMM")}
              </p>
              <p class={styles.setNewWeek} onClick={handleShowSetNewWeek}>
                {format(todayDate(), "yyyy")}
              </p>
              <p class={styles.setNewHistory} onClick={handleShowSetNewHistory}>
                {weekIndex() + 1} &#183; {weekIndex() + 200}
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
            <Show when={calendarScheduleData()} fallback={<CalendarLoading />}>
              <Index each={calendarScheduleData()}>
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
            </Show>
          </div>
        </div>

        <Show when={historyData()}>
          <div class={styles.calendarHistory} ref={ref}>
            <Index each={historyData()}>
              {(data, i) => {
                return <HistoryCard item={data()} />;
              }}
            </Index>
          </div>
        </Show>

        <div class={styles.calendarDropdownContainer}>
          {/* new week */}
          <Presence>
            <Show when={showNewWeek()}>
              <Motion
                initial={{ y: "-100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.5 }}
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
                    <button class={buttons.buttonSubmit} type="submit">
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
                initial={{ y: "-100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.5 }}
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
                          max={9}
                          min={0}
                        />
                      </div>
                      <div class={forms.calendarFormInputGroup}>
                        <input
                          class={forms.calendarFormInput}
                          name="todayIndex2"
                          autocomplete="off"
                          type="number"
                          max={9}
                          min={0}
                        />
                      </div>
                    </div>
                    <button class={buttons.buttonSubmit} type="submit">
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
                initial={{ y: "-100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.5 }}
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
                      value={historyData()!.pop()!.created_at}
                      style={{ display: "none" }}
                    />
                    <div class={forms.calendarFormGroupContainer}>
                      <div class={forms.calendarFormInputGroup}>
                        <select
                          class={forms.calendarFormSelect}
                          name="indexWeek"
                          value={weekIndex() + 1}
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
                    <button class={buttons.buttonSubmit} type="submit">
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
                initial={{ y: "-100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.5 }}
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
                    <button class={buttons.buttonSubmit} type="submit">
                      Submit
                    </button>
                  </form>
                </CalendarDropdown>
              </Motion>
            </Show>
          </Presence>
        </div>
        <div class={styles.calendarQuote}>
          The tree that is supposed to grow to a proud height can dispense with
          bad weather and storms. Whether misfortune and external resistance,
          some kinds of hatred, jealousy, stubbornness, mistrust, hardness,
          avarice, and violence do not belong among the favorable conditions
          without which any great growth. The poison of which weaker natures
          perish strengthens the strong — nor do they call it poison.
        </div>
      </Motion.div>
    </MetaProvider>
  );
};

export default Calendar;
