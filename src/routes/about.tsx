import { Component, Index, Show, createResource, createSignal } from "solid-js";
import {
  RouteDefinition,
  action,
  createAsync,
  useAction,
  useSubmission,
} from "@solidjs/router";
import { getUser } from "~/api";
import { getCalendarHistoryData, getCalendarScheduleData } from "~/api/api";

import "../../public/styles/about.scss";
import { supabase } from "~/api/supabase";

export const route = {
  load: () => {
    getUser();
  },
} satisfies RouteDefinition;

const About: Component<{}> = (props) => {
  const user = createAsync(getUser, { deferStream: true });
  const calendarScheduleData = createAsync(getCalendarScheduleData, {
    deferStream: true,
  });

  const calendarHistoryData = createAsync(getCalendarHistoryData, {
    deferStream: true,
  });

  return (
    <div>
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
      <Index each={calendarHistoryData()}>
        {(data, i) => {
          return (
            <div>
              <div>
                <span class="desc">{data().type}</span>
                <span>{data().week1.from_day}</span>
                <span>{data().week1.to_day}</span>
              </div>
              <div>
                <span class="desc">{data().type + 200}</span>
                <span>{data().week2.from_day}</span>
                <span>{data().week2.to_day}</span>
              </div>
              <div>
                <span class="desc">{data().type + 400}</span>
                <span>{data().week3.from_day}</span>
                <span>{data().week3.to_day}</span>
              </div>
              <div>
                <span class="desc">{data().type + 600}</span>
                <span>{data().week4.from_day}</span>
                <span>{data().week4.to_day}</span>
              </div>
              <div>
                <span class="desc">{data().type + 800}</span>
                <span>{data().week5.from_day}</span>
                <span>{data().week5.to_day}</span>
              </div>
            </div>
          );
        }}
      </Index>
    </div>
  );
};

export default About;
