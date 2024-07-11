import { Component, Index, Setter, Show, createMemo } from "solid-js";
import { VocabularyType } from "~/types";
import { FaSolidCheck } from "solid-icons/fa";
import styles from "./definition.module.scss";
import buttons from "../assets/styles/buttons.module.scss";

export const EditDefinition: Component<{
  item: VocabularyType;
  onCheck?: Setter<boolean>;
}> = (props) => {
  return (
    <>
      <div class={styles.definition}>
        <div class={styles.definitionHeader}>
          <Show when={props.onCheck}>
            <button class={buttons.buttonSuccess} onclick={props.onCheck}>
              <FaSolidCheck size={13} />
            </button>
          </Show>
        </div>
        <div class={styles.definitionBody}>
          <Index each={props.item.definitions}>
            {(item, index) => {
              return (
                <div class={styles.websEntry}>
                  <div class={styles.websHead}>
                    <span class={styles.websHeadPartOS}>
                      {item().partOfSpeech}
                    </span>
                  </div>
                  <div class={styles.websDefsContainer}>
                    <Index each={item().definitions}>
                      {(m, n) => (
                        <div
                          class={
                            m().image
                              ? styles.websSenseHasImage
                              : styles.websSense
                          }
                        >
                          <Show when={m().image}>
                            <img
                              class={styles.websImg}
                              src={m().image}
                              onerror={(e) => {
                                e.currentTarget.src =
                                  "/images/main/image_not_found.webp";
                              }}
                            />
                            <div class={styles.websImgOverlay}></div>
                          </Show>
                          <div class={styles.websDefs}>
                            <Index each={m().definition}>
                              {(x, y) => (
                                <p
                                  class={styles.websDef}
                                  innerHTML={
                                    x().similar
                                      ? x().sense +
                                        `<span class=${styles.websDefUp}>${
                                          " : " + x().similar
                                        }</span>`
                                      : x().sense
                                  }
                                />
                              )}
                            </Index>
                          </div>
                        </div>
                      )}
                    </Index>
                  </div>
                  <Show when={item().example[0]}>
                    <p
                      class={styles.websX}
                      innerHTML={item().example[0].sentence}
                    />
                    <div class={styles.websCredits}>
                      <Show when={item().example[0].author}>
                        <div class={styles.websAuthor}>
                          {item().example[0].author}
                        </div>
                        <div>&nbsp;-&nbsp;</div>
                      </Show>
                      <Show when={item().example[0].title}>
                        <div class={styles.websTitle}>
                          {item().example[0].title}
                        </div>
                      </Show>
                      <Show when={item().example[0].year}>
                        <div>&nbsp;-&nbsp;</div>
                        <div class={styles.websYear}>
                          {item().example[0].year}
                        </div>
                      </Show>
                    </div>
                  </Show>

                  <Show when={item().synonyms}>
                    <p class={styles.websSyn}>
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
