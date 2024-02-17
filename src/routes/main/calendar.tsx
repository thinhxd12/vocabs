import { Component, Index, Show, createSignal, onMount } from "solid-js";
import { RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import { getUser } from "~/api";
import {
  getCalendarHistoryData,
  getCalendarScheduleData,
  getImageFromUnsplash,
  getThisWeekData,
  submitNewHistory,
  submitNewMonth,
  submitNewWeek,
  submitTodayReset,
} from "~/api/api";

import { HistoryType } from "~/types";
import "/public/styles/calendar.scss";
import { createSlider } from "solid-slider";
import HistoryCard from "~/components/historycard";
import CalendarDropdown from "~/components/calendardropdown";
import { Motion, Presence } from "solid-motionone";
import { Meta, MetaProvider, Title } from "@solidjs/meta";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;
let ref: HTMLDivElement;

const About: Component<{}> = (props) => {
  const [historyData, setHistoryData] = createSignal<HistoryType[]>();
  const getCalendarHistoryDataAction = useAction(getCalendarHistoryData);
  const [todayDate, setTodayDate] = createSignal<Date>(new Date());
  const [weekIndex, setWeekIndex] = createSignal<number>(0);

  const getImageFromUnsplashAction = useAction(getImageFromUnsplash);
  const getImageFromUnsplashResult = useSubmission(getImageFromUnsplash);
  const getCalendarScheduleDataAction = useAction(getCalendarScheduleData);
  const calendarScheduleDataResult = useSubmission(getCalendarScheduleData);
  const getThisWeekDataAction = useAction(getThisWeekData);

  const options = {
    duration: 1000,
    loop: true,
    initial: -1,
  };
  const [slider, { current, next, prev, moveTo }] = createSlider(options);

  onMount(async () => {
    //get image calendar
    // getImageFromUnsplashAction();
    //get calendar history
    await getCalendarHistoryDataFromStorage();
    // set slider
    slider(ref);
    //get calendar schedule
    getCalendarScheduleDataAction();
    //get calendarImageContent
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
              <div class="calendarWeek">
                <div class="calendarDayLoading">11</div>
                <div class="calendarDayLoading">12</div>
                <div class="calendarDayLoading">13</div>
                <div class="calendarDayLoading">14</div>
                <div class="calendarDayLoading">15</div>
                <div class="calendarDayLoading">16</div>
                <div class="calendarDayLoading">17</div>
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
      <Title>Amor fati</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <Motion.div
        class="calendar"
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.6 }}
      >
        <div class="calendarCard">
          <div
            class="calendarImage"
            style={{
              "background-image": `url('/images/main/${
                todayDate().getMonth() + 1
              }.jpg')`,
            }}
            // style={{
            //   "background-image": `url(${getImageFromUnsplashResult.result})`,
            // }}
          >
            <div class="calendarImageContent">
              <p onClick={handleShowSetNewMonth}>
                {todayDate().toLocaleString("default", { month: "long" })}
              </p>
              <p onClick={handleShowSetNewWeek}>{todayDate().getFullYear()}</p>
              <p onClick={handleShowSetNewHistory}>
                {weekIndex() + 1} &#183; {weekIndex() + 200}
              </p>
            </div>
          </div>
          <div class="calendarDates">
            <div class="calendarWeek">
              <div class="calendarWeekTitle">Sun</div>
              <div class="calendarWeekTitle">Mon</div>
              <div class="calendarWeekTitle">Tue</div>
              <div class="calendarWeekTitle">Wed</div>
              <div class="calendarWeekTitle">Thu</div>
              <div class="calendarWeekTitle">Fri</div>
              <div class="calendarWeekTitle">Sat</div>
            </div>
            <Show
              when={calendarScheduleDataResult.result}
              fallback={<CalendarLoading />}
            >
              <Index each={calendarScheduleDataResult.result}>
                {(data, i) => {
                  return (
                    <div class="calendarWeek">
                      <Index each={data()}>
                        {(date, n) => {
                          return (
                            <div class="calendarDay">
                              <Show when={"time1" in date()}>
                                <div class="dateTimeIndexHidden">
                                  {Math.max(date().time1, date().time2)}
                                </div>
                              </Show>
                              <div
                                class={
                                  date().month === todayDate().getMonth()
                                    ? "dateTextThisMonth"
                                    : "dateText"
                                }
                              >
                                <Show
                                  when={
                                    date().month === todayDate().getMonth() &&
                                    date().date === todayDate().getDate()
                                  }
                                  fallback={date().date}
                                >
                                  <div
                                    class="todayDate"
                                    onClick={() => setShowTodayReset(true)}
                                  >
                                    {date().date}
                                  </div>
                                </Show>
                              </div>
                              <Show when={"time1" in date()}>
                                <div
                                  class={
                                    date().time1 > 0
                                      ? "dateTimeIndex dateTimeIndexDone"
                                      : date().date === todayDate().getDate()
                                      ? "dateTimeIndex dateTimeIndexToday"
                                      : "dateTimeIndex"
                                  }
                                >
                                  <div>{date().time1}</div>
                                  <div>{date().time2}</div>
                                </div>
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
          <div class="calendarHistory" ref={ref}>
            <Index each={historyData()}>
              {(data, i) => {
                return <HistoryCard item={data()} />;
              }}
            </Index>
          </div>
        </Show>

        <div class="calendarDropdownContainer">
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
                    class="calendarDropdownForm"
                    action={submitNewWeek}
                    method="post"
                  >
                    <div class="calendarDropdownFormContent">
                      <div class="calendarInputGroup">
                        <input
                          class="calendarInputDate"
                          name="startDay"
                          autocomplete="off"
                          type="date"
                        />
                      </div>
                      <div class="calendarInputGroup">
                        <select class="calendarSelect" name="startIndex">
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
                    <button class="calendarSubmitBtn" type="submit">
                      submit
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
                    class="calendarDropdownForm"
                    action={submitTodayReset}
                    method="post"
                  >
                    <div class="calendarDropdownFormContent">
                      <div class="calendarInputGroup">
                        <input
                          class="calendarInput"
                          name="todayIndex1"
                          autocomplete="off"
                          type="number"
                          max={9}
                          min={0}
                        />
                      </div>
                      <div class="calendarInputGroup">
                        <input
                          class="calendarInput"
                          name="todayIndex2"
                          autocomplete="off"
                          type="number"
                          max={9}
                          min={0}
                        />
                      </div>
                    </div>
                    <button class="calendarSubmitBtn" type="submit">
                      submit
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
                  header="Set new history item!"
                >
                  <form
                    class="calendarDropdownForm"
                    action={submitNewHistory}
                    method="post"
                  >
                    <input
                      name="monthId"
                      value={historyData()!.pop()!.id}
                      style={{ display: "none" }}
                    />
                    <div class="calendarDropdownFormContent">
                      <div class="calendarInputGroup">
                        <select
                          class="calendarSelect"
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
                      <div class="calendarInputGroup">
                        <input
                          class="calendarInputDate"
                          name="fromDate"
                          autocomplete="off"
                          type="date"
                        />
                      </div>
                      <div class="calendarInputGroup">
                        <input
                          class="calendarInputDate"
                          name="toDate"
                          autocomplete="off"
                          type="date"
                        />
                      </div>
                    </div>
                    <button class="calendarSubmitBtn" type="submit">
                      submit
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
                  header="Set new history month!"
                >
                  <form
                    class="calendarDropdownForm"
                    action={submitNewMonth}
                    method="post"
                  >
                    <div class="calendarDropdownFormContent">
                      <div class="calendarInputGroup">
                        <select class="calendarSelect" name="startMonthIndex">
                          <option value="1">1 - 1000</option>
                          <option value="1001">1001 - 2000</option>
                        </select>
                      </div>
                    </div>
                    <button class="calendarSubmitBtn" type="submit">
                      submit
                    </button>
                  </form>
                </CalendarDropdown>
              </Motion>
            </Show>
          </Presence>
        </div>
        <div class="calendarQuote">
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

export default About;
