import { Action, RouteSectionProps } from "@solidjs/router";
import { OcX2 } from "solid-icons/oc";
import { Component, Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

const CalendarDropdown: Component<{
  onClose: Setter<boolean>;
  header: string;
  children: JSX.Element;
}> = (props) => {
  return (
    <div class="calendarDropdown">
      <div class="calendarDropdownHeader">
        <div class="calendarDropdownHeaderLeft">
          <p>{props.header}</p>
        </div>
        <div class="calendarDropdownHeaderRight">
          <button
            class="button button--close"
            onclick={() => props.onClose(false)}
          >
            <OcX2 size={15} />
          </button>
        </div>
      </div>
      <div class="calendarDropdownBody">{props.children}</div>
    </div>
  );
};

export default CalendarDropdown;
