import { Component, createSignal, JSX } from "solid-js";

const Collapsible: Component<{ title?: string; children: JSX.Element }> = (
  props,
) => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div class="flex min-h-7 w-full flex-col border-b border-white/30">
      <button
        class="h-7 w-full px-2 text-left focus:outline-none"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen());
        }}
      >
        <div class="flex items-center justify-between">
          <span></span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class={`h-5 w-5 transform transition-transform duration-200 ${isOpen() ? "rotate-180" : "rotate-0"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <div
        class={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          isOpen() ? "max-h-screen" : "max-h-0"
        }`}
      >
        {props.children}
      </div>
    </div>
  );
};

export default Collapsible;
