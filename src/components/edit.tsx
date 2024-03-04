import {
  Component,
  Setter,
  Show,
  createEffect,
  createSignal,
  on,
  onMount,
} from "solid-js";
import "/public/styles/edit.scss";
import "/public/styles/toast.scss";
import { OcChevronup2, OcX2 } from "solid-icons/oc";
import { VocabularyType } from "~/types";
import { useSubmission } from "@solidjs/router";
import Definition from "./definition";
import { editVocabularyItem, getTextDataWebster } from "~/api/api";
import toast, { Toaster } from "solid-toast";
import { createStore } from "solid-js/store";
import useClickOutside from "solid-click-outside";

const Edit: Component<{
  item: VocabularyType;
  onClose: Setter<boolean>;
}> = (props) => {
  const [showHandyEdit, setShowHandyEdit] = createSignal<boolean>(false);
  const editActionResult = useSubmission(editVocabularyItem);
  const mockData: VocabularyType = {
    text: "",
    sound: "",
    class: "",
    definitions: [],
    phonetic: "",
    meaning: "",
    number: 240,
    created_at: "",
  };
  const [definitionData, setDefinitionData] =
    createSignal<VocabularyType>(mockData);

  const [definitionValue, setDefinitionValue] = createStore<{
    type: string;
    example: string;
    phonetic: string;
  }>({
    type: props.item.class,
    example: JSON.stringify(props.item.definitions),
    phonetic: props.item.phonetic,
  });

  const getAndSetDefinitionData = async (text: string) => {
    const data = await getTextDataWebster(text);
    if (data) setDefinitionData(data);
  };

  const handleCheck = () => {
    setDefinitionValue({
      type: definitionData().class,
      example: JSON.stringify(definitionData().definitions),
      phonetic: definitionData().phonetic,
    });
  };

  onMount(() => {
    getAndSetDefinitionData(props.item.text);
  });

  const handyType1 =
    '<span class="websHead">adjective</span><span class="websDef">a: a content<span class="websDefUp"> : a similar</span></span><span class="websX">definition</span><span class="websCredits"><span class="websAuthor">Author </span><span class="websTitle">Title </span><span class="websYear">28 Feb. 2024</span></span><span class="websSyn"><b>Synonym : </b><small>a, b, c</small></span>';

  const handyType2 =
    '<span class="websHead">noun</span><span class="websThumb"><span><span class="websDef">: something</span><span class="websDef">a: a content</span></span><img class="websImg" src="abc"/></span><span class="websX">example</span><span class="websCredits"><span class="websAuthor">Author </span><span class="websTitle">Title </span><span class="websYear">28 Feb. 2024</span></span>';
  //----------------------TOAST----------------------
  const popSuccess = () => toast.success("Success", { duration: 3000 });
  const popError = (msg: string) => toast.error(msg, { duration: 3000 });
  const [submittedForm, setSubmittedForm] = createSignal<boolean>(false);

  createEffect(
    on(
      () => editActionResult.result,
      () => {
        if (submittedForm()) {
          if (editActionResult.result?.message === "success") {
            popSuccess();
          } else if (
            editActionResult.result?.message !== "success" &&
            editActionResult.result?.message !== undefined
          )
            popError(editActionResult.result?.message!);
        }
      }
    )
  );

  const handleShowHandyEdit = () => {
    setShowHandyEdit(!showHandyEdit());
  };

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
          <button class="button button--primary" onClick={handleShowHandyEdit}>
            <OcChevronup2 size={12} />
          </button>
          <button class="button button--close" onclick={props.onClose}>
            <OcX2 size={15} />
          </button>
        </div>
      </div>
      <div class="editBody">
        <Show when={showHandyEdit()}>
          <div class="handyEditContainer">
            <div class="editInputGroup">
              <textarea
                class="editInputItem editInputItemResult"
                value={JSON.stringify(handyType1)}
              />
            </div>
            <div class="editInputGroup">
              <textarea
                class="editInputItem editInputItemResult"
                value={JSON.stringify(handyType2)}
              />
            </div>
          </div>
        </Show>

        <form action={editVocabularyItem} method="post" class="editForm">
          <div class="newTranslateContainer">
            <img
              src="/images/main/input-left-corner.png"
              class="myInputLeftOrnament"
            />
            <input
              class="newTranslateInput"
              name="text"
              autocomplete="off"
              value={props.item?.text}
            />
            <img
              src="/images/main/input-right-corner.png"
              class="myInputRightOrnament"
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
              name="phonetic"
              autocomplete="off"
              value={definitionValue.phonetic}
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
          <input
            type="text"
            name="created_at"
            autocomplete="off"
            value={props.item?.created_at}
            style={{ display: "none" }}
          />
          <button
            type="submit"
            class="button button--submit"
            onClick={() => setSubmittedForm(true)}
          >
            Submit
          </button>
        </form>

        <Show when={definitionData().text}>
          <Definition item={definitionData()} onCheck={handleCheck} />
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

export default Edit;
