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
      <Tick
        number={props.number % 100 === 0 ? hundreds() : hundreds() + 1}
        animating={props.number % 100 === 0}
        delay={1800}
      />
      <Tick
        number={props.number % 10 === 0 ? tens() : tens() + 1}
        animating={props.number % 10 === 0}
        delay={1650}
      />
      <Tick
        number={ones()}
        animating={true}
        delay={1500}
        image={props.number === 1}
      />
    </div>
  );
};

export default FlipCard;
