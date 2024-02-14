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
import "/public/styles/translate.scss";
import { OcRepopush2, OcX2 } from "solid-icons/oc";
import { TranslateType, VocabularyType } from "~/types";
import { useAction, useSubmission } from "@solidjs/router";
import {
  getOedSound,
  getTextDataAmerica,
  getTextDataCambridge,
  getTextDataEnglish,
  insertNewVocabularyItem,
} from "~/api/api";
import { Motion, Presence } from "solid-motionone";
import Alert from "./alert";
import { createStore } from "solid-js/store";
import Definition from "./definition";

const Translation: Component<{
  item: TranslateType;
  text: string;
  onClose: Setter<boolean>;
}> = (props) => {
  const [transInput, setTransInput] = createSignal<string>("");
  const handleSetTransInput = (text: string) => {
    setTransInput(transInput() + text);
  };

  const onKeyDownInput: JSX.EventHandlerUnion<
    HTMLInputElement,
    KeyboardEvent
  > = (event) => {
    const keyDown = event.key;
    event.stopPropagation();
    if (keyDown === "Escape") {
      setTransInput("");
    }
  };

  //alert and insert text start
  const [sendInsert, setSendInsert] = createSignal<boolean>(false);
  const insertNewVocabularyItemAction = useAction(insertNewVocabularyItem);
  const insertActionResult = useSubmission(insertNewVocabularyItem);
  const getOedSoundAction = useAction(getOedSound);
  const [alertObj, setAlertObj] = createStore({
    showAlert: false,
    alert: false,
    message: "",
  });

  createEffect(() => {
    if (sendInsert()) {
      setTimeout(() => {
        setAlertObj({
          showAlert: true,
          message: insertActionResult.result?.message,
          alert: insertActionResult.result?.message !== "success",
        });
      }, 1000);
      setTimeout(() => {
        setAlertObj({ showAlert: false });
        setSendInsert(false);
      }, 3000);
    }
  });

  const [insertText, setInsertText] = createStore<VocabularyType>({
    text: "",
    sound: "",
    class: "",
    definitions: [],
    phonetic: "",
    meaning: "",
    number: 240,
  });

  const handleInsertNewVocabulary = async () => {
    const newInsertText: VocabularyType = {
      ...insertText,
      definitions: [...insertText.definitions],
      sound: definitionData.america.sound,
      meaning: transInput(),
      phonetic: props.item?.wordTranscription || "null",
    };
    if (newInsertText.sound === "") {
      newInsertText.sound = await getOedSoundAction(newInsertText.text);
    }
    insertNewVocabularyItemAction(newInsertText);
    setSendInsert(true);
  };

  //select definitions
  const [definitionData, setDefinitionData] = createStore<{
    america: VocabularyType;
    english: VocabularyType;
    cambridge: VocabularyType;
  }>({
    america: insertText,
    english: insertText,
    cambridge: insertText,
  });

  const [visible, setVisible] = createSignal([true, true, true]);

  onMount(() => {
    Promise.all([
      getTextDataAmerica(props.text),
      getTextDataEnglish(props.text),
      getTextDataCambridge(props.text),
    ]).then((data) => {
      setDefinitionData({
        america: data[0],
        english: data[1],
        cambridge: data[2],
      });
    });
  });

  const handleCheck = (index: number, data: VocabularyType) => {
    setVisible(visible().map((item, i) => i === index));
    setInsertText({
      text: data.text,
      class: data.class,
      definitions: data.definitions,
    });
  };

  return (
    <>
      <Presence>
        <Show when={alertObj.showAlert}>
          <Motion
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{
              duration: 0.45,
              easing: [0.785, 0.135, 0.15, 0.86],
            }}
          >
            <Alert message={alertObj.message} alert={alertObj.alert} />
          </Motion>
        </Show>
      </Presence>

      <div class="translate">
        <div class="translateHeader">
          <div class="translateHeaderLeft">
            <p class="translateHeaderText">
              Translation of{" "}
              <b>
                {props.item?.word}
                <b>【{props.item?.wordTranscription}】</b>
              </b>
            </p>
          </div>
          <div class="translateHeaderRight">
            <button
              class="translateBtn"
              disabled={insertText.text === ""}
              onclick={() => handleInsertNewVocabulary()}
            >
              <OcRepopush2 size={12} />
            </button>
            <button class="translateBtn" onclick={props.onClose}>
              <OcX2 size={12} />
            </button>
          </div>
        </div>
        <div class="translateBody">
          <input
            type="text"
            class="translateInput"
            value={transInput()}
            onKeyDown={onKeyDownInput}
            onInput={(e) => setTransInput(e.currentTarget.value)}
          />
          <p
            class="translateTranslation"
            onClick={() =>
              handleSetTransInput("-" + props.item?.translation.toLowerCase())
            }
          >
            {props.item?.translation}
          </p>
          <div class="translateContent">
            {props.item !== undefined && (
              <Index each={Object.keys(props.item?.translations)}>
                {(item, index) => {
                  let key = item() as keyof typeof props.item.translations;
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
                        <Index each={props.item?.translations[key]}>
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
            )}
          </div>
        </div>
      </div>

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
    </>
  );
};

export default Translation;
