import { Action, RouteSectionProps } from "@solidjs/router";
import { OcX2 } from "solid-icons/oc";
import { Component, Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import styles from "./calendardropdown.module.scss";
import buttons from "../assets/styles/buttons.module.scss";

const CalendarDropdown: Component<{
  onClose: Setter<boolean>;
  header: string;
  children: JSX.Element;
}> = (props) => {
  return (
    <div class={styles.calendarDropdown}>
      <div class={styles.calendarDropdownHeader}>
        <div class={styles.calendarDropdownHeaderLeft}>
          <p>{props.header}</p>
        </div>
        <div class={styles.calendarDropdownHeaderRight}>
          <button
            class={buttons.buttonClose}
            onclick={() => props.onClose(false)}
          >
            <OcX2 size={15} />
          </button>
        </div>
      </div>
      <div class={styles.calendarDropdownBody}>{props.children}</div>
    </div>
  );
};

export default CalendarDropdown;
