import { Component } from "solid-js";
import styles from "./tick.module.scss";

const TickStatic: Component<{
  number: number;
}> = (props) => {
  return (
    <div class={styles.tickContainer}>
      <div class={styles.upperCard}>
        <span>{props.number}</span>
      </div>
      <div class={styles.lowerCard}>
        <span>{props.number}</span>
      </div>
      <div class={styles.flipCardSpacer}></div>
    </div>
  );
};

export default TickStatic;
