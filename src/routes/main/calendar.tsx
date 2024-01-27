import { Component, Index, createSignal, onMount } from "solid-js";
import { RouteDefinition, createAsync, useAction } from "@solidjs/router";
import { getUser } from "~/api";
import { getCalendarHistoryData, getCalendarScheduleData } from "~/api/api";

import "/public/styles/about.scss";
import { HistoryType } from "~/types";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;

const About: Component<{}> = (props) => {
  const calendarScheduleData = createAsync(getCalendarScheduleData, {
    deferStream: true,
  });

  const [historyData, setHistoryData] = createSignal<HistoryType[]>();
  const getCalendarHistoryDataAction = useAction(getCalendarHistoryData);

  onMount(() => {
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
    <div>
      {/* <button onclick={()=>uploadObjToSupabaseAction(newdata)}>click</button> */}
      <Index each={calendarScheduleData()}>
        {(data, i) => {
          return (
            <Index each={data()}>
              {(date, n) => {
                return (
                  <div class="date">
                    <div>{date().date}</div>
                    <div class="dateIndex">
                      <div>{date().time1}</div>
                      <div>{date().time2}</div>
                    </div>
                  </div>
                );
              }}
            </Index>
          );
        }}
      </Index>
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
      </Index>
    </div>
  );
};

export default About;
