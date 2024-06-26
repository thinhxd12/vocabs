import { Component, Index, Show } from "solid-js";
import styles from "./definition.module.scss";
import { mainStore } from "~/lib/mystore";

const Definition: Component<{
  onEdit: () => void;
}> = (props) => {
  return (
    <>
      <Show when={mainStore.renderWord}>
        <div class={styles.definition}>
          <div class={styles.definitionBody}>
            <Index each={mainStore.renderWord!.definitions}>
              {(item, index) => {
                return (
                  <div class={styles.websEntry}>
                    <p class={styles.websHead} onClick={() => props.onEdit()}>
                      {item().partOfSpeech}
                    </p>
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
      </Show>
    </>
  );
};

export default Definition;
