import {
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
  animating: boolean;
  duration?: number;
  delay?: number;
  image?: boolean;
}) => {
  const props = mergeProps({ delay: 0, duration: 800 }, initialProps);
  let animationFrameIdRef: number;

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
    let v = props.number;
    untrack(() => {
      draw();
    });
  });

  const [done, setDone] = createSignal<boolean>(false);
  const [shadowFront, setShadowFront] = createSignal<number>(0);
  const [highlightBack, setHighlightBack] = createSignal<number>(0);
  const [shadowBack, setShadowBack] = createSignal<number>(0);
  const [zIndex, setzIndex] = createSignal<number>(1);
  const [degrees, setDegrees] = createSignal<number>(0);
  const [shadowCard, setShadowCard] = createSignal<number>(0);
  const [shadowCardScaleY, setShadowCardScaleY] = createSignal<number>(0);

  const draw = () => {
    const start = performance.now();
    cancelAnimationFrame(animationFrameIdRef);
    setDone(false);
    setShadowBack(0);
    setzIndex(1);
    setDegrees(0);
    if (props.animating) {
      const tick = () => {
        const t = performance.now() - start - props.delay;

        if (t < props.duration) {
          const progress = t >= 0 ? t / props.duration : 0;

          if (progress >= 1) {
            setDone(true);
            cancelAnimationFrame(animationFrameIdRef);
            return;
          }

          if (progress > 0) {
            let visual_progress = easeOutBounce(progress);

            // update shadows
            // set default shadow and highlight levels based on visual animation progress
            const shadowFront = 1 - Math.abs(visual_progress - 0.5) * 2;
            const highlightBack = 1 - (visual_progress - 0.5) / 0.5;

            setShadowFront(shadowFront);
            setHighlightBack(highlightBack);

            // if there's a card above me, my back is visible, and the above card is falling
            if (visual_progress > 0.5 && visual_progress > 0) {
              const shadowBack = easeOutCubic(visual_progress);
              setShadowBack(shadowBack);
            }

            // update and animate cards

            if (visual_progress > 0.5 && !done()) {
              setzIndex(10);
            } else {
              setzIndex(1);
            }

            setDegrees(visual_progress * -180);

            // handle card stack shadow
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
          }
          animationFrameIdRef = requestAnimationFrame(tick);
        }
      };
      tick();
    } else {
      setDone(true);
      setShadowBack(1);
      setzIndex(10);
      setDegrees(-180);
    }
  };

  onCleanup(() => {
    cancelAnimationFrame(animationFrameIdRef);
    setDone(true);
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
              ) : props.number === 0 ? (
                9
              ) : (
                props.number - 1
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

      <span class="tick-flip-card" style={{ "z-index": zIndex() }}>
        <span
          class="tick-flip-panel-front tick-flip-front tick-flip-panel"
          style={{ transform: `rotateX(${degrees()}deg)` }}
        >
          <span class="tick-flip-panel-front-text">
            <span class="tick-flip-panel-text-wrapper">{props.number}</span>
          </span>
          <span
            class="tick-flip-panel-front-shadow"
            style={{ opacity: shadowFront() }}
          ></span>
        </span>
        <span
          class="tick-flip-panel-back tick-flip-back tick-flip-panel"
          style={{ transform: `rotateX(${-180 + degrees()}deg)` }}
        >
          <span class="tick-flip-panel-back-text">
            <span class="tick-flip-panel-text-wrapper">
              {props.image ? (
                <img
                  src="/images/cup.webp"
                  class="absolute left-0.1 w-8 object-contain"
                />
              ) : props.number === 0 ? (
                9
              ) : (
                props.number - 1
              )}
            </span>
          </span>
          <span
            class="tick-flip-panel-back-highlight"
            style={{ opacity: highlightBack() }}
          ></span>
          <span class="tick-flip-panel-back-shadow" style="opacity: 0;"></span>
        </span>
      </span>

      <Show when={!done()}>
        {/* card animate */}
        <span class="tick-flip-card" style="">
          <span
            class="tick-flip-panel-front tick-flip-front tick-flip-panel"
            style="transform: rotateX(-180deg);"
          >
            <span class="tick-flip-panel-front-text">
              <span class="tick-flip-panel-text-wrapper">
                {props.number === 9 ? 0 : props.number + 1}
              </span>
            </span>
            <span
              class="tick-flip-panel-front-shadow"
              style="opacity: 0;"
            ></span>
          </span>
          <span
            class="tick-flip-panel-back tick-flip-back tick-flip-panel"
            style="transform: rotateX(-360deg);"
          >
            <span class="tick-flip-panel-back-text">
              <span class="tick-flip-panel-text-wrapper">{props.number}</span>
            </span>
            <span
              class="tick-flip-panel-back-highlight"
              style="opacity: 0;"
            ></span>
            <span
              class="tick-flip-panel-back-shadow"
              style={{ opacity: shadowBack() }}
            ></span>
          </span>
        </span>
      </Show>

      <span class="tick-flip-spacer">
        {props.number === 0 ? 9 : props.number - 1}
      </span>
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
