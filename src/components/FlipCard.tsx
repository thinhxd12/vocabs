import { Component, createSignal, createEffect, untrack } from "solid-js";
import Tick from "./Tick";

const FlipCard: Component<{
  number: number;
}> = (props) => {
  const [hundreds, setHundreds] = createSignal<number>(0);
  const [tens, setTens] = createSignal<number>(0);
  const [ones, setOnes] = createSignal<number>(0);

  createEffect(() => {
    const v = props.number;
    untrack(() => {
      setHundreds(Math.floor(v / 100));
      setTens(Math.floor((v % 100) / 10));
      setOnes(v % 10);
    });
  });

  return (
    <div class="relative flex font-helvetica text-[40px] font-600 leading-[36px]">
      <Tick number={hundreds()} delay={300} />
      <Tick number={tens()} delay={150} />
      <Tick number={ones()} image={props.number === 0} />
    </div>
  );
};

export default FlipCard;
