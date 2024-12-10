import { Component } from "solid-js";
import { Motion } from "solid-motionone";

const TickAnimateComplete: Component<{
  delay: number;
}> = (props) => {
  function easeOutBounce(x: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  }

  const easeOutSine = function easeOutSine(t: number) {
    return Math.sin(t * (Math.PI / 2));
  };

  const easeOutCubic = function easeOutCubic(t: number) {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  };

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
