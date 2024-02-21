import { A, useAction } from "@solidjs/router";
import { Component, Show } from "solid-js";
import { logout } from "~/api";
import "/public/styles/bottom.scss";
import { useGlobalContext } from "~/globalcontext/store";
import { OcKebabhorizontal2 } from "solid-icons/oc";
import { Motion, Presence } from "solid-motionone";

const Bottom: Component<{}> = () => {
  const logoutAction = useAction(logout);

  const {
    bottomIndex,
    bottomActive,
    setBottomActive,
    bottomLooping,
    totalMemories,
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
      <button class="mainFooterCenterBtn" onClick={() => logoutAction()}>
        <Show when={totalMemories()} fallback={229}>
          {totalMemories()}
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
