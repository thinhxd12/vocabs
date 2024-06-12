import { Component, Index } from "solid-js";
import { HistoryItemContentType } from "~/types";
import styles from "./historycard.module.scss";

const HistoryCard: Component<{
  item: HistoryItemContentType[];
}> = (props) => {
  return (
    <div class={styles.historyCard}>
      <Index each={props.item}>
        {(data) => {
          return (
            <div class={styles.historyCardItem}>
              <div class={styles.historyCardItemDesc}>
                {data().index + 1} - {data().index + 200}
              </div>
              <div class={styles.historyCardItemFrom}>{data().from_date}</div>
              <div class={styles.historyCardItemTo}>{data().to_date}</div>
            </div>
          );
        }}
      </Index>
    </div>
  );
};

export default HistoryCard;
