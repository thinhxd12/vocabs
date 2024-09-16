import {
  Component,
  createEffect,
  createSignal,
  Index,
  Setter,
  Show,
  untrack,
} from "solid-js";
import styles from "./definition.module.scss";
import { mainStore } from "~/lib/mystore";
import { RiArrowsCornerDownRightFill } from "solid-icons/ri";
import { VocabularyType } from "~/types";
import ImageLoading from "./image";

const Definition: Component<{
  item: VocabularyType;
  onEdit?: () => void;
  onCheck?: Setter<boolean>;
}> = (props) => {
  return (
    <Show when={props.item}>
      <div class={styles.definition}>
        <Index each={props.item!.definitions}>
          {(entry, index) => {
            return (
              <div class={styles.websEntry}>
                <div class={styles.websHeader}>
                  <div class={styles.websHeaderContainer}>
                    <span
                      class={styles.websHeaderContent}
                      onClick={props.onEdit || props.onCheck}
                    >
                      {entry().partOfSpeech}
                    </span>
                  </div>
                </div>

                <div class={styles.websBody}>
                  <Index each={entry().definitions}>
                    {(item, ind) => {
                      return (
                        <Show
                          when={item().image}
                          fallback={
                            <div class={styles.websSense}>
                              <div class={styles.websDefs}>
                                <Index each={item().definition}>
                                  {(x, y) => (
                                    <p
                                      class={styles.websDef}
                                      innerHTML={
                                        x().similar
                                          ? x().sense + " : " + x().similar
                                          : x().sense
                                      }
                                    />
                                  )}
                                </Index>
                              </div>
                              <Show
                                when={
                                  props.onEdit &&
                                  mainStore.renderWord!.translations.find(
                                    (el) =>
                                      el.partOfSpeech === entry().partOfSpeech
                                  )?.translations
                                }
                              >
                                <div class={styles.websHeadDropdown}>
                                  {mainStore
                                    .renderWord!.translations.find(
                                      (el) =>
                                        el.partOfSpeech === entry().partOfSpeech
                                    )
                                    ?.translations.map((n) => {
                                      return <p>{n}</p>;
                                    })}
                                </div>
                              </Show>
                            </div>
                          }
                        >
                          <div class={styles.websSenseImage}>
                            <ImageLoading
                              src={item().image}
                              width={360}
                              height={240}
                              class={styles.websImg}
                            />
                            <div class={styles.websDefs}>
                              <Index each={item().definition}>
                                {(x, y) => (
                                  <p
                                    class={styles.websDef}
                                    innerHTML={
                                      x().similar
                                        ? x().sense + " : " + x().similar
                                        : x().sense
                                    }
                                  />
                                )}
                              </Index>
                            </div>
                            <Show
                              when={
                                props.onEdit &&
                                mainStore.renderWord!.translations.find(
                                  (el) =>
                                    el.partOfSpeech === entry().partOfSpeech
                                )?.translations
                              }
                            >
                              <div class={styles.websHeadDropdown}>
                                {mainStore
                                  .renderWord!.translations.find(
                                    (el) =>
                                      el.partOfSpeech === entry().partOfSpeech
                                  )
                                  ?.translations.map((n) => {
                                    return <p>{n}</p>;
                                  })}
                              </div>
                            </Show>
                          </div>
                        </Show>
                      );
                    }}
                  </Index>

                  <Show when={entry().synonyms}>
                    <div class={styles.websSyn}>
                      <RiArrowsCornerDownRightFill size={16} />
                      <span>{entry().synonyms}</span>
                    </div>
                  </Show>

                  <Show when={entry().example[0]}>
                    <p
                      class={styles.websX}
                      innerHTML={entry().example[0].sentence}
                    />
                    <div class={styles.websCredits}>
                      <Show when={entry().example[0].author}>
                        <span class={styles.websAuthor}>
                          {entry().example[0].author}
                        </span>
                      </Show>
                      <Show when={entry().example[0].title}>
                        <span class={styles.websTitle}>
                          {entry().example[0].title}
                        </span>
                      </Show>
                      <Show when={entry().example[0].year}>
                        <span class={styles.websYear}>
                          {entry().example[0].year}
                        </span>
                      </Show>
                    </div>
                  </Show>
                </div>
              </div>
            );
          }}
        </Index>
      </div>
    </Show>
  );
};

export default Definition;
