import { Component, For, Setter, Show } from "solid-js";
import { VocabularyTranslationType, VocabularyType } from "~/types";
import { RiArrowsCornerDownRightFill } from "solid-icons/ri";
import ImageLoader from "./ImageLoader";

const Definition: Component<{
  item: VocabularyType;
  onEdit?: () => void;
  onCheck?: Setter<boolean>;
}> = (props) => {
  return (
    <div class="w-full overflow-hidden rounded-2 bg-white/60 shadow-lg shadow-black/45 backdrop-blur-xl">
      <For each={props.item.definitions}>
        {(entry) => (
          <div class="w-full">
            <div class="group flex h-9 items-end justify-between">
              <div class="w-1/2 text-wrap indent-4 font-sfpro text-[13px] font-500 leading-6 text-black opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {props.item.translations
                  .find(
                    (el: VocabularyTranslationType) =>
                      el.partOfSpeech === entry.partOfSpeech,
                  )
                  ?.translations.join("-")}
              </div>
              <div
                class="-mb-0.5 w-1/2 cursor-pointer truncate px-0.5 text-center font-sfpro text-8.5 font-700 uppercase leading-8 text-black"
                onClick={props.onEdit || props.onCheck}
              >
                {entry.partOfSpeech}
              </div>
            </div>

            <div class="relative z-10 w-full">
              <For each={entry.definitions}>
                {(item) => (
                  <Show
                    when={item.image}
                    fallback={
                      <For each={item.definition}>
                        {(def) => (
                          <p class="flex bg-black pb-0.5 pl-2 pr-1 pt-0.5 align-baseline font-sfpro text-[13px] font-500 leading-6 text-white">
                            <span class="inline-block min-w-4 text-4.5 font-700 uppercase">
                              {def.letter}
                            </span>
                            {def.num && (
                              <small class="inline-block min-w-4 pr-0.5">
                                {def.num}
                              </small>
                            )}
                            <span innerHTML={def.sense}></span>
                          </p>
                        )}
                      </For>
                    }
                  >
                    <div class="relative w-full">
                      <ImageLoader
                        id={props.item.created_at}
                        def={props.item.definitions}
                        src={item.image}
                        hash={item.hash}
                        width={360}
                        height={202}
                        className="object-cover brightness-75"
                      />

                      <div class="no-scrollbar absolute bottom-0 left-0 z-50 flex h-[202px] flex-col items-start justify-end overflow-y-scroll p-1">
                        <For each={item.definition}>
                          {(def) => (
                            <p class="flex pl-1 font-sfpro text-[13px] font-500 leading-6 text-white">
                              <span class="inline-block min-w-4 text-4.5 font-700 uppercase">
                                {def.letter}
                              </span>
                              {def.num && (
                                <small class="inline-block min-w-4 pr-0.5">
                                  {def.num}
                                </small>
                              )}
                              <span innerHTML={def.sense}></span>
                            </p>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>
                )}
              </For>

              <Show when={entry.synonyms}>
                <div class="flex items-center justify-start bg-[#777b774d] px-1 pb-1 pt-0.1">
                  <RiArrowsCornerDownRightFill
                    size={16}
                    class="ml-0.1 mr-[2px] mt-0.1"
                  />
                  <span class="font-sfpro text-4.5 font-600 leading-5.5 text-black">
                    {entry.synonyms}
                  </span>
                </div>
              </Show>

              <Show when={entry.example[0]}>
                <p
                  class="definition-example"
                  innerHTML={entry.example[0].sentence}
                />
                <div class="definition-credit">
                  <Show when={entry.example[0].author}>
                    <span
                      style={{
                        "font-variant": "small-caps",
                      }}
                    >
                      {entry.example[0].author}
                    </span>
                  </Show>
                  <Show when={entry.example[0].title}>
                    <span class="!font-700 uppercase">
                      {entry.example[0].title}
                    </span>
                  </Show>
                  <Show when={entry.example[0].year}>
                    <span>{entry.example[0].year}</span>
                  </Show>
                </div>
              </Show>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

export default Definition;
