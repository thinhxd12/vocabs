import { For } from "solid-js";
import { HistoryItemType } from "~/types";

export default function HistoryCard(props: { data: HistoryItemType[] }) {
  return (
    <div class="min-w-[360px] snap-start overflow-hidden pl-1 pr-1 pt-1">
      <For each={props.data}>
        {(item) => (
          <div class="mb-0.5 flex h-6 w-full">
            <div class="relative h-full w-[90px] bg-black px-1 font-rubik text-3.5 font-500 leading-6 text-white">
              {item.index + 1} - {item.index + 200}
              <span
                class="absolute -right-[5.5px] top-1 h-4 w-2 bg-black"
                style={{
                  "clip-path": "polygon(0% 0%, 100% 50%, 0% 100%)",
                }}
              ></span>
            </div>
            <div class="flex flex-1 bg-white">
              <div class="h-full w-[120px] pl-8 font-rubik text-3.5 font-500 leading-6">
                {item.from_date}
              </div>
              <div class="h-full w-[120px] pl-8 font-rubik text-3.5 font-500 leading-6">
                {item.to_date}
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
