import { Component } from "solid-js";
import styles from "./tick.module.scss";

const TickAnimateComplete: Component<{}> = (props) => {
  return (
    <div class={styles.tickContainer}>
      <div class={styles.upperCard}>
        <img src="/images/main/cup.webp" />
      </div>
      <div class={styles.lowerCard}>
        <span>1</span>
      </div>
      <div class={styles.flipCardSpacer}></div>
      <div class={`${styles.flipCard} ${styles.fold}`}>
        <span>1</span>
      </div>
      <div class={`${styles.flipCard} ${styles.unfold}`}>
        <img src="/images/main/cup.webp" />
      </div>
    </div>
  );
};

export default TickAnimateComplete;
