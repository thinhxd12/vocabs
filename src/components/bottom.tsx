import { A } from "@solidjs/router";
import { Component, Show } from "solid-js";
import "/public/styles/bottom.scss";
import { useGlobalContext } from "~/globalcontext/store";
import { Motion, Presence } from "solid-motionone";
import { format } from "date-fns";

const Bottom: Component<{}> = () => {
  const {
    bottomActive,
    setBottomActive,
    totalMemories,
    showMenubar,
    setShowMenubar,
    todayData,
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
        <small>【God from the machine】</small>
        <span>Deus ex machina</span>
      </A>
      <A
        href="/main/calendar"
        activeClass="mainFooterBtn--active"
        class="mainFooterBtn mainFooterBtn--2"
      >
        <small>【Money does not stink】</small>
        <span>Pecunia non olet</span>
      </A>

      <button
        class="mainFooterCenterBtn"
        onClick={() => setShowMenubar(!showMenubar())}
      >
        <Show when={totalMemories()}>
          <span>{Math.floor(totalMemories() / 100)}</span>
          <small>{totalMemories() % 100}</small>
        </Show>
      </button>

      <A
        href="/main/weather"
        activeClass="mainFooterBtn--active"
        class="mainFooterBtn mainFooterBtn--3"
      >
        <small>【Danger is sweet】</small>
        <span>Dulce periculum</span>
      </A>

      <Show
        when={wordList().length > 0}
        fallback={
          <div class="mainFooterBtn mainFooterBtn--4">
            <small>【Remember you have todie】</small>
            <span>Memento mori</span>
          </div>
        }
      >
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
                  transition={{ duration: 0.3, easing: "ease" }}
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
                transition={{ duration: 0.3, easing: "ease" }}
                src="/images/main/sunset.jpg"
                class="mainFooterCornerBtnImage"
              />
            </Show>
          </Presence>
        </div>
      </Show>
    </div>
  );
};

export default Bottom;
