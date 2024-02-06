import { Action, RouteSectionProps } from "@solidjs/router";
import { OcX2 } from "solid-icons/oc";
import { Setter } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

type Props = {
  onClose: Setter<boolean>;
  header: string;
  children: JSX.Element;
};

const CalendarDropdown = (props: Props) => {
  return (
    <div class="calendarDropdown">
      <div class="calendarDropdownHeader">
        <div class="calendarDropdownHeaderLeft">
          <p>{props.header}</p>
        </div>
        <div class="calendarDropdownHeaderRight">
          <button
            class="calendarDropdownBtn"
            onclick={() => props.onClose(false)}
          >
            <OcX2 size={12} />
          </button>
        </div>
      </div>
      <div class="calendarDropdownBody">{props.children}</div>
    </div>
  );
};

export default CalendarDropdown;
