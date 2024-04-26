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
import "/public/styles/edit.scss";
import "/public/styles/translate.scss";
import "/public/styles/toast.scss";
import { OcX2 } from "solid-icons/oc";
import { TranslateType, VocabularyType } from "~/types";
import { useSubmission } from "@solidjs/router";
import Definition from "./definition";
import {
  getOedSoundURL,
  getTextDataWebster,
  getTranslate,
  insertVocabularyItem,
} from "~/api/api";
import toast, { Toaster } from "solid-toast";
import useClickOutside from "solid-click-outside";

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
      const data = await getTextDataWebster(translateTerm());
      if (data) {
        const sound = await getOedSoundURL(translateTerm());
        setDefinitionData({ ...data, audio: sound });
      }
    }
  };

  onMount(() => {
    handleTranslate();
    handleFindDefinition();
  });

  //----------------------TOAST----------------------
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
    props.onClose(false);
  });

  return (
    <div class="edit" tabIndex={1} ref={setTarget}>
      <div class="editHeader">
        <div class="editHeaderLeft"></div>
        <div class="editHeaderRight">
          <button class="button button--close" onclick={props.onClose}>
            <OcX2 size={15} />
          </button>
        </div>
      </div>
      <div class="editBody">
        <div class="newTranslateContainer">
          <img
            src="/images/main/input-left-corner.png"
            class="myInputLeftOrnament"
          />
          <input
            class="newTranslateInput"
            autocomplete="off"
            value={translateTerm()}
            onInput={(e) => setTranslateTerm(e.target.value)}
            onKeyDown={onKeyDownTranslate}
          />
          <button class="translateBtn" onClick={handleFindDefinition}>
            <img src="/images/main/center.png" />
          </button>
          <img
            src="/images/main/input-right-corner.png"
            class="myInputRightOrnament"
          />
        </div>
        <form action={insertVocabularyItem} method="post" class="editForm">
          <input
            style={{ display: "none" }}
            name="word"
            autocomplete="off"
            value={translateTerm()}
          />
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="audio"
              autocomplete="off"
              value={definitionData().audio}
            />
          </div>
          <div class="editInputGroup">
            <textarea
              name="definitions"
              class="editInputItem editInputItemResult"
              value={JSON.stringify(definitionData().definitions, null, " ")}
              onChange={(e) =>
                setDefinitionData({
                  ...definitionData(),
                  definitions: JSON.parse(e.currentTarget.value),
                })
              }
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="phonetics"
              autocomplete="off"
              value={
                definitionData().phonetics || translateData()?.wordTranscription
              }
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="meaning"
              autocomplete="off"
              value={transInput()}
              onInput={(e) => setTransInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            class="button button--submit"
            onClick={() => setSubmittedForm(true)}
          >
            Submit
          </button>
        </form>

        <Show when={translateData()}>
          <div class="translate">
            <div class="translateBody">
              <p
                class="translateTranslation"
                onClick={() =>
                  handleSetTransInput(
                    "-" + translateData()!.translation.toLowerCase()
                  )
                }
              >
                {translateData()!.translation}
              </p>
              <div class="translateContent">
                <Index each={Object.keys(translateData()!.translations)}>
                  {(item, index) => {
                    let key = item() as string;
                    return (
                      <div class="translateContentItem">
                        <p
                          onClick={() =>
                            handleSetTransInput(" -" + item().toLowerCase())
                          }
                        >
                          {item()}
                        </p>
                        <div class="translateContentItemText">
                          <Index each={translateData()!.translations[key]}>
                            {(m, n) => {
                              return (
                                <div class="translateContentItemRow">
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
                                      <span class="frequencyContainer">
                                        <span class="frequencyDot"></span>
                                        <span class="frequencyDot"></span>
                                        <span class="frequencyDot"></span>
                                      </span>
                                    </Match>
                                    <Match when={m().frequency === 2}>
                                      <span class="frequencyContainer">
                                        <span class="frequencyDot"></span>
                                        <span class="frequencyDot"></span>
                                        <span class="frequencyClear"></span>
                                      </span>
                                    </Match>
                                    <Match when={m().frequency === 1}>
                                      <span class="frequencyContainer">
                                        <span class="frequencyDot"></span>
                                        <span class="frequencyClear"></span>
                                        <span class="frequencyClear"></span>
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
        containerClassName="toast-container"
        toastOptions={{ className: "toast-content" }}
      />
    </div>
  );
};

export default Translation;
