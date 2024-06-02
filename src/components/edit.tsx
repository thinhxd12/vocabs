import { Component, Show, createEffect, createSignal, on } from "solid-js";
import { OcX2 } from "solid-icons/oc";
import {
  VocabularyDefinitionType,
  VocabularyTranslationType,
  VocabularyType,
} from "~/types";
import { action, useSubmission } from "@solidjs/router";
import { editVocabularyItem, getTextDataWebster } from "~/lib/api";
import toast, { Toaster } from "solid-toast";
import { createStore } from "solid-js/store";
import useClickOutside from "solid-click-outside";
import { FaRegularImage, FaSolidExpand } from "solid-icons/fa";
import buttons from "../assets/styles/buttons.module.scss";
import forms from "../assets/styles/form.module.scss";
import styles from "./edit.module.scss";
import { mainStore, setMainStore } from "~/lib/mystore";
import { EditDefinition } from "./editDefinition";

const Edit: Component<{}> = (props) => {
  const [showHandyEdit, setShowHandyEdit] = createSignal<boolean>(false);
  const editActionResult = useSubmission(editVocabularyItem);

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

  const handleSubmitForm = () => {
    setSubmittedForm(true);
    setMainStore("renderWord", {
      ...mainStore.editWord,
    });
  };

  //----------------------TOAST----------------------

  //outside click close
  const [target, setTarget] = createSignal<HTMLElement | undefined>();

  useClickOutside(target, () => {
    setMainStore("showEdit", false);
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
      mainStore.editWord!.word.length > 4
        ? mainStore.editWord!.word.slice(0, -2)
        : mainStore.editWord!.word;
    const regText = new RegExp(`(${newText}\\w*)`, "gi");
    x = x.replace(regText, `<b>$1</b>`);
    let defArr = [];
    def1 && defArr.push({ sense: "&emsp;" + def1, similar: def1up });
    def2 && defArr.push({ sense: "&emsp;" + def2, similar: def2up });
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

  //edit
  const [renderEditWord, setRenderEditWord] = createStore<VocabularyType>({
    ...mainStore.editWord!,
  });
  const [translationsString, setTranslationsString] = createSignal<string>("");

  createEffect(async () => {
    const str = makeTranslationText(mainStore.editWord!.translations);
    setTranslationsString(str);
    const { word } = { ...mainStore.editWord };
    const data = await getTextDataWebster(word!);
    if (data)
      setRenderEditWord({
        ...mainStore.editWord,
        definitions: data.definitions,
      });
  });

  const makeTranslationText = (arr: VocabularyTranslationType[]) => {
    return arr
      .map((item) => {
        let part = item.partOfSpeech;
        let mean = item.translations.join("-");
        return " -" + part + "-" + mean;
      })
      .join("");
  };

  const handleCheck = () => {
    setMainStore("editWord", {
      definitions: renderEditWord.definitions,
      phonetics: renderEditWord.phonetics,
    });
  };

  return (
    <div class={styles.edit} tabIndex={1} ref={setTarget}>
      <div class={styles.editHeader}>
        <div class={styles.editHeaderLeft}></div>
        <div class={styles.editHeaderRight}>
          <button
            class={buttons.buttonPrimary}
            onClick={() => setShowHandyEdit(!showHandyEdit())}
          >
            <FaSolidExpand size={13} />
          </button>
          <button
            class={buttons.buttonClose}
            onclick={() => setMainStore("showEdit", false)}
          >
            <OcX2 size={15} />
          </button>
        </div>
      </div>
      <div class={styles.editBody}>
        <Show when={showHandyEdit()}>
          <div class={styles.handyEditContainer}>
            <form class={forms.formBody} action={handleHandyEdit} method="post">
              <input
                class={styles.editItemHeader}
                autocomplete="off"
                name="editItem--header"
              />
              <div class={styles.editItemThumb}>
                <div>
                  <input type="submit" style="display: none;" />
                  <div class={styles.editItemDefs}>
                    <input
                      class={styles.editItemDef}
                      autocomplete="off"
                      name="editItem--def1"
                    />
                    <input
                      class={styles.editItemDef}
                      autocomplete="off"
                      name="editItem--def1up"
                    />
                  </div>
                  <div class={styles.editItemDefs}>
                    <input
                      class={styles.editItemDef}
                      autocomplete="off"
                      name="editItem--def2"
                    />
                    <input
                      class={styles.editItemDef}
                      autocomplete="off"
                      name="editItem--def2up"
                    />
                  </div>
                  <div class={styles.editItemDefs}>
                    <input
                      class={styles.editItemDef}
                      autocomplete="off"
                      name="editItem--def3"
                    />
                    <input
                      class={styles.editItemDef}
                      autocomplete="off"
                      name="editItem--def3up"
                    />
                  </div>
                </div>
                <div class={styles.editItemImg}>
                  <textarea
                    class={styles.editItemTextarea}
                    autocomplete="off"
                    name="editItem--img"
                  />
                  <FaRegularImage
                    class={styles.editItemImgBg}
                    color="#ffffff"
                  />
                </div>
              </div>
              <div class={styles.editItemXs}>
                <img src="/images/main/clover1.png" width={15} height={15} />
                <input
                  class={styles.editItemDef}
                  autocomplete="off"
                  name="editItem--x"
                />
              </div>
              <span class={styles.editItemCredit}>
                <input
                  class={styles.editItemDef}
                  autocomplete="off"
                  name="editItem--author"
                />
                <input
                  class={styles.editItemDef}
                  autocomplete="off"
                  name="editItem--title"
                />
                <input
                  class={styles.editItemDef}
                  autocomplete="off"
                  name="editItem--year"
                />
              </span>
              <input
                class={styles.editItemDef}
                autocomplete="off"
                name="editItem--syn"
              />
            </form>
            <div class={forms.formInputGroup}>
              <textarea
                class={styles.editInputHandy}
                value={JSON.stringify(handyResult(), null, " ")}
              />
            </div>
          </div>
        </Show>

        <form action={editVocabularyItem} method="post" class={forms.formBody}>
          <div class={styles.searchContent}>
            <img
              src="/images/main/input-left-corner.png"
              class={styles.searchLeftOrnament}
            />
            <input
              class={styles.searchInput}
              name="word"
              autocomplete="off"
              value={mainStore.editWord!.word}
            />
            <img
              src="/images/main/input-right-corner.png"
              class={styles.searchRightOrnament}
            />
          </div>

          <div class={forms.formInputGroup}>
            <input
              class={forms.formInput}
              name="audio"
              autocomplete="off"
              value={mainStore.editWord!.audio}
            />
          </div>
          <div class={forms.formInputGroup}>
            <input
              class={forms.formInput}
              name="phonetics"
              autocomplete="off"
              value={mainStore.editWord!.phonetics}
            />
          </div>
          <div class={forms.formInputGroup}>
            <textarea
              name="definitions"
              class={forms.formTextarea}
              value={JSON.stringify(mainStore.editWord!.definitions, null, " ")}
              onChange={(e) =>
                setRenderEditWord({
                  definitions: JSON.parse(e.currentTarget.value),
                })
              }
            />
          </div>
          <div class={forms.formInputGroup}>
            <input
              class={forms.formInput}
              name="meaning"
              autocomplete="off"
              value={translationsString()}
            />
          </div>
          <div class={forms.formInputGroup}>
            <input
              type="number"
              class={forms.formInput}
              name="number"
              autocomplete="off"
              value={mainStore.editWord!.number}
            />
          </div>
          <input
            type="text"
            name="created_at"
            autocomplete="off"
            value={mainStore.editWord!.created_at}
            style={{ display: "none" }}
          />
          <button
            type="submit"
            class={buttons.buttonSubmit}
            onClick={() => handleSubmitForm()}
          >
            Submit
          </button>
        </form>

        <EditDefinition item={renderEditWord} onCheck={handleCheck} />
      </div>
      <Toaster
        position="top-center"
        containerClassName={styles.toastContainer}
        toastOptions={{ className: `${styles.toastContent}` }}
      />
    </div>
  );
};

export default Edit;
