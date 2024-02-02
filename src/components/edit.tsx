import {
  Index,
  JSX,
  Match,
  Setter,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import "/public/styles/edit.scss";
import {
  OcCheck2,
  OcChevrondown2,
  OcChevronup2,
  OcPencil2,
  OcRepopush2,
  OcX2,
} from "solid-icons/oc";
import { VocabularyType } from "~/types";
import { useAction, useSubmission } from "@solidjs/router";
import {
  editVocabularyItem,
  getOedSound,
  getTextDataAmerica,
  getTextDataCambridge,
  getTextDataEnglish,
  insertNewVocabularyItem,
} from "~/api/api";
import { Motion, Presence } from "solid-motionone";
import Alert from "./alert";
import { makeTimer } from "@solid-primitives/timer";
import { createStore } from "solid-js/store";
import Definition from "./definition";

type Props = {
  item: VocabularyType;
  onClose: Setter<boolean>;
};

const Edit = (props: Props) => {
  const [insertText, setInsertText] = createStore<VocabularyType>({
    text: "",
    sound: "",
    class: "",
    definitions: props.item!.definitions,
    phonetic: "",
    meaning: "",
    number: 240,
  });

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

  // const getTextDataAmericaAction = useAction(getTextDataAmerica);
  const getTextDataEnglishAction = useAction(getTextDataEnglish);
  const getTextDataCambridgeAction = useAction(getTextDataCambridge);

  const handleCheck = (index: number, data: VocabularyType) => {
    setInsertText(data);
    setVisible(visible().map((item, i) => i === index));
  };

  //-------------------------------------------------
  const [showHandyEdit, setShowHandyEdit] = createSignal<boolean>(false);
  const editError = useSubmission(editVocabularyItem);
  const [showAlert, setShowAlert] = createSignal(false);
  const [alertObj, setAlertObj] = createStore({
    alert: true,
    message: "",
  });

  const [clicked, setClicked] = createSignal<boolean>(false);

  createEffect(async () => {
    if (props.item) {
      const data1 = await getTextDataAmerica(props.item?.text);
      const data2 = await getTextDataEnglishAction(props.item?.text);
      const data3 = await getTextDataCambridgeAction(props.item?.text);
      setDefinitionData({ america: data1, english: data2, cambridge: data3 });
    }
  });

  createEffect(() => {
    if (editError.result && clicked()) {
      if (editError.result.message === "success") {
        setAlertObj({
          message: "Edit successfully!",
          alert: false,
        });
        setShowAlert(true);
        const timer1 = setTimeout(() => {
          setShowAlert(false);
          setClicked(false);
          props.onClose(true);
        }, 3000);
        onCleanup(() => {
          clearTimeout(timer1);
        });
      } else {
        setAlertObj({ message: editError.result?.message, alert: true });
        setShowAlert(true);
        //make timeout 3s close alert
        const timer2 = setTimeout(() => {
          setShowAlert(false);
          setClicked(false);
        }, 6000);
        onCleanup(() => {
          clearTimeout(timer2);
        });
      }
    }
  });

  return (
    <div class="edit" tabIndex={1}>
      <div class="editHeader">
        <div class="editHeaderLeft"></div>
        <div class="editHeaderRight">
          <button
            class="editBtn"
            onClick={() => setShowHandyEdit(!showHandyEdit())}
          >
            <Show
              when={showHandyEdit()}
              fallback={<OcChevrondown2 size={12} />}
            >
              <OcChevronup2 size={12} />
            </Show>
          </button>
          <button class="editBtn" onclick={props.onClose}>
            <OcX2 size={12} />
          </button>
        </div>
      </div>
      <div class="editBody">
        <Presence>
          <Show when={showHandyEdit()}>
            <Motion.div
              class="handyEditContainer"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.3, easing: "ease-in-out" }}
            >
              <div class="editInputGroup">
                <input class="editInputItem" placeholder="Image" />
              </div>
              <div class="editInputGroup">
                <input class="editInputItem" placeholder="Definition" />
              </div>
              <div class="editInputGroup">
                <input class="editInputItem" placeholder="Example" />
              </div>
              <div class="editInputGroup">
                <input class="editInputItem" placeholder="Synonym" />
              </div>
              <div class="editInputGroup">
                <textarea class="editInputItem editInputItemResult">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Numquam eos, similique ipsa neque hic distinctio consectetur
                  labore, dolores quasi corrupti fuga harum, odio voluptas
                  laborum. Ducimus vel porro maiores ullam.
                </textarea>
              </div>
            </Motion.div>
          </Show>
        </Presence>

        <Presence>
          <Show when={showAlert()}>
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

        <form action={editVocabularyItem} method="post" class="editForm">
          <div class="editInputGroup">
            <input
              class="editInput"
              name="text"
              autocomplete="off"
              value={props.item?.text}
              disabled
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="sound"
              autocomplete="off"
              value={props.item?.sound}
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="class"
              autocomplete="off"
              value={props.item?.class}
            />
          </div>
          <div class="editInputGroup">
            <textarea
              name="definitions"
              class="editInputItem editInputItemResult"
            >
              {JSON.stringify(insertText.definitions)}
            </textarea>
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="phonetic"
              autocomplete="off"
              value={props.item?.phonetic}
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="meaning"
              autocomplete="off"
              value={props.item?.meaning}
            />
          </div>
          <div class="editInputGroup">
            <input
              type="number"
              class="editInputItem"
              name="number"
              autocomplete="off"
              value={props.item?.number}
            />
          </div>
          <button
            type="submit"
            class="editSubmitBtn"
            onClick={() => setClicked(true)}
          >
            Submit
          </button>
        </form>

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
    </div>
  );
};

export default Edit;
