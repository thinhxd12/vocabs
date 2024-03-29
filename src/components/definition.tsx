import { Component, Index, Setter, Show, createMemo } from "solid-js";
import { VocabularyType } from "~/types";
import "/public/styles/definition.scss";
import { FaSolidCheck, FaSolidFeather } from "solid-icons/fa";
import { BsSoundwave } from "solid-icons/bs";

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
          <div class="definitionHeaderLeft">
            <Show
              when={props.count}
              fallback={
                <p class="definitionHeaderText">
                  Definitions of <b>{currenText()?.word}</b>
                </p>
              }
            >
              <p class="definitionHeaderText">
                <span>{props.count}.</span> <b>{currenText().word}</b>
              </p>
            </Show>
          </div>
          <div class="definitionHeaderRight">
            <button class="button button--primary">
              <BsSoundwave size={15} />
            </button>
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
        </div>
        <div class="definitionBody">
          <Index each={currenText()?.definitions}>
            {(item, index) => {
              return (
                <div class="sn-gs">
                  <div class="sn-g">
                    {currenText()?.definitions.length > 1 && (
                      <div class="num">{1 + index}:</div>
                    )}
                    <span class="websHead">{item().partOfSpeech}</span>
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
                                      {" "}
                                      : {x().similar}
                                    </span>
                                  )}
                                </span>
                              )}
                            </Index>
                          </div>
                          {m().image && <img class="websImg" src={m().image} />}
                        </div>
                      )}
                    </Index>
                    {item().example[0] && (
                      <>
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
                      </>
                    )}
                    {item().synonyms && (
                      <span class="websSyn">
                        <b>Synonym: </b>
                        <small>{item().synonyms}</small>
                      </span>
                    )}
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
