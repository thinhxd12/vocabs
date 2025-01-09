import { Component, For, Setter, Show } from "solid-js";
import { RiArrowsCornerDownRightFill } from "solid-icons/ri";
import { InsertVocab, SelectVocab } from "~/db/schema";
import ImageLoader from "./ImageLoader";

const Definition: Component<{
  item: SelectVocab | InsertVocab;
  onEdit?: () => void;
  onCheck?: Setter<boolean>;
}> = (props) => {
  return (
    <Show when={props.item.meanings}>
      <For each={props.item.meanings}>
        {(entry) => (
          <div class="definition w-content mb-3">
            <div class="flex justify-between px-2">
              <span
                class="cursor-pointer font-roslindale text-8 font-500"
                onClick={props.onEdit || props.onCheck}
              >
                {entry.partOfSpeech}
              </span>
              <span class="text-4.5 leading-6 opacity-0 hover:opacity-100">
                {entry.translation.join("-")}
              </span>
            </div>

            <For each={entry.definitions}>
              {(el) => (
                <>
                  <Show when={el.image || el.example.sentence}>
                    <div class="relative mb-3 flex min-h-[210px] w-full flex-col justify-between">
                      <Show when={el.image}>
                        <ImageLoader
                          width={388}
                          height={218}
                          src={el.image}
                          hash={el.hash}
                          word={props.item}
                          className="!absolute !h-full !w-full object-cover brightness-75"
                        />
                      </Show>
                      <Show when={el.example.sentence}>
                        <div class="z-30 flex flex-1 items-center p-6">
                          <h2 class="text-center text-6 leading-9">
                            <span
                              class="definition-example shadow shadow-black/30"
                              innerHTML={el.example.sentence}
                            ></span>
                          </h2>
                        </div>
                      </Show>

                      <div class="definition-credit relative z-30">
                        <Show when={el.example.author}>
                          <span
                            style={{
                              "font-variant": "small-caps",
                            }}
                          >
                            {el.example.author}
                          </span>
                        </Show>
                        <Show when={el.example.title}>
                          <span class="!font-700 uppercase">
                            {el.example.title}
                          </span>
                        </Show>
                        <Show when={el.example.year}>
                          <span>{el.example.year}</span>
                        </Show>
                      </div>
                    </div>
                  </Show>
                  <For each={el.definition}>
                    {(def) => (
                      <p class="flex pl-1 text-4 font-500 leading-5">
                        <span class="inline-block min-w-4 text-4 font-700 uppercase leading-4.5">
                          {def.letter}
                        </span>
                        {def.num && (
                          <small class="inline-block min-w-4 pr-0.5">
                            {def.num}
                          </small>
                        )}
                        <span>{def.sense}</span>
                      </p>
                    )}
                  </For>
                </>
              )}
            </For>

            <Show when={entry.synonyms.length}>
              <div class="flex items-center justify-start px-1 pb-1 pt-0.1">
                <RiArrowsCornerDownRightFill
                  size={16}
                  class="ml-0.1 mr-0.5 mt-0.5"
                />
                <span class="text-4 font-500 leading-5 text-black">
                  {entry.synonyms.join(", ")}
                </span>
              </div>
            </Show>
          </div>
        )}
      </For>
    </Show>
  );
};

export default Definition;
