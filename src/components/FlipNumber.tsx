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
import { Presence } from "solid-motionone";
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

  return (
    <Presence>
      <div class="flex font-helvetica text-[40px] font-600 leading-[36px] text-[#f4f4f4]">
        <Show
          when={showFlipAnimate()}
          fallback={
            <Show
              when={props.value > 1}
              fallback={
                <>
                  <TickStatic number={0} />
                  <TickStatic number={0} />
                  <TickStaticComplete />
                </>
              }
            >
              <TickStatic number={numbArray()[numbArray().length - 3]} />
              <TickStatic number={numbArray()[numbArray().length - 2]} />
              <TickStatic number={numbArray()[numbArray().length - 1]} />
            </Show>
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
