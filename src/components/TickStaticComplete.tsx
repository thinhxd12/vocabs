import { Component } from "solid-js";
import "../styles/tick.css";

const TickStaticComplete: Component<{}> = (props) => {
  return (
    <span class="tick-flip">
      <span class="tick-flip-card">
        <span
          class="tick-flip-panel-front tick-flip-front tick-flip-panel"
          style="transform: rotateX(0deg);"
        >
          <span class="tick-flip-panel-front-text">
            <span class="tick-flip-panel-text-wrapper">1</span>
          </span>
          <span class="tick-flip-panel-front-shadow" style="opacity: 0;"></span>
        </span>
        <span
          class="tick-flip-panel-back tick-flip-back tick-flip-panel"
          style="transform: rotateX(-180deg);"
        >
          <span class="tick-flip-panel-back-text">
            <span class="tick-flip-panel-text-wrapper"></span>
          </span>
          <span
            class="tick-flip-panel-back-highlight"
            style="opacity: 2;"
          ></span>
          <span class="tick-flip-panel-back-shadow"></span>
        </span>
      </span>
      <span class="tick-flip-card" style="z-index: 10;">
        <span
          class="tick-flip-panel-front tick-flip-front tick-flip-panel"
          style="transform: rotateX(0deg);"
        >
          <span class="tick-flip-panel-front-text">
            <span class="tick-flip-panel-text-wrapper">
              <img src="/images/cup.webp" />
            </span>
          </span>
          <span class="tick-flip-panel-front-shadow" style="opacity: 0;"></span>
        </span>
        <span
          class="tick-flip-panel-back tick-flip-back tick-flip-panel"
          style="transform: rotateX(-360deg);"
        >
          <span class="tick-flip-panel-back-text">
            <span class="tick-flip-panel-text-wrapper">
              <img src="/images/cup.webp" />
            </span>
          </span>
          <span
            class="tick-flip-panel-back-highlight"
            style="opacity: 0;"
          ></span>
          <span class="tick-flip-panel-back-shadow" style="opacity: 0;"></span>
        </span>
      </span>
      <span class="tick-flip-card">
        <span
          class="tick-flip-panel-front tick-flip-front tick-flip-panel"
          style="transform: rotateX(-180deg);"
        >
          <span class="tick-flip-panel-front-text">
            <span class="tick-flip-panel-text-wrapper">1</span>
          </span>
          <span class="tick-flip-panel-front-shadow" style="opacity: 0;"></span>
        </span>
        <span
          class="tick-flip-panel-back tick-flip-back tick-flip-panel"
          style="transform: rotateX(-360deg);"
        >
          <span class="tick-flip-panel-back-text">
            <span class="tick-flip-panel-text-wrapper">1</span>
          </span>
          <span
            class="tick-flip-panel-back-highlight"
            style="opacity: 0;"
          ></span>
          <span class="tick-flip-panel-back-shadow" style="opacity: 2;"></span>
        </span>
      </span>
      <span class="tick-flip-spacer"></span>
      <span class="tick-flip-shadow-top tick-flip-shadow tick-flip-front"></span>
      <span class="tick-flip-shadow-bottom tick-flip-shadow tick-flip-back"></span>
      <span
        class="tick-flip-card-shadow"
        style="opacity: 0; transform: scaleY(0);"
      ></span>
    </span>
  );
};

export default TickStaticComplete;
