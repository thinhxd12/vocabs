import {
  batch,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  Show,
  untrack,
} from "solid-js";
// https://github.com/pqina/flip/blob/master/src/js/index.js

const Tick = (initialProps: {
  number: number;
  duration?: number;
  delay?: number;
  image?: boolean;
}) => {
  const props = mergeProps(
    { delay: 0, duration: 900, image: false },
    initialProps,
  );
  let animationFrameIdRef: number;

  const [fromNumber, setFromNumber] = createSignal<number>(0);
  const [toNumber, setToNumber] = createSignal<number>(props.number);

  const easeOutBounce = (t: number) => {
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

  const easeOutSine = (t: number) => {
    return Math.sin(t * (Math.PI / 2));
  };

  const easeOutCubic = (t: number) => {
    var t1 = t - 1;
    return t1 * t1 * t1 + 1;
  };

  createEffect(() => {
    const v = props.number;
    untrack(() => {
      batch(() => {
        setDone(false);
        setToNumber(v);
        setVisualProgress(0);
      });
      draw();
    });
  });

  const [done, setDone] = createSignal<boolean>(false);
  const [shadowCard, setShadowCard] = createSignal<number>(0);
  const [shadowCardScaleY, setShadowCardScaleY] = createSignal<number>(0);
  const [visualProgress, setVisualProgress] = createSignal<number>(0);

  const draw = () => {
    const start = performance.now();

    const tick = () => {
      const t = performance.now() - start - props.delay;
      let progress = t >= 0 ? t / props.duration : 0;
      if (progress >= 1) {
        setDone(true);
        setFromNumber(props.number);
        setVisualProgress(0);
        return;
      }
      const visual_progress = easeOutBounce(progress);
      setVisualProgress(visual_progress);

      let shadowProgress = 0;
      let dist = 1;

      let d = Math.abs(visual_progress - 0.5);
      if (d < dist) {
        dist = d;
        shadowProgress = visual_progress;
      }

      let s =
        shadowProgress < 0.5
          ? easeOutSine(shadowProgress / 0.5)
          : easeOutSine((1 - shadowProgress) / 0.5);
      setShadowCard(s);
      setShadowCardScaleY(s);
      requestAnimationFrame(tick);
    };
    tick();
  };

  onCleanup(() => {
    if (typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(animationFrameIdRef);
    }
  });

  return (
    <span class="tick-flip">
      <span class="tick-flip-card">
        <span
          class="tick-flip-panel-front tick-flip-front tick-flip-panel"
          style="transform: rotateX(0deg);"
        >
          <span class="tick-flip-panel-front-text">
            <span class="tick-flip-panel-text-wrapper">
              {props.image ? (
                <img
                  src="/images/cup.webp"
                  class="absolute left-0.1 w-8 object-contain"
                />
              ) : (
                toNumber()
              )}
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

      <Show when={!done()}>
        <span
          class="tick-flip-card"
          style={{ "z-index": visualProgress() > 0.5 && !done() ? 10 : 1 }}
        >
          <span
            class="tick-flip-panel-front tick-flip-front tick-flip-panel"
            style={{ transform: `rotateX(${visualProgress() * -180}deg)` }}
          >
            <span class="tick-flip-panel-front-text">
              <span class="tick-flip-panel-text-wrapper">{fromNumber()}</span>
            </span>
            <span
              class="tick-flip-panel-front-shadow"
              style={{ opacity: 1 - Math.abs(visualProgress() - 0.5) * 2 }}
            ></span>
          </span>

          <span
            class="tick-flip-panel-back tick-flip-back tick-flip-panel"
            style={{
              transform: `rotateX(${-180 + visualProgress() * -180}deg)`,
            }}
          >
            <span class="tick-flip-panel-back-text">
              <span class="tick-flip-panel-text-wrapper">
                {props.image ? (
                  <img
                    src="/images/cup.webp"
                    class="absolute left-0.1 w-8 object-contain"
                  />
                ) : (
                  toNumber()
                )}
              </span>
            </span>
            <span
              class="tick-flip-panel-back-highlight"
              style={{ opacity: 1 - (visualProgress() - 0.5) / 0.5 }}
            ></span>
            <span
              class="tick-flip-panel-back-shadow"
              style="opacity: 0;"
            ></span>
          </span>
        </span>
      </Show>

      <span class="tick-flip-card" style="">
        <span
          class="tick-flip-panel-front tick-flip-front tick-flip-panel"
          style="transform: rotateX(-180deg);"
        >
          <span class="tick-flip-panel-front-text">
            <span class="tick-flip-panel-text-wrapper">{fromNumber()}</span>
          </span>
          <span class="tick-flip-panel-front-shadow" style="opacity: 0;"></span>
        </span>
        <span
          class="tick-flip-panel-back tick-flip-back tick-flip-panel"
          style="transform: rotateX(-360deg);"
        >
          <span class="tick-flip-panel-back-text">
            <span class="tick-flip-panel-text-wrapper">{fromNumber()}</span>
          </span>
          <span
            class="tick-flip-panel-back-highlight"
            style="opacity: 0;"
          ></span>
          <Show when={visualProgress() > 0.5 && visualProgress() > 0}>
            <span
              class="tick-flip-panel-back-shadow"
              style={{ opacity: easeOutCubic(visualProgress()) }}
            ></span>
          </Show>
        </span>
      </span>

      <span class="tick-flip-spacer">{props.number}</span>
      <span class="tick-flip-shadow-top tick-flip-shadow tick-flip-front"></span>
      <span class="tick-flip-shadow-bottom tick-flip-shadow tick-flip-back"></span>
      <span
        class="tick-flip-card-shadow"
        style={{
          opacity: shadowCard(),
          transform: `scaleY(${shadowCardScaleY()})`,
        }}
      ></span>
    </span>
  );
};

export default Tick;
