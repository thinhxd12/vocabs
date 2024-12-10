import {
  Component,
  createEffect,
  createSignal,
  Match,
  Show,
  Switch,
} from "solid-js";
import TickStatic from "./TickStatic";
import TickAnimate from "./TickAnimate";
import TickAnimateComplete from "./TickAnimateComplete";
import { Motion, Presence } from "solid-motionone";

const FlipNumber: Component<{
  value: number;
}> = (props) => {
  const [numbArray, setNumbArray] = createSignal<number[]>([3, 6, 9]);
  const [showFlipAnimate, setShowFlipAnimate] = createSignal<boolean>(false);

  createEffect(() => {
    setShowFlipAnimate(true);
    let strNumber = props.value.toString().padStart(3, "0");
    setNumbArray(Array.from(String(strNumber), Number));
    setTimeout(() => {
      setShowFlipAnimate(false);
    }, 3600);
  });

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

  return (
    <Presence>
      <Show when={showFlipAnimate()}>
        <Motion.div
          initial={{ y: -150 }}
          animate={{
            y: 27,
          }}
          exit={{
            scale: 0.96,
            opacity: 0,
            transition: { duration: 0.1, easing: "ease" },
          }}
          transition={{
            duration: 0.3,
            delay: 0.5,
            easing: easeOutBounce,
          }}
          class="absolute left-[59px] z-50 flex font-helvetica text-[140px] font-600 leading-[115px] text-[#f4f4f4]"
        >
          <Switch
            fallback={
              <>
                <TickStatic number={numbArray()[numbArray().length - 3]} />
                <TickStatic number={numbArray()[numbArray().length - 2]} />
                <TickAnimate
                  number={numbArray()[numbArray().length - 1]}
                  delay={1.5}
                />
              </>
            }
          >
            <Match when={props.value % 100 === 0}>
              <TickAnimate
                number={numbArray()[numbArray().length - 3]}
                delay={1.8}
              />
              <TickAnimate
                number={numbArray()[numbArray().length - 2]}
                delay={1.65}
              />
              <TickAnimate
                number={numbArray()[numbArray().length - 1]}
                delay={1.5}
              />
            </Match>
            <Match when={props.value % 10 === 0}>
              <TickStatic number={numbArray()[numbArray().length - 3]} />
              <TickAnimate
                number={numbArray()[numbArray().length - 2]}
                delay={1.65}
              />
              <TickAnimate
                number={numbArray()[numbArray().length - 1]}
                delay={1.5}
              />
            </Match>
            <Match when={props.value === 1}>
              <TickStatic number={numbArray()[numbArray().length - 3]} />
              <TickStatic number={numbArray()[numbArray().length - 2]} />
              <TickAnimateComplete delay={1.5} />
            </Match>
          </Switch>
        </Motion.div>
      </Show>
    </Presence>
  );
};

export default FlipNumber;
