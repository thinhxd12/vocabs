import { A } from "@solidjs/router";
import { Component, Show } from "solid-js";
import "/public/styles/bottom.scss";
import { useGlobalContext } from "~/globalcontext/store";
import { Motion, Presence } from "solid-motionone";

const Bottom: Component<{}> = () => {
  const {
    bottomIndex,
    bottomActive,
    setBottomActive,
    bottomLooping,
    totalMemories,
    showMenubar,
    setShowMenubar,
  } = useGlobalContext();

  return (
    <div class="bottom">
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
        onMouseOver={() => setShowMenubar(true)}
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
        Mea culpa
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
