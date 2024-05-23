import {
  Component,
  Index,
  JSX,
  Match,
  Setter,
  Show,
  Switch,
  createEffect,
  createSignal,
  on,
  onMount,
} from "solid-js";
import { OcX2 } from "solid-icons/oc";
import { TranslateType, VocabularyType } from "~/types";
import { useSubmission } from "@solidjs/router";
import Definition from "./definition";
import {
  getOedSoundURL,
  getTextDataWebster,
  getTranslate,
  insertVocabularyItem,
  searchMemoriesText,
} from "~/lib/api";
import toast, { Toaster } from "solid-toast";
import useClickOutside from "solid-click-outside";
import styles from "./translation.module.scss";
import buttons from "../assets/styles/buttons.module.scss";
import forms from "../assets/styles/form.module.scss";

const Translation: Component<{
  translateText: string;
  onClose: Setter<boolean>;
}> = (props) => {
  const insertActionResult = useSubmission(insertVocabularyItem);
  const [translateTerm, setTranslateTerm] = createSignal<string>(
    props.translateText
  );
  const [translateData, setTranslateData] = createSignal<TranslateType>();
  const mockData: VocabularyType = {
    word: "",
    audio: "",
    phonetics: "",
    number: 240,
    translations: [],
    definitions: [],
    created_at: "",
  };
  const [definitionData, setDefinitionData] =
    createSignal<VocabularyType>(mockData);

  //--------------------------TRANSLATION-----------------

  const [transInput, setTransInput] = createSignal<string>("");
  const handleSetTransInput = (text: string) => {
    setTransInput(transInput() + text);
  };

  const onKeyDownTranslate: JSX.EventHandlerUnion<
    HTMLInputElement,
    KeyboardEvent
  > = (event) => {
    event.stopPropagation();
    const keyDown = event.key;
    if (keyDown === "Enter") handleTranslate();
  };

  const handleTranslate = async () => {
    if (translateTerm() !== "") {
      setTransInput("");
      const data = await getTranslate(translateTerm());
      if (data) setTranslateData(data);
    }
  };

  const handleFindDefinition = async () => {
    if (translateTerm() !== "") {
      setTransInput("");
      const checkMemories = await searchMemoriesText(translateTerm());
      if (checkMemories) {
        popCheckMemories(checkMemories.message);
      }
      const data = await getTextDataWebster(translateTerm());
      if (data) {
        const sound = await getOedSoundURL(translateTerm());
        setDefinitionData({ ...data, audio: sound });
      }
    }
  };

  //----------------------TOAST----------------------
  const popCheckMemories = (msg: string) =>
    toast.error(msg, { duration: 6000 });
  const popSuccess = () => toast.success("Success", { duration: 3000 });
  const popError = (msg: string) => toast.error(msg, { duration: 3000 });
  const [submittedForm, setSubmittedForm] = createSignal<boolean>(false);

  onMount(() => {
    handleTranslate();
    handleFindDefinition();
  });

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
    props.onClose(false);
  });

  return (
    <div class={styles.translation} tabIndex={1} ref={setTarget}>
      <div class={styles.translationHeader}>
        <div class={styles.translationHeaderLeft}></div>
        <div class={styles.translationHeaderRight}>
          <button class={buttons.buttonClose} onclick={props.onClose}>
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
            value={translateTerm()}
            onInput={(e) => setTranslateTerm(e.target.value)}
            onKeyDown={onKeyDownTranslate}
          />
          <button class={styles.searchButton} onClick={handleFindDefinition}>
            <img src="/images/main/center.png" />
          </button>
          <img
            src="/images/main/input-right-corner.png"
            class={styles.searchRightOrnament}
          />
        </div>
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
              value={definitionData().audio}
            />
          </div>
          <div class={forms.formInputGroup}>
            <textarea
              name="definitions"
              class={forms.formTextarea}
              value={JSON.stringify(definitionData().definitions, null, " ")}
              onChange={(e) =>
                setDefinitionData({
                  ...definitionData(),
                  definitions: JSON.parse(e.currentTarget.value),
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
                definitionData().phonetics || translateData()?.wordTranscription
              }
            />
          </div>
          <div class={forms.formInputGroup}>
            <input
              class={forms.formInput}
              name="meaning"
              autocomplete="off"
              value={transInput()}
              onInput={(e) => setTransInput(e.target.value)}
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

        <Show when={translateData()}>
          <div class={styles.translationResult}>
            <div class={styles.translationResultBody}>
              <p
                class={styles.translationMainResult}
                onClick={() =>
                  handleSetTransInput(
                    "-" + translateData()!.translation.toLowerCase()
                  )
                }
              >
                {translateData()!.translation}
              </p>
              <div class={styles.translationResultContent}>
                <Index each={Object.keys(translateData()!.translations)}>
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
                          <Index each={translateData()!.translations[key]}>
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
              </div>
            </div>
          </div>
        </Show>

        <Show when={definitionData().word}>
          <Definition item={definitionData()} />
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
