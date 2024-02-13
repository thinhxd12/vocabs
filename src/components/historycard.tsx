import { Component } from "solid-js";
import { HistoryType } from "~/types";

const HistoryCard: Component<{
  item: HistoryType;
}> = (props) => {
  return (
    <div class="historyCard">
      <div class="historyCardItem">
        <div class="historyCardItemDesc">
          {props.item.week1.index} - {props.item.week1.index + 199}
        </div>
        <div class="historyCardItemFrom">{props.item.week1.from_date}</div>
        <div class="historyCardItemTo">{props.item.week1.to_date}</div>
      </div>
      <div class="historyCardItem">
        <div class="historyCardItemDesc">
          {props.item.week2.index} - {props.item.week2.index + 199}
        </div>
        <div class="historyCardItemFrom">{props.item.week2.from_date}</div>
        <div class="historyCardItemTo">{props.item.week2.to_date}</div>
      </div>
      <div class="historyCardItem">
        <div class="historyCardItemDesc">
          {props.item.week3.index} - {props.item.week3.index + 199}
        </div>
        <div class="historyCardItemFrom">{props.item.week3.from_date}</div>
        <div class="historyCardItemTo">{props.item.week3.to_date}</div>
      </div>
      <div class="historyCardItem">
        <div class="historyCardItemDesc">
          {props.item.week4.index} - {props.item.week4.index + 199}
        </div>
        <div class="historyCardItemFrom">{props.item.week4.from_date}</div>
        <div class="historyCardItemTo">{props.item.week4.to_date}</div>
      </div>
      <div class="historyCardItem">
        <div class="historyCardItemDesc">
          {props.item.week5.index} - {props.item.week5.index + 199}
        </div>
        <div class="historyCardItemFrom">{props.item.week5.from_date}</div>
        <div class="historyCardItemTo">{props.item.week5.to_date}</div>
      </div>
    </div>
  );
};

export default HistoryCard;
