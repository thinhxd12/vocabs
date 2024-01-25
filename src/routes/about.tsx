import { Component, Index, Show, createSignal } from "solid-js";
import { RouteDefinition, createAsync } from "@solidjs/router";
import { getUser } from "~/api";
import { getCalendarData } from "~/api/api";

import "../../public/styles/about.css";

export const route = {
  load: () => getUser(),
} satisfies RouteDefinition;

const About: Component<{}> = (props) => {
  const user = createAsync(getUser, { deferStream: true });
  const calendarData = createAsync(getCalendarData, { deferStream: true });

  return (
    <div>
      <Index each={calendarData()}>
        {(data, i) => {
          return (
            <Index each={data()}>
              {(date, n) => {
                return <span class="date">{date().date}</span>;
              }}
            </Index>
          );
        }}
      </Index>
    </div>
  );
};

export default About;
