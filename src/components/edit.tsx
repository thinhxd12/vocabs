import {
  Component,
  Show,
  createEffect,
  createSignal,
  on,
} from "solid-js";
import { OcX2 } from "solid-icons/oc";
import {
  VocabularyDefinitionType,
  VocabularyTranslationType,
  VocabularyType,
} from "~/types";
import { action, useSubmission } from "@solidjs/router";
import {
  editVocabularyItem,
  getTextDataWebster,
  getTranslationArr,
} from "~/lib/api";
import toast, { Toaster } from "solid-toast";
import { FaRegularImage, FaSolidExpand } from "solid-icons/fa";
import buttons from "../assets/styles/buttons.module.scss";
import forms from "../assets/styles/form.module.scss";
import styles from "./edit.module.scss";
import toasts from "../assets/styles/toast.module.scss";
import { mainStore, setMainStore } from "~/lib/mystore";
import { clickOutside, stopKeydown } from "~/utils";
import Definition from "./definition";
import { BiSolidSave } from "solid-icons/bi";

const Edit: Component<{
  word: VocabularyType;
}> = (props) => {
  const [showHandyEdit, setShowHandyEdit] = createSignal<boolean>(false);
  const editActionResult = useSubmission(editVocabularyItem);

  //----------------------TOAST----------------------
  const [submittedForm, setSubmittedForm] = createSignal<boolean>(false);
  const popSuccess = (msg: string) =>
    toast.success(
      <div class={toasts.toastItemSuccess}>
        <h3>Success!</h3>
        <p>{msg}</p>
      </div>,
      {
        style: { "margin-top": "24px", padding: "8px 12px 8px 15px" },
        duration: 1000,
      }
    );

  const popError = (msg: string) =>
    toast.error(
      <div class={toasts.toastItemError}>
        <h3>Error!</h3>
        <p>{msg}</p>
      </div>,
      {
        style: { "margin-top": "24px", padding: "8px 12px 8px 15px" },
        duration: 3000,
      }
    );

  createEffect(
    on(
      () => editActionResult.result,
      () => {
        if (submittedForm()) {

          if (editActionResult.result?.message === "success") {
            popSuccess("Edit Successful.");
            setMainStore("audioSrc", "/sounds/mp3_Ding.mp3");
            mainStore.audioRef && mainStore.audioRef.play();
            if (mainStore.audioRef) {
              mainStore.audioRef.volume = 0.3;
              mainStore.audioRef.play();
            }
          } else if (
            editActionResult.result?.message !== "success" &&
            editActionResult.result?.message !== undefined
          ) {
            popError(editActionResult.result?.message!);
            setMainStore("audioSrc", "/sounds/mp3_Boing.mp3");
            mainStore.audioRef && mainStore.audioRef.play();
            if (mainStore.audioRef) {
              mainStore.audioRef.volume = 0.3;
              mainStore.audioRef.play();
            }
          }
        }
      }
    )
  );

  //----------------------TOAST----------------------

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
      props.word.word.length > 4
        ? props.word.word.slice(0, -2)
        : props.word.word;
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
  const [resultEditWord, setResultEditWord] = createSignal<VocabularyType>(
    props.word
  );
  const [renderEditWord, setRenderEditWord] = createSignal<VocabularyType>(
    props.word
  );
  const [translationsString, setTranslationsString] = createSignal<string>("");

  createEffect(async () => {
    const str = makeTranslationText(props.word?.translations);
    setTranslationsString(str);
    const data = await getTextDataWebster(props.word?.word);
    if (data)
      setRenderEditWord({
        ...props.word,
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
    setResultEditWord({
      ...props.word,
      definitions: renderEditWord().definitions,
      phonetics: renderEditWord().phonetics,
    });
  };

  const handleSubmitForm = () => {
    setSubmittedForm(true);
    if (mainStore.renderWord?.word === resultEditWord().word)
      setMainStore("renderWord", {
        ...resultEditWord(),
        number: resultEditWord().number + 1,
      });
  };

  const close = () => {
    setMainStore("showEdit", false);
  };

  return (
    <div
      class={styles.edit}
      tabIndex={3}
      use:clickOutside={close}
      use:stopKeydown={null}
    >
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
                <img src="images/main/laurel.webp" width={15} height={15} />
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
              src="images/main/input-left-corner.webp"
              class={styles.searchLeftOrnament}
            />
            <input
              class={styles.searchInput}
              name="word"
              autocomplete="off"
              value={resultEditWord()?.word}
              onChange={(e) => {
                setResultEditWord({
                  ...resultEditWord(),
                  word: e.currentTarget.value,
                });
              }}
            />
            <img
              src="images/main/input-right-corner.webp"
              class={styles.searchRightOrnament}
            />
          </div>

          <div class={forms.formInputGroup}>
            <input
              class={forms.formInput}
              name="audio"
              autocomplete="off"
              value={resultEditWord()?.audio}
              onChange={(e) => {
                setResultEditWord({
                  ...resultEditWord(),
                  audio: e.currentTarget.value,
                });
              }}
            />
          </div>
          <div class={forms.formInputGroup}>
            <input
              class={forms.formInput}
              name="phonetics"
              autocomplete="off"
              value={resultEditWord()?.phonetics}
              onChange={(e) => {
                setResultEditWord({
                  ...resultEditWord(),
                  phonetics: e.currentTarget.value,
                });
              }}
            />
          </div>
          <div class={forms.formInputGroup}>
            <textarea
              name="definitions"
              class={forms.formTextarea}
              value={JSON.stringify(resultEditWord()?.definitions, null, " ")}
              onChange={(e) => {
                setRenderEditWord({
                  ...resultEditWord(),
                  definitions: JSON.parse(e.currentTarget.value),
                });
                setResultEditWord({
                  ...resultEditWord(),
                  definitions: JSON.parse(e.currentTarget.value),
                });
              }}
            />
          </div>
          <div class={forms.formInputGroup}>
            <input
              class={forms.formInput}
              name="meaning"
              autocomplete="off"
              value={translationsString()}
              onChange={(e) => {
                setResultEditWord({
                  ...resultEditWord(),
                  translations: getTranslationArr(e.currentTarget.value),
                });
              }}
            />
          </div>
          <div class={forms.formInputGroup}>
            <input
              type="number"
              class={forms.formInput}
              name="number"
              autocomplete="off"
              value={resultEditWord()?.number}
              onChange={(e) => {
                setResultEditWord({
                  ...resultEditWord(),
                  number: Number(e.currentTarget.value),
                });
              }}
            />
          </div>
          <input
            type="text"
            name="created_at"
            autocomplete="off"
            value={resultEditWord()?.created_at}
            style={{ display: "none" }}
          />
          <button
            type="submit"
            class={buttons.buttonSubmit}
            onClick={() => handleSubmitForm()}
          >
            <BiSolidSave size={15} />
            <span>Save</span>
          </button>
        </form>

        <Show when={renderEditWord()}>
          <Definition item={renderEditWord()!} onCheck={handleCheck} />
        </Show>
      </div>
      <Toaster
        position="top-center"
        containerClassName={toasts.toastContainer}
      />
    </div>
  );
};

export default Edit;
