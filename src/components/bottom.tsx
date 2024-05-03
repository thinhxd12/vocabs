import { A } from "@solidjs/router";
import { Component, Show } from "solid-js";
import "/public/styles/bottom.scss";
import { useGlobalContext } from "~/globalcontext/store";
import { Motion, Presence } from "solid-motionone";
import { format } from "date-fns";

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
    counter,
    wordList,
  } = useGlobalContext();

  return (
    <div class="bottom">
      <div class="mainFooterLeftIndex">
        <div class="indexIndex">
          <Show
            when={todayData().date}
            fallback={
              <>
                <span>
                  <small>N</small>
                </span>
                <span>
                  <small>N</small>
                </span>
              </>
            }
          >
            <span>{todayData().time1}</span>
            <span>{todayData().time2}</span>
          </Show>
        </div>
        <div class="indexDay">
          <span>{format(new Date(), "eeeeee")}</span>
        </div>
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
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{ duration: 0.6, easing: "ease" }}
                src="/images/main/sunrise.jpg"
                class="mainFooterCornerBtnImage"
              />
            }
          >
            <Motion.img
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{ duration: 0.6, easing: "ease" }}
              src="/images/main/sunset.jpg"
              class="mainFooterCornerBtnImage"
            />
          </Show>
        </Presence>
        <div
          class={
            bottomLooping() ? "inputWordRow inputWordRowActive" : "inputWordRow"
          }
        >
          <Show when={wordList().length > 0}>
            {bottomIndex() + counter() - 1}
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Bottom;
