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
  onMount,
} from "solid-js";
import "/public/styles/edit.scss";
import "/public/styles/translate.scss";
import "/public/styles/toast.scss";
import { OcX2 } from "solid-icons/oc";
import { TranslateType, VocabularyType } from "~/types";
import { useSubmission } from "@solidjs/router";
import { createStore } from "solid-js/store";
import Definition from "./definition";
import {
  getOedSoundURL,
  getTextDataAmerica,
  getTextDataCambridge,
  getTextDataEnglish,
  getTranslate,
  insertVocabularyItem,
} from "~/api/api";
import toast, { Toaster } from "solid-toast";

const Translation: Component<{
  translateText: string;
  onClose: Setter<boolean>;
}> = (props) => {
  const insertActionResult = useSubmission(insertVocabularyItem);
  const [translateTerm, setTranslateTerm] = createSignal<string>("");
  const [translateData, setTranslateData] = createSignal<TranslateType>();

  //----------------------------DONE NO EDIT--------------
  const [definitionValue, setDefinitionValue] = createStore<{
    type: string;
    example: string;
    sound: string;
  }>({
    type: "",
    example: "",
    sound: "",
  });

  onMount(() => {
    setTranslateTerm(props.translateText);
  });

  const mockData = {
    text: "",
    sound: "",
    class: "",
    definitions: [],
    phonetic: "",
    meaning: "",
    number: 240,
  };

  //select definitions
  const [definitionData, setDefinitionData] = createStore<{
    america: VocabularyType;
    english: VocabularyType;
    cambridge: VocabularyType;
  }>({
    america: mockData,
    english: mockData,
    cambridge: mockData,
  });
  const [visible, setVisible] = createSignal([true, true, true]);

  const handleCheck = async (index: number, data: VocabularyType) => {
    setVisible(visible().map((item, i) => i === index));
    setDefinitionValue({
      type: data.class,
      example: JSON.stringify(data.definitions),
      sound:
        definitionData.america.sound || (await getOedSoundURL(translateTerm())),
    });
  };

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
    if (keyDown === " ") {
      setTranslateTerm("");
    }
    if (keyDown === "Enter") handleTranslate();
  };

  const handleTranslate = async () => {
    if (translateTerm() !== "") {
      setVisible([true, true, true]);
      setTransInput("");
      await Promise.all([
        getTextDataAmerica(translateTerm()),
        getTextDataEnglish(translateTerm()),
        getTextDataCambridge(translateTerm()),
        getTranslate(translateTerm()),
      ]).then((data) => {
        setDefinitionData({
          america: data[0],
          english: data[1],
          cambridge: data[2],
        });
        setTranslateData(data[3]);
      });
    }
  };

  //----------------------TOAST----------------------
  const popSuccess = () => toast.success("Success", { duration: 3000 });
  const popError = (msg: string) => toast.error(msg, { duration: 3000 });

  createEffect(() => {
    if (insertActionResult.result?.message === "success") {
      popSuccess();
    } else if (insertActionResult.result?.message !== undefined)
      popError(insertActionResult.result?.message!);
  });

  return (
    <div class="edit" tabIndex={1}>
      <div class="editHeader">
        <div class="editHeaderLeft"></div>
        <div class="editHeaderRight">
          <button class="editBtn" onclick={props.onClose}>
            <OcX2 size={12} />
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
          <button class="translateBtn" onClick={handleTranslate}>
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
            name="text"
            autocomplete="off"
            value={translateTerm()}
          />
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="sound"
              autocomplete="off"
              value={definitionValue.sound}
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="class"
              autocomplete="off"
              value={definitionValue.type}
            />
          </div>
          <div class="editInputGroup">
            <textarea
              name="definitions"
              class="editInputItem editInputItemResult"
              value={definitionValue.example}
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="phonetic"
              autocomplete="off"
              value={translateData()?.wordTranscription}
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
          <div class="editInputGroup">
            <input
              type="number"
              class="editInputItem"
              name="number"
              autocomplete="off"
              value={240}
            />
          </div>
          <button type="submit" class="editSubmitBtn">
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

        <Show when={visible()[0]}>
          <Definition
            item={definitionData.america}
            onCheck={() => handleCheck(0, definitionData.america)}
          />
        </Show>
        <Show when={visible()[1]}>
          <Definition
            item={definitionData.english}
            onCheck={() => handleCheck(1, definitionData.english)}
          />
        </Show>
        <Show when={visible()[2]}>
          <Definition
            item={definitionData.cambridge}
            onCheck={() => handleCheck(2, definitionData.cambridge)}
          />
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
