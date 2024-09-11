import { Component, createEffect, createSignal, Show } from "solid-js";
import { mainStore } from "~/lib/mystore";
import { Motion } from "solid-motionone";
import TickStatic from "./TickStatic";
import TickAnimate from "./TickAnimate";
import TickAnimateComplete from "./TickAnimateComplete";

const Flips: Component<{}> = (props) => {
  const [numbArray, setNumbArray] = createSignal<number[]>([3, 6, 9]);
  createEffect(() => {
    let strNumber = mainStore.renderWord?.number.toString().padStart(3, "0");
    setNumbArray(Array.from(String(strNumber), Number));
  });
  return (
    <>
      <Show
        when={mainStore.renderWord!.number % 100 === 0}
        fallback={<TickStatic number={numbArray()[numbArray().length - 3]} />}
      >
        <TickAnimate number={numbArray()[numbArray().length - 3]} delay={1.8} />
      </Show>

      <Show
        when={mainStore.renderWord!.number % 10 === 0}
        fallback={<TickStatic number={numbArray()[numbArray().length - 2]} />}
      >
        <TickAnimate
          number={numbArray()[numbArray().length - 2]}
          delay={1.65}
        />
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
