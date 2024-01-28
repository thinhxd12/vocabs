import { A, useAction } from "@solidjs/router";
import { Component } from "solid-js";
import { logout } from "~/api";

const Bottom: Component<{}> = (props) => {
  const logoutAction = useAction(logout);

  return (
    <div class="bottom">
      <A
        href="/main/vocabulary"
        activeClass="mainFooterBtnActive"
        class="mainFooterBtn"
      >
        Übermensch
      </A>
      <A
        href="/main/calendar"
        activeClass="mainFooterBtnActive"
        class="mainFooterBtn"
      >
        Amor fati
      </A>
      <button
        class="mainFooterCenterBtn mainFooterCenterBtnActive"
        onClick={() => logoutAction()}
      >
        229
      </button>
      <A
        href="/main/weather"
        activeClass="mainFooterBtnActive"
        class="mainFooterBtn"
      >
        Caelus
      </A>
      <div class="mainFooterCornerBtn">
        <img src="/images/main/sunrise.jpg" class="mainFooterCornerBtnImage" />
        <input class="inputWordRow" />
      </div>
    </div>
  );
};

export default Bottom;
