import {
  Component,
  For,
  Index,
  Show,
  createEffect,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import {
  RouteDefinition,
  createAsync,
  useAction,
  useSubmission,
  useSubmissions,
} from "@solidjs/router";
import { getUser } from "~/api";
import {
  getCalendarHistoryData,
  getCalendarScheduleData,
  getCalendarTodayData,
  getImageFromUnsplash,
  getThisWeekData,
} from "~/api/api";

import { HistoryType } from "~/types";
import "/public/styles/calendar.scss";
import { url } from "inspector";
import {
  Slider,
  SliderButton,
  SliderProvider,
  createSlider,
} from "solid-slider";
import HistoryCard from "~/components/historycard";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;
let ref: HTMLDivElement;

const About: Component<{}> = (props) => {
  // const calendarScheduleData = createAsync(getCalendarScheduleData, {
  //   deferStream: true,
  // });

  const [historyData, setHistoryData] = createSignal<HistoryType[]>();
  const getCalendarHistoryDataAction = useAction(getCalendarHistoryData);
  const [todayDate, setTodayDate] = createSignal<Date>(new Date());

  const getImageFromUnsplashAction = useAction(getImageFromUnsplash);
  const getImageFromUnsplashResult = useSubmission(getImageFromUnsplash);
  const getCalendarScheduleDataAction = useAction(getCalendarScheduleData);
  const calendarScheduleDataResult = useSubmission(getCalendarScheduleData);
  const getThisWeekDataAction = useAction(getThisWeekData);
  const getThisWeekDataResult = useSubmission(getThisWeekData);

  const options = {
    duration: 1000,
    loop: true,
    initial: -1,
  };
  const [slider, { current, next, prev, moveTo }] = createSlider(options);

  onMount(() => {
    //get image calendar
    // getImageFromUnsplashAction();
    //get calendar schedule
    getCalendarScheduleDataAction();
    //get calendar history
    getCalendarHistoryDataFromStorage();
    // set slider
    slider(ref);
    //get calendarImageContent
    getThisWeekDataAction();
  });
  const getCalendarHistoryDataFromStorage = async () => {
    const data = sessionStorage.getItem("history");
    if (data === null || JSON.parse(data).length === 0) {
      const result = await getCalendarHistoryDataAction();
      setHistoryData(result);
      sessionStorage.setItem("history", JSON.stringify(result));
    } else setHistoryData(JSON.parse(data));
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

  return (
    <div class="calendar">
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
            <p>{todayDate().toLocaleString("default", { month: "long" })}</p>
            <p>{todayDate().getFullYear()}</p>
            <p>
              {getThisWeekDataResult.result + 1} &#183;{" "}
              {getThisWeekDataResult.result + 200}
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
                                <div class="todayDate">{date().date}</div>
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
      <div class="calendarHistory" ref={ref}>
        <Index each={historyData()}>
          {(data, i) => {
            return <HistoryCard item={data()} />;
          }}
        </Index>
      </div>
    </div>
  );
};

export default About;
