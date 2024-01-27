import { A, useAction } from "@solidjs/router";
import { Component } from "solid-js";
import { logout } from "~/api";

const Bottom: Component<{}> = (props) => {
  const logoutAction = useAction(logout);

  return (
    <div>
      <A href="/main">Index</A>
      <A href="/main/calendar">calendar</A>
      <A href="/main/weather">weather</A>
      <button onClick={() => logoutAction()}>Logout</button>
    </div>
  );
};

export default Bottom;
