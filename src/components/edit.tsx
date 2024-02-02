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
  const [showHandyEdit, setShowHandyEdit] = createSignal<boolean>(false);
  const editActionResult = useSubmission(editVocabularyItem);
  const [submitForm, setSubmitForm] = createSignal<boolean>(false);
  const [alertObj, setAlertObj] = createStore({
    showAlert: false,
    alert: false,
    message: "",
  });

  createEffect(() => {
    if (submitForm()) {
      setTimeout(() => {
        setAlertObj({
          showAlert: true,
          message: editActionResult.result?.message,
          alert: editActionResult.result?.message !== "success",
        });
      }, 1000);
      setTimeout(() => {
        setAlertObj({ showAlert: false });
        setSubmitForm(false);
      }, 6000);
    }
  });

  //----------------------------DONE NO EDIT--------------

  const getTextDataAmericaAction = useAction(getTextDataAmerica);
  const textDataAmerica = useSubmission(getTextDataAmerica);

  onMount(() => {
    getTextDataAmericaAction(
      // "https://www.getdailyart.com/en/22485/albrecht-durer/lot-and-his-daughters-reverse"
      // `https://www.oxfordlearnersdictionaries.com/search/american_english/direct/?q=${props.item.text}`
      props.item.text
    );
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

  createEffect(() => {
    if (textDataAmerica.result) {
      // setInsertText(textDataAmerica.result);
      console.log(textDataAmerica.result);
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

        <form action={editVocabularyItem} method="post" class="editForm">
          <div class="editInputGroup">
            <input
              class="editInput"
              name="text"
              autocomplete="off"
              value={props.item?.text}
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
              value={JSON.stringify(props.item.definitions)}
            />
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
            onClick={() => setSubmitForm(true)}
          >
            Submit
          </button>
        </form>

        {/* <Show when={true}>
          <Definition
            item={insertText}
            // onCheck={() => handleCheck(0, definitionData.america)}
          />
        </Show> */}

        {/* <Show when={visible()[0]}>
          <Definition
            item={definitionData.america}
            onCheck={() => handleCheck(0, definitionData.america)}
          />
        </Show> */}
        {/* <Show when={visible()[1]}>
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
        </Show> */}
      </div>
    </div>
  );
};

export default Edit;
