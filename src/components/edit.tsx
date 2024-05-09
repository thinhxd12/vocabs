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
import { VocabularyDefinitionType, VocabularyType } from "~/types";
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
  const [definitionData, setDefinitionData] = createStore<VocabularyType>(
    props.item
  );
  const [definitionDataRender, setDefinitionRender] =
    createSignal<VocabularyType>(props.item);
  const [translationString, setTranslationString] = createSignal<string>("");

  const getAndSetDefinitionData = async (text: string) => {
    const data = await getTextDataWebster(text);
    if (data) setDefinitionRender(data);
  };

  const handleCheck = () => {
    setDefinitionData({
      definitions: definitionDataRender().definitions,
      phonetics: definitionDataRender().phonetics,
    });
  };

  onMount(() => {
    getAndSetDefinitionData(props.item.word);
    let str = props.item.translations
      .map((item) => {
        let part = item.partOfSpeech;
        let mean = item.translations.join("-");
        return " -" + part + "-" + mean;
      })
      .join("");
    setTranslationString(str);
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

  const [handyResult, setHandyResult] =
    createSignal<VocabularyDefinitionType>();

  const handleHandyEdit = action(async (formData: FormData) => {
    const header = String(formData.get("editItem--header"));
    const def1 = String(formData.get("editItem--def1")).toLowerCase();
    const def1up = String(formData.get("editItem--def1up")).toLowerCase();
    const def2 = String(formData.get("editItem--def2")).toLowerCase();
    const def2up = String(formData.get("editItem--def2up")).toLowerCase();
    const def3 = String(formData.get("editItem--def3")).toLowerCase();
    const def3up = String(formData.get("editItem--def3up")).toLowerCase();
    const img = String(formData.get("editItem--img"));
    let x = String(formData.get("editItem--x"));
    const author = String(formData.get("editItem--author"));
    const title = String(formData.get("editItem--title")).toUpperCase();
    const year = String(formData.get("editItem--year"));
    const syn = String(formData.get("editItem--syn"));
    const newText =
      props.item?.word.length > 4
        ? props.item?.word.slice(0, -2)
        : props.item?.word;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");
    x = x.replace(regText, `<b>$1</b>`);

    let defArr = [];
    def1 && defArr.push({ sense: def1, similar: def1up });
    def2 && defArr.push({ sense: def2, similar: def2up });
    def3 && defArr.push({ sense: "&emsp;" + def3, similar: def3up });

    let resultObj: VocabularyDefinitionType = {
      example: [
        {
          year: year,
          title: title,
          author: author,
          sentence: x,
        },
      ],
      synonyms: syn,
      definitions: [
        {
          image: img,
          definition: defArr,
        },
      ],
      partOfSpeech: header,
    };

    setHandyResult(resultObj);
  });

  return (
    <div class="edit" tabIndex={1} ref={setTarget}>
      <div class="editHeader">
        <div class="editHeaderLeft"></div>
        <div class="editHeaderRight">
          <button class="button button--primary" onClick={handleShowHandyEdit}>
            <FaSolidExpand size={13} />
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
              <input
                class="editItem--def"
                autocomplete="off"
                name="editItem--syn"
              />
            </form>
            <div class="editInputGroup">
              <textarea
                class="editInputItem editInputItemResult editInputHandy"
                value={JSON.stringify(handyResult(), null, " ")}
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
              name="word"
              autocomplete="off"
              value={props.item?.word}
            />
            <img
              src="/images/main/input-right-corner.png"
              class="myInputRightOrnament"
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="audio"
              autocomplete="off"
              value={props.item?.audio}
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="phonetics"
              autocomplete="off"
              value={definitionData.phonetics}
            />
          </div>
          <div class="editInputGroup">
            <textarea
              name="definitions"
              class="editInputItem editInputItemResult"
              value={JSON.stringify(definitionData.definitions, null, " ")}
              onChange={(e) =>
                setDefinitionRender({
                  ...definitionDataRender(),
                  definitions: JSON.parse(e.currentTarget.value),
                })
              }
            />
          </div>
          <div class="editInputGroup">
            <input
              class="editInputItem"
              name="meaning"
              autocomplete="off"
              value={translationString()}
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

        <Show when={definitionDataRender().word}>
          <Definition item={definitionDataRender()} onCheck={handleCheck} />
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
