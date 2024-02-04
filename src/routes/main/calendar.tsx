import { Component, Index, Show, createSignal, onMount } from "solid-js";
import { RouteDefinition, createAsync, useAction } from "@solidjs/router";
import { getUser } from "~/api";
import {
  getCalendarHistoryData,
  getCalendarScheduleData,
  getImageFromUnsplash,
} from "~/api/api";

import { HistoryType } from "~/types";
import "/public/styles/calendar.scss";
import { url } from "inspector";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;

const About: Component<{}> = (props) => {
  const calendarScheduleData = createAsync(getCalendarScheduleData, {
    deferStream: true,
  });

  const calendarImageUrl = createAsync(getImageFromUnsplash, {
    deferStream: true,
  });

  const [historyData, setHistoryData] = createSignal<HistoryType[]>();
  const getCalendarHistoryDataAction = useAction(getCalendarHistoryData);
  const [todayDate, setTodayDate] = createSignal<Date>(new Date());

  onMount(() => {
    // console.log([...calendarScheduleData()]);
    // setTodayDate(new Date());
    getCalendarHistoryDataFromStorage();
  });
  const getCalendarHistoryDataFromStorage = async () => {
    const data = sessionStorage.getItem("history");
    if (!data) {
      const result = await getCalendarHistoryDataAction();
      setHistoryData(result);
      sessionStorage.setItem("history", JSON.stringify(result));
    } else setHistoryData(JSON.parse(data));
  };

  return (
    <div class="calendar">
      {/* 
      <br></br>
      <Index each={historyData()}>
        {(data, i) => {
          return (
            <div>
              <div>
                <span class="desc">{data().week1.index}</span>
                <span>{data().week1.from_date}</span>
                <span>{data().week1.to_date}</span>
              </div>
              <div>
                <span class="desc">{data().week2.index}</span>
                <span>{data().week2.from_date}</span>
                <span>{data().week2.to_date}</span>
              </div>{" "}
              <div>
                <span class="desc">{data().week3.index}</span>
                <span>{data().week3.from_date}</span>
                <span>{data().week3.to_date}</span>
              </div>{" "}
              <div>
                <span class="desc">{data().week4.index}</span>
                <span>{data().week4.from_date}</span>
                <span>{data().week4.to_date}</span>
              </div>{" "}
              <div>
                <span class="desc">{data().week5.index}</span>
                <span>{data().week5.from_date}</span>
                <span>{data().week5.to_date}</span>
              </div>
            </div>
          );
        }}
      </Index> */}
      <div class="calendarCard">
        <div
          class="calendarImage"
          // style={{
          //   "background-image": `url('/images/main/${
          //     todayDate().getMonth() + 1
          //   }.jpg')`,
          // }}
          style={{
            "background-image": `url(${calendarImageUrl()})`,
          }}
        >
          <div class="calendarImageContent">
            <p>{todayDate().toLocaleString("default", { month: "long" })}</p>
            <p>{todayDate().getFullYear()}</p>
            <p>201 &#183; 400</p>
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
          <Index each={calendarScheduleData()}>
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
        </div>
      </div>
    </div>
  );
};

export default About;
