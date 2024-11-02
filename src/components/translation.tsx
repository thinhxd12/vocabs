import {
  Accessor,
  Component,
  Index,
  Match,
  Show,
  Signal,
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
import styles from "./translation.module.scss";
import buttons from "../assets/styles/buttons.module.scss";
import forms from "../assets/styles/form.module.scss";
import toasts from "../assets/styles/toast.module.scss";
import { mainStore, setMainStore } from "~/lib/mystore";
import { clickOutside, stopKeydown } from "~/utils";
import Definition from "./definition";
import { BiSolidSave } from "solid-icons/bi";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      searchTranslate: Signal<string>;
    }
  }
}

const Translation: Component<{
  translateText: string;
}> = (props) => {
  const insertActionResult = useSubmission(insertVocabularyItem);

  createEffect(async () => {
    const checkMemories = await searchMemoriesText(translateTerm());
    if (checkMemories) {
      popCheckMemories(checkMemories.message);
      setMainStore("audioSrc", "/sounds/mp3_Boing.mp3");
      mainStore.audioRef && mainStore.audioRef.play();
      if (mainStore.audioRef) {
        mainStore.audioRef.volume = 0.3;
        mainStore.audioRef.play();
      }
    }
  });

  //----------------------TOAST----------------------
  const [submittedForm, setSubmittedForm] = createSignal<boolean>(false);
  const popSuccess = (msg: string) =>
    toast.success(
      <div class={toasts.toastItemSuccess}>
        <h3>Success!</h3>
        <p>{msg}</p>
      </div>,
      {
        style: { "margin-top": "24px", padding: "8px 12px 8px 15px" },
        duration: 1000,
      }
    );

  const popError = (msg: string) =>
    toast.error(
      <div class={toasts.toastItemError}>
        <h3>Error!</h3>
        <p>{msg}</p>
      </div>,
      {
        style: { "margin-top": "24px", padding: "8px 12px 8px 15px" },
        duration: 3000,
      }
    );

  const popCheckMemories = (msg: string) =>
    toast.error(
      <div class={toasts.toastItemError}>
        <h3>Error!</h3>
        <p>{msg}</p>
      </div>,
      {
        style: { "margin-top": "24px", padding: "8px 12px 8px 15px" },
        duration: 6000,
      }
    );

  createEffect(
    on(
      () => insertActionResult.result,
      () => {
        if (submittedForm()) {
          if (insertActionResult.result?.message === "success") {
            popSuccess("New word has been saved successfully.");
            setMainStore("audioSrc", "/sounds/mp3_Ding.mp3");
            mainStore.audioRef && mainStore.audioRef.play();
          } else if (
            insertActionResult.result?.message !== "success" &&
            insertActionResult.result?.message !== undefined
          ) {
            popError(insertActionResult.result?.message!);
            setMainStore("audioSrc", "/sounds/mp3_Boing.mp3");
            mainStore.audioRef && mainStore.audioRef.play();
          }
        }
      }
    )
  );
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

  const [meaning, setMeaning] = createSignal<string>("");
  const handleSetTransInput = (text: string) => {
    setMeaning(meaning() + text);
  };

  const searchTranslate = (
    element: HTMLDivElement,
    value: Accessor<Signal<string>>
  ) => {
    const [field, setField] = value();
    element.addEventListener("keydown", (e) => {
      e.stopPropagation();
      const keyDown = e.key;
      const value = (e.target as HTMLInputElement).value;
      if (keyDown === "Enter") {
        setField(value);
      }
    });
  };

  const close = () => {
    setMainStore("showTranslate", false);
    setMainStore("translateTerm", "");
  };

  return (
    <div
      class={styles.translation}
      tabIndex={1}
      use:stopKeydown={null}
      use:clickOutside={close}
    >
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
            src="images/main/input-left-corner.webp"
            class={styles.searchLeftOrnament}
          />
          <input
            type="text"
            autocomplete="off"
            value={translateTerm()}
            class={styles.searchInput}
            use:searchTranslate={[translateTerm, setTranslateTerm]}
          />
          <img
            src="images/main/input-right-corner.webp"
            class={styles.searchRightOrnament}
          />
        </div>

        <Suspense fallback={<div class={forms.formBody}>...</div>}>
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
              <BiSolidSave size={15} />
              <span>Save</span>
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
          <Definition item={definition()!} />
        </Show>
      </div>
      <Toaster
        position="top-center"
        containerClassName={toasts.toastContainer}
      />
    </div>
  );
};

export default Translation;
