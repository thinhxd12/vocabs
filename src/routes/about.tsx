import { Component, Show } from "solid-js";
import { RouteDefinition, createAsync } from "@solidjs/router";
import { getUser } from "~/api";

export const route = {
  load: () => getUser(),
} satisfies RouteDefinition;

const About: Component<{}> = (props) => {
  const user = createAsync(getUser, { deferStream: true });

  return (
    <div>
      <p>About {user()?.userName}</p>
    </div>
  );
};

export default About;
