import { Slider, SliderProvider } from "solid-slider";
import { HistoryType } from "~/types";

const HistoryCard = (props: { item: HistoryType }) => {

  return (
    <div class="historyCard">
      <div class="historyCardItem">
        <div class="historyCardItemDesc">{props.item.week1.index}</div>
        <div class="historyCardItemFrom">{props.item.week1.from_date}</div>
        <div class="historyCardItemTo">{props.item.week1.to_date}</div>
      </div>
      <div class="historyCardItem">
        <div class="historyCardItemDesc">{props.item.week2.index}</div>
        <div class="historyCardItemFrom">{props.item.week2.from_date}</div>
        <div class="historyCardItemTo">{props.item.week2.to_date}</div>
      </div>
      <div class="historyCardItem">
        <div class="historyCardItemDesc">{props.item.week3.index}</div>
        <div class="historyCardItemFrom">{props.item.week3.from_date}</div>
        <div class="historyCardItemTo">{props.item.week3.to_date}</div>
      </div>
      <div class="historyCardItem">
        <div class="historyCardItemDesc">{props.item.week4.index}</div>
        <div class="historyCardItemFrom">{props.item.week4.from_date}</div>
        <div class="historyCardItemTo">{props.item.week4.to_date}</div>
      </div>
      <div class="historyCardItem">
        <div class="historyCardItemDesc">{props.item.week5.index}</div>
        <div class="historyCardItemFrom">{props.item.week5.from_date}</div>
        <div class="historyCardItemTo">{props.item.week5.to_date}</div>
      </div>
    </div>
  );
};

export default HistoryCard;
