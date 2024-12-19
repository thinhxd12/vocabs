import { Component } from "solid-js";

const FlipCard: Component<{
  frontValue: number;
  backValue: number;
  highlightBackOpacity: number;
  shadowBackOpacity: number;
  shadowFrontOpacity: number;
  rotate: number;
}> = (props) => {
  return (
    <div class="tick-flip-card">
      {/* Front Panel */}
      <span
        class="tick-flip-panel-front tick-flip-front tick-flip-panel"
        style={{ transform: `rotateX(${props.rotate}deg)` }}
      >
        <span class="tick-flip-panel-front-text">
          <span class="tick-flip-panel-text-wrapper">{props.frontValue}</span>
        </span>
        <span
          class="tick-flip-panel-front-shadow"
          style={{ opacity: props.shadowFrontOpacity }}
        />
      </span>

      {/* Back Panel */}
      <span
        class="tick-flip-panel-back tick-flip-back tick-flip-panel"
        style={{ transform: `rotateX(${-180 + props.rotate}deg)` }}
      >
        <span class="tick-flip-panel-back-text">
          <span class="tick-flip-panel-text-wrapper">{props.backValue}</span>
        </span>
        <span
          class="tick-flip-panel-back-highlight"
          style={{ opacity: props.highlightBackOpacity }}
        />
        <span
          class="tick-flip-panel-back-shadow"
          style={{ opacity: props.shadowBackOpacity }}
        />
      </span>
    </div>
  );
};

export default FlipCard;
