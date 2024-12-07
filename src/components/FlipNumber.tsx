import { createEffect, createSignal, Match, on, Show, Switch } from "solid-js";
import TickStatic from "./TickStatic";
import TickAnimate from "./TickAnimate";
import TickAnimateComplete from "./TickAnimateComplete";
import { Motion, Presence } from "solid-motionone";
import TickStaticComplete from "./TickStaticComplete";
import { easeOutBounce, easeOutCubic, easeOutSine } from "~/lib/utils";

export default function FlipNumber(props: { value: number }) {
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

  return (
    <Presence>
      <Show when={showFlipAnimate()}>
        <Motion.div
          initial={{ y: -90 }}
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
          class="absolute left-[89px] z-50 flex font-helvetica text-[100px] font-600 leading-[90px] text-[#f4f4f4]"
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
}
