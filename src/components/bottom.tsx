import { A, useAction, useSubmission } from "@solidjs/router";
import { Component, onMount } from "solid-js";
import { logout } from "~/api";
import "/public/styles/bottom.scss";
import { getCalendarTodayData } from "~/api/api";
import { useGlobalContext } from "~/globalcontext/store";

const Bottom: Component<{}> = (props) => {
  const logoutAction = useAction(logout);
  const getCalendarTodayDataAction = useAction(getCalendarTodayData);
  const getCalendarTodayDataResult = useSubmission(getCalendarTodayData);
  onMount(() => {
    getCalendarTodayDataAction();
  });
  const {
    bottomIndex,
    setBottomIndex,
    bottomActive,
    setBottomActive,
    bottomLooping,
    setBottomLooping,
  } = useGlobalContext();

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

      <div
        class="mainFooterCornerBtn"
        onClick={() => setBottomActive(!bottomActive())}
      >
        <img
          src={
            bottomActive()
              ? "/images/main/sunrise.jpg"
              : "/images/main/sunset.jpg"
          }
          class="mainFooterCornerBtnImage"
        />
        <input
          class={
            bottomLooping() ? "inputWordRow inputWordRowActive" : "inputWordRow"
          }
          value={bottomIndex()}
        />
      </div>
    </div>
  );
};

export default Bottom;
