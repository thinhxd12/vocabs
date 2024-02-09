import {
  Component,
  Setter,
  Show,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import "/public/styles/edit.scss";
import { OcChevrondown2, OcChevronup2, OcX2 } from "solid-icons/oc";
import { VocabularyType } from "~/types";
import { action, useSubmission } from "@solidjs/router";

import { Motion, Presence } from "solid-motionone";
import Alert from "./alert";
import { createStore } from "solid-js/store";
import Definition from "./definition";
import {
  editVocabularyItem,
  getTextDataAmerica,
  getTextDataCambridge,
  getTextDataEnglish,
} from "~/api/api";

const Edit: Component<{
  item: VocabularyType;
  onClose: Setter<boolean>;
}> = (props) => {
  const [showHandyEdit, setShowHandyEdit] = createSignal<boolean>(false);
  const [submitForm, setSubmitForm] = createSignal<boolean>(false);
  const editActionResult = useSubmission(editVocabularyItem);
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
      }, 3000);
    }
  });

  //----------------------------DONE NO EDIT--------------
  const [definitionValue, setDefinitionValue] = createStore<{
    type: string;
    example: string;
  }>({
    type: "",
    example: "",
  });

  onMount(() => {
    setDefinitionValue({
      type: props.item.class,
      example: JSON.stringify(props.item.definitions),
    });
    Promise.all([
      getTextDataAmerica(props.item.text),
      getTextDataEnglish(props.item.text),
      getTextDataCambridge(props.item.text),
    ]).then((data) => {
      setDefinitionData({
        america: data[0],
        english: data[1],
        cambridge: data[2],
      });
    });
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

  const handleCheck = (index: number, data: VocabularyType) => {
    setVisible(visible().map((item, i) => i === index));
    setDefinitionValue({
      type: data.class,
      example: JSON.stringify(data.definitions),
    });
  };

  const [handyEditResult, setHandyEditResult] = createSignal<string>("");
  const handleSubmitDefinition = action(async (formData: FormData) => {
    const newText =
      props.item.text.length > 4
        ? props.item.text.slice(0, -2)
        : props.item.text;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");
    let res = "";
    const image = String(formData.get("image"));
    const definition = String(formData.get("definition"));
    const example = String(formData.get("example"));
    const synonym = String(formData.get("synonym"));

    if (image !== "")
      res += `<span class=\"thumb_img\"><img class=\"thumb\" src=\"${image}\"/><span><span class=\"def\">${definition}</span>${
        example !== ""
          ? `<span class=\"x\">${example.replace(regText, `<b>$1</b>`)}</span>`
          : ""
      }</span></span>`;
    else
      res += `<span class=\"def\">${definition}</span>${
        example !== ""
          ? `<span class=\"x\">${example.replace(regText, `<b>$1</b>`)}</span>`
          : ""
      }`;
    if (synonym !== "")
      res += `<span class=\"xr-gs\">synonym <small>${synonym}</small></span>`;

    setHandyEditResult(JSON.stringify(res));
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
              <form action={handleSubmitDefinition} method="post">
                <div class="editInputGroup">
                  <input
                    class="editInputItem"
                    placeholder="Image"
                    name="image"
                    autocomplete="off"
                  />
                </div>
                <div class="editInputGroup">
                  <input
                    class="editInputItem"
                    placeholder="Definition"
                    autocomplete="off"
                    name="definition"
                  />
                </div>
                <div class="editInputGroup">
                  <input
                    class="editInputItem"
                    placeholder="Example"
                    autocomplete="off"
                    name="example"
                  />
                </div>
                <div class="editInputGroup">
                  <input
                    class="editInputItem"
                    placeholder="Synonym"
                    autocomplete="off"
                    name="synonym"
                  />
                </div>
                <div class="editInputGroup">
                  <textarea
                    class="editInputItem editInputItemResult"
                    value={handyEditResult()}
                  />
                </div>
                <button type="submit" class="editSubmitBtn">
                  Submit
                </button>
              </form>
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
