import { Component } from "solid-js";
import styles from "./tick.module.scss";

const TickAnimate: Component<{
  number: number;
}> = (props) => {
  return (
    <div class={styles.tickContainer}>
      <div class={styles.upperCard}>
        <span>{props.number === 0 ? 9 : props.number - 1}</span>
      </div>
      <div class={styles.lowerCard}>
        <span>{props.number}</span>
      </div>
      <div class={styles.flipCardSpacer}></div>
      <div class={`${styles.flipCard} ${styles.fold}`}>
        <span>{props.number}</span>
      </div>
      <div class={`${styles.flipCard} ${styles.unfold}`}>
        <span>{props.number === 0 ? 9 : props.number - 1}</span>
      </div>
    </div>
  );
};

export default TickAnimate;
