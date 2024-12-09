import { Component } from "solid-js";
import { Motion } from "solid-motionone";
import "../styles/tick.css";
import { easeOutBounce, easeOutCubic, easeOutSine } from "~/lib/utils";

const TickAnimateComplete: Component<{
  delay: number;
}> = (props) => {
  return (
    <span class="tick-flip">
      <span class="tick-flip-card">
        <span
          class="tick-flip-panel-front tick-flip-front tick-flip-panel"
          style="transform: rotateX(0deg);"
        >
          <span class="tick-flip-panel-front-text">
            <span class="tick-flip-panel-text-wrapper">
              <img src="/images/cup.webp" />
            </span>
          </span>
          <span class="tick-flip-panel-front-shadow" style="opacity: 0;"></span>
        </span>
        <span
          class="tick-flip-panel-back tick-flip-back tick-flip-panel"
          style="transform: rotateX(-180deg);"
        >
          <span class="tick-flip-panel-back-text">
            <span class="tick-flip-panel-text-wrapper"></span>
          </span>
          <span
            class="tick-flip-panel-back-highlight"
            style="opacity: 2;"
          ></span>
          <span class="tick-flip-panel-back-shadow"></span>
        </span>
      </span>
      <span class="tick-flip-card" style="z-index: 10;">
        <Motion.span
          class="tick-flip-panel-front tick-flip-front tick-flip-panel"
          animate={{
            rotateX: "-180deg",
          }}
          transition={{
            duration: 0.8,
            delay: props.delay ?? 0,
            easing: easeOutBounce,
          }}
        >
          <span class="tick-flip-panel-front-text">
            <span class="tick-flip-panel-text-wrapper">1</span>
          </span>
          <Motion.span
            class="tick-flip-panel-front-shadow"
            animate={{
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
              delay: props.delay ?? 0,
              easing: easeOutSine,
            }}
          ></Motion.span>
        </Motion.span>
        <Motion.span
          class="tick-flip-panel-back tick-flip-back tick-flip-panel"
          animate={{
            rotateX: "-360deg",
          }}
          transition={{
            duration: 0.8,
            delay: props.delay ?? 0,
            easing: easeOutBounce,
          }}
        >
          <span class="tick-flip-panel-back-text">
            <span class="tick-flip-panel-text-wrapper">
              <img src="/images/cup.webp" />
            </span>
          </span>
          <Motion.span
            class="tick-flip-panel-back-highlight"
            animate={{
              opacity: [2, 0],
            }}
            transition={{
              duration: 0.8,
              delay: props.delay ?? 0,
              easing: easeOutBounce,
            }}
          ></Motion.span>
          <span class="tick-flip-panel-back-shadow" style="opacity: 0;"></span>
        </Motion.span>
      </span>
      <Motion.span
        class="tick-flip-card"
        animate={{ zIndex: [11, "unset"] }}
        transition={{
          duration: 0.8,
          delay: props.delay ?? 0,
          easing: easeOutCubic,
        }}
      >
        <span
          class="tick-flip-panel-front tick-flip-front tick-flip-panel"
          style="transform: rotateX(-180deg);"
        >
          <span class="tick-flip-panel-front-text">
            <span class="tick-flip-panel-text-wrapper">1</span>
          </span>
          <span class="tick-flip-panel-front-shadow" style="opacity: 0;"></span>
        </span>
        <span
          class="tick-flip-panel-back tick-flip-back tick-flip-panel"
          style="transform: rotateX(-360deg);"
        >
          <span class="tick-flip-panel-back-text">
            <span class="tick-flip-panel-text-wrapper">1</span>
          </span>
          <span
            class="tick-flip-panel-back-highlight"
            style="opacity: 0;"
          ></span>
          <Motion.span
            class="tick-flip-panel-back-shadow"
            animate={{
              opacity: [0, 2],
            }}
            transition={{
              duration: 0.8,
              delay: props.delay ?? 0,
              easing: easeOutCubic,
            }}
          ></Motion.span>
        </span>
      </Motion.span>
      <span class="tick-flip-spacer"></span>
      <span class="tick-flip-shadow-top tick-flip-shadow tick-flip-front"></span>
      <span class="tick-flip-shadow-bottom tick-flip-shadow tick-flip-back"></span>
      <Motion.span
        class="tick-flip-card-shadow"
        animate={{
          opacity: 0,
          scaleY: 0,
        }}
        transition={{
          duration: 0.8,
          delay: props.delay ?? 0,
          easing: easeOutBounce,
        }}
      ></Motion.span>
    </span>
  );
};

export default TickAnimateComplete;
