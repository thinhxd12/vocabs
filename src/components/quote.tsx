import {
  OcChevronleft2,
  OcChevronright2,
  OcCopy2,
  OcStar2,
  OcX2,
} from "solid-icons/oc";
import { CustomIcon } from "solid-icons/lib";
import { Component } from "solid-js";
import { BookmarkType } from "~/types";

const QuoteDummy = () => {

  return (
    <div class="quoteContainer">
      <div class="quoteHeader">
        <div class="quoteHeaderLeft">
          <button class="quoteBtn">
            <OcChevronleft2 size={17} />
          </button>
          <button class="quoteBtn">
            <OcStar2 size={17} />
          </button>
          <button class="quoteBtn">
            <OcChevronright2 size={17} />
          </button>
          <button class="quoteBtn">
            <OcCopy2 size={17} />
          </button>
        </div>
        <button class="quoteBtnClose">
          <OcX2 size={12} />
        </button>
      </div>
      <div class="quoteBody">
        <div class="quoteLoading">
          <svg
            width="30px"
            height="30px"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
          >
            <circle
              cx="50"
              cy="50"
              fill="none"
              stroke="#1d0e0b"
              stroke-width="12"
              r="30"
              stroke-dasharray="141.37166941154067 49.12388980384689"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                repeatCount="indefinite"
                dur="1s"
                values="0 50 50;360 50 50"
                keyTimes="0;1"
              ></animateTransform>
            </circle>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default QuoteDummy;
