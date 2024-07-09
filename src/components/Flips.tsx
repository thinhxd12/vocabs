import { Component, createEffect, createSignal, Show } from "solid-js";
import TickStatic from "./TickStatic";
import { mainStore } from "~/lib/mystore";
import TickAnimate from "./TickAnimate";
import TickAnimateComplete from "./TickAnimateComplete";
import styles from "./tick.module.scss";

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
          <div
            class={
              mainStore.renderWord!.number === 100
                ? styles.tickContainerDelayFadeout1
                : styles.tickContainerDelay1
            }
          >
            <TickAnimate number={numbArray()[numbArray().length - 3]} />
          </div>
        </Show>
      </Show>

      <Show when={mainStore.renderWord!.number > 9}>
        <Show
          when={mainStore.renderWord!.number % 10 === 0}
          fallback={<TickStatic number={numbArray()[numbArray().length - 2]} />}
        >
          <div
            class={
              mainStore.renderWord!.number === 10
                ? styles.tickContainerDelayFadeout2
                : styles.tickContainerDelay2
            }
          >
            <TickAnimate number={numbArray()[numbArray().length - 2]} />
          </div>
        </Show>
      </Show>

      <Show when={mainStore.renderWord!.number > 1}>
        <TickAnimate number={numbArray()[numbArray().length - 1]} />
      </Show>

      <Show when={mainStore.renderWord!.number === 1}>
        <TickAnimateComplete />
      </Show>
    </>
  );
};

export default Flips;
