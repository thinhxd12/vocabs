import { createEffect, createSignal, on, onCleanup } from "solid-js";
import "../styles/test.css";
import FlipCard from "./FlipCard";

type FlipCardType = {
  frontValue: number;
  backValue: number;
  highlightBackOpacity: number;
  shadowBackOpacity: number;
  shadowFrontOpacity: number;
  rotate: number;
};

const Tick = (props: { number: number }) => {
  const [prevNumber, setPrevNumber] = createSignal(props.number);
  const [rotation, setRotation] = createSignal(0);

  const ease = (t: number) => {
    var scaledTime = t / 1;
    if (scaledTime < 1 / 2.75) {
      return 7.5625 * scaledTime * scaledTime;
    } else if (scaledTime < 2 / 2.75) {
      var scaledTime2 = scaledTime - 1.5 / 2.75;
      return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
    } else if (scaledTime < 2.5 / 2.75) {
      var _scaledTime = scaledTime - 2.25 / 2.75;
      return 7.5625 * _scaledTime * _scaledTime + 0.9375;
    } else {
      var _scaledTime2 = scaledTime - 2.625 / 2.75;
      return 7.5625 * _scaledTime2 * _scaledTime2 + 0.984375;
    }
  };

  const flipDuration = 800;

  const [offset, setOffset] = createSignal<number>(0);
  const [done, setDone] = createSignal<boolean>(false);
  const [visual_progress, setVisual_progress] = createSignal<number>(0);

  createEffect(
    on(
      () => props.number,
      () => {
        animate();
      },
    ),
  );
  const animate = () => {
    setOffset(Date.now());
    const tick = () => {
      let progress = (Date.now() - offset()) / flipDuration;
      if (progress >= 1) {
        progress = 1;
        setDone(true);
      }

      let visual_progress = ease(progress);

      // set default shadow and highlight levels based on visual animation progress
      const shadowFrontProgress = 1 - Math.abs(visual_progress - 0.5) * 2;
      const highlightBackProgress = 1 - (visual_progress - 0.5) / 0.5;

      let shadowFront = shadowFrontProgress;
      let highlightBack = highlightBackProgress;

      console.log(visual_progress);

      //    const p = visual_progress;

      //           if (p > 0.5 && !car.done) {
      //             card.root.style.zIndex = 10 + index;
      //           } else {
      //             card.root.style.removeProperty("z-index");
      //           }

      //           card.rotate(p * -180);
    };

    tick();
  };

  return (
    <span class="tick-flip">
      {/* card back */}
      {/* <FlipCard /> */}
      {/* card front */}
      {/* <FlipCard /> */}
    </span>
  );
};

export default Tick;
