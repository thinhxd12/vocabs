import {
  Component,
  Index,
  JSX,
  Match,
  Show,
  Suspense,
  Switch,
  createEffect,
  createResource,
  createSignal,
  on,
} from "solid-js";
import { OcX2 } from "solid-icons/oc";
import { useSubmission } from "@solidjs/router";
import {
  getOedSoundURL,
  getTextDataWebster,
  getTranslateData,
  insertVocabularyItem,
  searchMemoriesText,
} from "~/lib/api";
import toast, { Toaster } from "solid-toast";
import useClickOutside from "solid-click-outside";
import styles from "./translation.module.scss";
import buttons from "../assets/styles/buttons.module.scss";
import forms from "../assets/styles/form.module.scss";
import { EditDefinition } from "./editDefinition";
import { setMainStore } from "~/lib/mystore";

let searchRef: HTMLInputElement;
const Translation: Component<{
  translateText: string;
}> = (props) => {
  const insertActionResult = useSubmission(insertVocabularyItem);
  const [meaning, setMeaning] = createSignal<string>("");

  const handleSetTransInput = (text: string) => {
    setMeaning(meaning() + text);
  };

  const onKeyDownTranslate: JSX.EventHandlerUnion<
    HTMLInputElement,
    KeyboardEvent
  > = (event) => {
    event.stopPropagation();
    const keyDown = event.key;
    if (keyDown === "Enter") handleTranslate();
  };

  createEffect(async () => {
    const checkMemories = await searchMemoriesText(translateTerm());
    if (checkMemories) {
      popCheckMemories(checkMemories.message);
    }
  });

  //----------------------TOAST----------------------
  const popCheckMemories = (msg: string) =>
    toast.error(msg, { duration: 6000 });
  const popSuccess = () => toast.success("Success", { duration: 3000 });
  const popError = (msg: string) => toast.error(msg, { duration: 3000 });
  const [submittedForm, setSubmittedForm] = createSignal<boolean>(false);

  createEffect(
    on(
      () => insertActionResult.result,
      () => {
        if (submittedForm()) {
          if (insertActionResult.result?.message === "success") {
            popSuccess();
          } else if (
            insertActionResult.result?.message !== "success" &&
            insertActionResult.result?.message !== undefined
          )
            popError(insertActionResult.result?.message!);
        }
      }
    )
  );

  //outside click close
  const [target, setTarget] = createSignal<HTMLElement | undefined>();

  useClickOutside(target, () => {
    setMainStore("showTranslate", false);
  });

  // ------------------------------------------------------------------------------- //
  const [translateTerm, setTranslateTerm] = createSignal<string>(
    props.translateText
  );

  const [
    translation,
    { refetch: refetchTranslation, mutate: mutateTranslation },
  ] = createResource(translateTerm, getTranslateData);

  const [definition, { refetch: refetchDefinition, mutate: mutateDefinition }] =
    createResource(translateTerm, getTextDataWebster);

  const [audio, { refetch: refetchAudio, mutate: mutateAudio }] =
    createResource(translateTerm, getOedSoundURL);

  const handleTranslate = async () => {
    setTranslateTerm(searchRef.value);
  };

  return (
    <div class={styles.translation} tabIndex={1} ref={setTarget}>
      <div class={styles.translationHeader}>
        <div class={styles.translationHeaderLeft}></div>
        <div class={styles.translationHeaderRight}>
          <button
            class={buttons.buttonClose}
            onclick={() => setMainStore("showTranslate", false)}
          >
            <OcX2 size={15} />
          </button>
        </div>
      </div>
      <div class={styles.translationBody}>
        <div class={styles.searchContent}>
          <img
            src="/images/main/input-left-corner.png"
            class={styles.searchLeftOrnament}
          />
          <input
            class={styles.searchInput}
            autocomplete="off"
            ref={searchRef}
            value={props.translateText}
            onKeyDown={onKeyDownTranslate}
          />
          <button class={styles.searchButton} onClick={handleTranslate}>
            <img src="/images/main/center.png" />
          </button>
          <img
            src="/images/main/input-right-corner.png"
            class={styles.searchRightOrnament}
          />
        </div>

        <Suspense fallback={<div>...</div>}>
          <form
            action={insertVocabularyItem}
            method="post"
            class={forms.formBody}
          >
            <input
              style={{ display: "none" }}
              name="word"
              autocomplete="off"
              value={translateTerm()}
            />
            <div class={forms.formInputGroup}>
              <input
                class={forms.formInput}
                name="audio"
                autocomplete="off"
                value={audio()}
              />
            </div>
            <div class={forms.formInputGroup}>
              <textarea
                name="definitions"
                class={forms.formTextarea}
                value={JSON.stringify(definition()?.definitions, null, " ")}
                onChange={(e) =>
                  mutateDefinition((value: any) => {
                    return {
                      ...value,
                      definitions: JSON.parse(e.currentTarget.value),
                    };
                  })
                }
              />
            </div>
            <div class={forms.formInputGroup}>
              <input
                class={forms.formInput}
                name="phonetics"
                autocomplete="off"
                value={
                  definition()?.phonetics || translation()?.wordTranscription
                }
              />
            </div>
            <div class={forms.formInputGroup}>
              <input
                class={forms.formInput}
                name="meaning"
                autocomplete="off"
                value={meaning()}
                onInput={(e) => setMeaning(e.target.value)}
              />
            </div>
            <button
              type="submit"
              class={buttons.buttonSubmit}
              onClick={() => setSubmittedForm(true)}
            >
              Submit
            </button>
          </form>

          <div class={styles.translationResult}>
            <div class={styles.translationResultBody}>
              <p
                class={styles.translationMainResult}
                onClick={() =>
                  handleSetTransInput(
                    "-" + translation()?.translation.toLowerCase()
                  )
                }
              >
                {translation()?.translation}
              </p>
              <div class={styles.translationResultContent}>
                <Show when={translation()?.translations}>
                  <Index each={Object.keys(translation()!.translations)}>
                    {(item, index) => {
                      let key = item() as string;
                      return (
                        <div class={styles.translationResultItem}>
                          <p
                            onClick={() =>
                              handleSetTransInput(" -" + item().toLowerCase())
                            }
                          >
                            {item()}
                          </p>

                          <div class={styles.translationResultItemText}>
                            <Index each={translation()!.translations[key]}>
                              {(m, n) => {
                                return (
                                  <div class={styles.translationResultItemRow}>
                                    <span
                                      onClick={() =>
                                        handleSetTransInput(
                                          "-" + m().translation.toLowerCase()
                                        )
                                      }
                                    >
                                      {m().translation}
                                    </span>
                                    <span>{m().synonyms.join(", ")}</span>
                                    <Switch>
                                      <Match when={m().frequency === 3}>
                                        <span class={styles.frequencyContainer}>
                                          <span
                                            class={styles.frequencyDot}
                                          ></span>
                                          <span
                                            class={styles.frequencyDot}
                                          ></span>
                                          <span
                                            class={styles.frequencyDot}
                                          ></span>
                                        </span>
                                      </Match>
                                      <Match when={m().frequency === 2}>
                                        <span class={styles.frequencyContainer}>
                                          <span
                                            class={styles.frequencyDot}
                                          ></span>
                                          <span
                                            class={styles.frequencyDot}
                                          ></span>
                                          <span
                                            class={styles.frequencyClear}
                                          ></span>
                                        </span>
                                      </Match>
                                      <Match when={m().frequency === 1}>
                                        <span class={styles.frequencyContainer}>
                                          <span
                                            class={styles.frequencyDot}
                                          ></span>
                                          <span
                                            class={styles.frequencyClear}
                                          ></span>
                                          <span
                                            class={styles.frequencyClear}
                                          ></span>
                                        </span>
                                      </Match>
                                    </Switch>
                                  </div>
                                );
                              }}
                            </Index>
                          </div>
                        </div>
                      );
                    }}
                  </Index>
                </Show>
              </div>
            </div>
          </div>
        </Suspense>

        <Show when={definition()}>
          <EditDefinition item={definition()!} />
        </Show>
      </div>
      <Toaster
        position="top-center"
        containerClassName={styles.toastContainer}
        toastOptions={{ className: `${styles.toastContent}` }}
      />
    </div>
  );
};

export default Translation;
