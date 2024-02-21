import { Component, Show } from "solid-js";
import "/public/styles/alert.scss";
import { OcCheck2, OcX2 } from "solid-icons/oc";

const Alert: Component<{ message: string; alert: boolean }> = (props) => {
  return (
    <div class="toast-notification slide-in-slide-out">
      <div class="toast-content">
        <div
          class="toast-icon wiggle-me"
          style={{ background: props.alert ? "#c0392b" : "#27ae60" }}
        >
          <Show
            when={props.alert}
            fallback={<OcCheck2 size={18} color="#fff" />}
          >
            <OcX2 size={18} color="#fff" />
          </Show>
        </div>
        <div class="toast-msg">{props.message}</div>
      </div>
      <div class="toast-progress">
        <div class="toast-progress-bar"></div>
      </div>
    </div>
  );
};

export default Alert;
