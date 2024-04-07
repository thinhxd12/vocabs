import { Component, Index, Setter, Show, createMemo } from "solid-js";
import { VocabularyType } from "~/types";
import "/public/styles/definition.scss";
import { FaSolidCheck, FaSolidFeather } from "solid-icons/fa";

const Definition: Component<{
  item: VocabularyType;
  onEdit?: (text: VocabularyType) => void;
  onCheck?: Setter<boolean>;
  count?: number;
}> = (props) => {
  const currenText = createMemo(() => props.item);
  return (
    <>
      <div class="definition">
        <div class="definitionHeader">
          <Show when={props.count}>
            <button class="button button--primary">{props.count}</button>
          </Show>
          <Show when={props.onEdit}>
            <button
              class="button button--primary"
              onclick={() => props.onEdit!(props.item)}
            >
              <FaSolidFeather size={12} />
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
                <div class="sn-gs">
                  <div class="sn-g">
                    <div class="websHead">
                      <Show when={currenText()?.definitions.length > 1}>
                        <span class="websHeadNum">{1 + index}:</span>
                      </Show>
                      <span class="websHeadContent">{item().partOfSpeech}</span>
                    </div>
                    <Index each={item().definitions}>
                      {(m, n) => (
                        <div class="websThumb">
                          <div>
                            <Index each={m().definition}>
                              {(x, y) => (
                                <span class="websDef">
                                  {x().sense}
                                  {x().similar && (
                                    <span class="websDefUp">
                                      {" : " + x().similar}
                                    </span>
                                  )}
                                </span>
                              )}
                            </Index>
                          </div>

                          <Show when={m().image}>
                            <img
                              class="websImg"
                              loading="lazy"
                              src={m().image}
                              onerror={(e) => {
                                e.currentTarget.src = "/images/main/5small.jpg";
                              }}
                            />
                          </Show>
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
                          <span class="websTitle">
                            {item().example[0].title}
                          </span>
                        )}
                        {item().example[0].year && (
                          <span class="websYear">
                            -{item().example[0].year}
                          </span>
                        )}
                      </span>
                    </Show>

                    <Show when={item().synonyms}>
                      <span class="websSyn">
                        <b>Synonym: </b>
                        <small>{item().synonyms}</small>
                      </span>
                    </Show>
                  </div>
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
