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
import TickStaticComplete from "./TickStaticComplete";

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
      let strNumber = (props.value - 1).toString().padStart(3, "0");
      setNumbArray(Array.from(String(strNumber), Number));
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
      <div class="absolute left-[143px] top-0 z-50 flex font-helvetica text-[40px] font-600 leading-[36px] text-[#f4f4f4]">
        <Show
          when={showFlipAnimate()}
          fallback={
            <Switch>
              <Match when={props.value > 1}>
                <TickStatic number={numbArray()[numbArray().length - 3]} />
                <TickStatic number={numbArray()[numbArray().length - 2]} />
                <TickStatic number={numbArray()[numbArray().length - 1]} />
              </Match>
              <Match when={props.value === 1}>
                <TickStatic number={0} />
                <TickStatic number={0} />
                <TickStaticComplete />
              </Match>
            </Switch>
          }
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
        </Show>
      </div>
    </Presence>
  );
};

export default FlipNumber;
