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
import { OcX2 } from "solid-icons/oc";
import { VocabularyType } from "~/types";
import { action, useSubmission } from "@solidjs/router";
import Definition from "./definition";
import { editVocabularyItem, getTextDataWebster } from "~/api/api";
import toast, { Toaster } from "solid-toast";
import { createStore } from "solid-js/store";
import useClickOutside from "solid-click-outside";
import { FaRegularImage, FaSolidExpand } from "solid-icons/fa";

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

  //handy edit

  const [handyResult, setHandyResult] = createSignal<string>("");

  const handleHandyEdit = action(async (formData: FormData) => {
    const header = String(formData.get("editItem--header"));
    const def1 = String(formData.get("editItem--def1"));
    const def1up = String(formData.get("editItem--def1up"));
    const def2 = String(formData.get("editItem--def2"));
    const def2up = String(formData.get("editItem--def2up"));
    const def3 = String(formData.get("editItem--def3"));
    const def3up = String(formData.get("editItem--def3up"));
    const img = String(formData.get("editItem--img"));
    let x = String(formData.get("editItem--x"));
    const author = String(formData.get("editItem--author"));
    const title = String(formData.get("editItem--title"));
    const year = String(formData.get("editItem--year"));
    const newText =
      props.item?.text.length > 4
        ? props.item?.text.slice(0, -2)
        : props.item?.text;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");
    x = x.replace(regText, `<b>$1</b>`);

    const resultArr = [header, def1, def2, def3, img, x];

    let result = resultArr
      .map((item, index) => {
        switch (index) {
          case 0:
            if (img !== "" && header !== "")
              return `<span class="websHead">${item}</span><span class="websThumb"><span>`;
            else if (img !== "" && header === "")
              return `<span class="websThumb"><span>`;
          case 1:
            if (item !== "")
              return `<span class="websDef">${item}${
                def1up && `<span class="websDefUp">${def1up}</span>`
              }</span>`;
          case 2:
            if (item !== "")
              return `<span class="websDef">${item}${
                def2up && `<span class="websDefUp">${def2up}</span>`
              }</span>`;
          case 3:
            if (item !== "")
              return `<span class="websDef">${item}${
                def3up && `<span class="websDefUp">${def3up}</span>`
              }</span>`;
          case 4:
            if (item !== "")
              return `</span><img class="websImg" src="${item}"/></span>`;
          case 5:
            if (item !== "") return `<span class="websX">${item}</span>`;
          default:
            break;
        }
      })
      .join("");

    let creditArr = [author, title, year];
    let hasNonNull = creditArr.some((element) => element);

    if (hasNonNull) {
      result += `<span class="websCredits">`;
      if (author !== "") result += `<span class="websAuthor">${author} </span>`;
      if (title !== "") result += `<span class="websTitle">${title} </span>`;
      if (year !== "") result += `<span class="websYear">${year}</span>`;
      result += `</span>`;
    }
    setHandyResult(result);
  });

  return (
    <div class="edit" tabIndex={1} ref={setTarget}>
      <div class="editHeader">
        <div class="editHeaderLeft"></div>
        <div class="editHeaderRight">
          <button class="button button--primary" onClick={handleShowHandyEdit}>
            <FaSolidExpand size={12} />
          </button>
          <button class="button button--close" onclick={props.onClose}>
            <OcX2 size={15} />
          </button>
        </div>
      </div>
      <div class="editBody">
        <Show when={showHandyEdit()}>
          <div class="handyEditContainer">
            <form class="editItemForm" action={handleHandyEdit} method="post">
              <input
                class="editItem--header"
                autocomplete="off"
                name="editItem--header"
              />
              <div class="editItem--thumb">
                <div>
                  <input type="submit" style="display: none;" />
                  <div class="editItem--defs">
                    <input
                      class="editItem--def"
                      autocomplete="off"
                      name="editItem--def1"
                    />
                    <input
                      class="editItem--def"
                      autocomplete="off"
                      name="editItem--def1up"
                    />
                  </div>
                  <div class="editItem--defs">
                    <input
                      class="editItem--def"
                      autocomplete="off"
                      name="editItem--def2"
                    />
                    <input
                      class="editItem--def"
                      autocomplete="off"
                      name="editItem--def2up"
                    />
                  </div>
                  <div class="editItem--defs">
                    <input
                      class="editItem--def"
                      autocomplete="off"
                      name="editItem--def3"
                    />
                    <input
                      class="editItem--def"
                      autocomplete="off"
                      name="editItem--def3up"
                    />
                  </div>
                </div>
                <div class="editItem--img">
                  <textarea
                    class="editItem--textarea"
                    autocomplete="off"
                    name="editItem--img"
                  />
                  <FaRegularImage class="editItem--imgbg" color="#ffffff" />
                </div>
              </div>
              <div class="editItem--xs">
                <img src="/images/main/clover1.png" width={15} height={15} />
                <input
                  class="editItem--def"
                  autocomplete="off"
                  name="editItem--x"
                />
              </div>
              <span class="editItem--credit">
                <input
                  class="editItem--def"
                  autocomplete="off"
                  name="editItem--author"
                />
                <input
                  class="editItem--def"
                  autocomplete="off"
                  name="editItem--title"
                />
                <input
                  class="editItem--def"
                  autocomplete="off"
                  name="editItem--year"
                />
              </span>
            </form>
            <div class="editInputGroup">
              <textarea
                class="editInputItem editInputItemResult editInputHandy"
                value={JSON.stringify(handyResult()).slice(1, -1)}
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
