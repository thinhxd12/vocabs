import { A } from "@solidjs/router";
import { Component, Show } from "solid-js";
import "/public/styles/bottom.scss";
import { useGlobalContext } from "~/globalcontext/store";
import { Motion, Presence } from "solid-motionone";
import { OcDotfill2 } from "solid-icons/oc";

const Bottom: Component<{}> = () => {
  const {
    bottomIndex,
    bottomActive,
    setBottomActive,
    bottomLooping,
    totalMemories,
    showMenubar,
    setShowMenubar,
    todayData,
  } = useGlobalContext();

  return (
    <div class="bottom">
      <div class="bottom-center-index">
        <span>{todayData().time1}</span>
        <OcDotfill2 size={4} />
        <span>{todayData().time2}</span>
      </div>
      <A
        href="/main/vocabulary"
        activeClass="mainFooterBtn--active"
        class="mainFooterBtn mainFooterBtn--1"
      >
        Übermensch
      </A>
      <A
        href="/main/calendar"
        activeClass="mainFooterBtn--active"
        class="mainFooterBtn mainFooterBtn--2"
      >
        Amor fati
      </A>
      <button
        class="mainFooterCenterBtn"
        onClick={() => setShowMenubar(!showMenubar())}
      >
        <Show when={totalMemories()} fallback={229}>
          {totalMemories()}
        </Show>
      </button>

      <A
        href="/main/weather"
        activeClass="mainFooterBtn--active"
        class="mainFooterBtn mainFooterBtn--3"
      >
        Cealus
      </A>

      <div
        class="mainFooterCornerBtn"
        onClick={() => setBottomActive(!bottomActive())}
      >
        <Presence>
          <Show
            when={bottomActive()}
            fallback={
              <Motion.img
                initial={{
                  opacity: 0,
                  y: -30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 30,
                }}
                transition={{ duration: 0.3, easing: "ease-in-out" }}
                src="/images/main/sunset.jpg"
                class="mainFooterCornerBtnImage"
              />
            }
          >
            <Motion.img
              initial={{
                opacity: 0,
                y: -30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 30,
              }}
              transition={{ duration: 0.3, easing: "ease-in-out" }}
              src="/images/main/sunrise.jpg"
              class="mainFooterCornerBtnImage"
            />
          </Show>
        </Presence>
        <input
          class={
            bottomLooping() ? "inputWordRow inputWordRowActive" : "inputWordRow"
          }
          name="inputWordRow"
          value={bottomIndex()}
        />
      </div>
    </div>
  );
};

export default Bottom;
