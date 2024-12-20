import { Component, createSignal, createEffect } from "solid-js";
import Tick from "./Tick";

const FlipCard: Component<{
  number: number;
}> = (props) => {
  const [numbArray, setNumbArray] = createSignal<number[]>([3, 6, 9]);

  createEffect(() => {
    let strNumber = props.number.toString().padStart(3, "0");
    setNumbArray(Array.from(String(strNumber), Number));
  });

  return (
    <div class="relative flex font-helvetica text-[40px] font-600 leading-[36px]">
      <Tick
        number={props.number % 100 === 0 ? numbArray()[0] : numbArray()[0] + 1}
        animating={props.number % 100 === 0}
        delay={1800}
      />
      <Tick
        number={props.number % 10 === 0 ? numbArray()[1] : numbArray()[1] + 1}
        animating={props.number % 10 === 0}
        delay={1650}
      />
      <Tick
        number={numbArray()[2]}
        animating={true}
        delay={1500}
        image={props.number === 1}
      />
    </div>
  );
};

export default FlipCard;
