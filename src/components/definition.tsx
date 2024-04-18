import { Component, Index, Setter, Show, createMemo } from "solid-js";
import { VocabularyType } from "~/types";
import "/public/styles/definition.scss";
import { FaSolidCheck } from "solid-icons/fa";

const Definition: Component<{
  item: VocabularyType;
  onEdit?: (text: VocabularyType) => void;
  onCheck?: Setter<boolean>;
}> = (props) => {
  const currenText = createMemo(() => props.item);
  return (
    <>
      <div class="definition">
        <div class="definitionHeader">
          <Show when={props.onEdit}>
            <button
              class="button button--primary"
              onclick={() => props.onEdit!(props.item)}
            >
              <img src="/images/main/laurel.png" height={13} />
            </button>
          </Show>
          <Show when={props.onCheck}>
            <button class="button button--success" onclick={props.onCheck}>
              <FaSolidCheck size={13} />
            </button>
          </Show>
        </div>
        <div class="definitionBody">
          <Index each={currenText()?.definitions}>
            {(item, index) => {
              return (
                <div class="websEntry">
                  <div class="websHead">
                    <span class="websHeadContent">{item().partOfSpeech}</span>
                  </div>
                  <Index each={item().definitions}>
                    {(m, n) => (
                      <div
                        class={m().image ? "websSenseHasImage" : "websSense"}
                      >
                        <Show when={m().image}>
                          <img
                            class="websImg"
                            src={m().image}
                            onerror={(e) => {
                              e.currentTarget.src = "/images/main/5small.jpg";
                            }}
                          />
                          <div class="websImgOverlay"></div>
                        </Show>
                        <div class="websDefs">
                          <Index each={m().definition}>
                            {(x, y) => (
                              <>
                                <p class="websDef">
                                  {x().sense}
                                  <Show when={x().similar}>
                                    <span> : </span>
                                    <span class="websDefUp">{x().similar}</span>
                                  </Show>
                                </p>
                              </>
                            )}
                          </Index>
                        </div>
                      </div>
                    )}
                  </Index>

                  <Show when={item().example[0]}>
                    <span
                      class="websX"
                      innerHTML={item().example[0].sentence}
                    />
                    <span class="websCredits">
                      {item().example[0].author && (
                        <span class="websAuthor">
                          {item().example[0].author}-
                        </span>
                      )}
                      {item().example[0].title && (
                        <span class="websTitle">{item().example[0].title}</span>
                      )}
                      {item().example[0].year && (
                        <span class="websYear">-{item().example[0].year}</span>
                      )}
                    </span>
                  </Show>

                  <Show when={item().synonyms}>
                    <p class="websSyn">
                      <b>Synonym </b>
                      <small>{item().synonyms}</small>
                    </p>
                  </Show>
                </div>
              );
            }}
          </Index>
        </div>
      </div>
    </>
  );
};

export default Definition;
