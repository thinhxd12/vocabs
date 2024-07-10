import { Component, createEffect, createSignal, Show } from "solid-js";
import { mainStore } from "~/lib/mystore";
import { Motion } from "solid-motionone";
import TickStatic from "./TickStatic";
import TickAnimate from "./TickAnimate";
import TickAnimateComplete from "./TickAnimateComplete";

const Flips: Component<{}> = (props) => {
  const [numbArray, setNumbArray] = createSignal<number[]>([3, 6, 9]);
  createEffect(() => {
    const v = mainStore.renderWord;
    setNumbArray(Array.from(String(v?.number), Number));
  });
  return (
    <>
      <Show when={mainStore.renderWord!.number > 99}>
        <Show
          when={mainStore.renderWord!.number % 100 === 0}
          fallback={<TickStatic number={numbArray()[numbArray().length - 3]} />}
        >
          <Motion.div
            animate={{
              opacity: mainStore.renderWord!.number === 100 ? 0 : 1,
              display: mainStore.renderWord!.number === 100 ? "none" : "unset",
            }}
            transition={{ duration: 0.3, delay: 2.8 }}
          >
            <TickAnimate
              number={numbArray()[numbArray().length - 3]}
              delay={1.8}
            />
          </Motion.div>
        </Show>
      </Show>

      <Show when={mainStore.renderWord!.number > 9}>
        <Show
          when={mainStore.renderWord!.number % 10 === 0}
          fallback={<TickStatic number={numbArray()[numbArray().length - 2]} />}
        >
          <Motion.div
            animate={{
              opacity: mainStore.renderWord!.number === 10 ? 0 : 1,
              display: mainStore.renderWord!.number === 10 ? "none" : "unset",
            }}
            transition={{ duration: 0.3, delay: 2.5 }}
          >
            <TickAnimate
              number={numbArray()[numbArray().length - 2]}
              delay={1.65}
            />
          </Motion.div>
        </Show>
      </Show>

      <Show when={mainStore.renderWord!.number > 1}>
        <TickAnimate number={numbArray()[numbArray().length - 1]} delay={1.5} />
      </Show>

      <Show when={mainStore.renderWord!.number === 1}>
        <TickAnimateComplete delay={1.5} />
      </Show>
    </>
  );
};

export default Flips;
