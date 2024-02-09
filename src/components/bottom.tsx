import { A, useAction, useSubmission } from "@solidjs/router";
import { Component, Show, onMount } from "solid-js";
import { logout } from "~/api";
import "/public/styles/bottom.scss";
import { getCalendarTodayData, getMemoriesLength } from "~/api/api";
import { useGlobalContext } from "~/globalcontext/store";
import { OcDotfill2, OcKebabhorizontal2 } from "solid-icons/oc";

const Bottom: Component<{}> = (props) => {
  const logoutAction = useAction(logout);
  const getMemoriesLengthResult = useSubmission(getMemoriesLength);

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
        <Show when={getMemoriesLengthResult.result} fallback={229}>
          {getMemoriesLengthResult.result}
        </Show>
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
        <OcKebabhorizontal2
          size={12}
          class="wordListDot"
          color={bottomIndex() > 0 ? "#38E07B" : "#000"}
        />
      </div>
    </div>
  );
};

export default Bottom;
