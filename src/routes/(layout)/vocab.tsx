import { createAsync, useSubmission } from "@solidjs/router";
import { Component, createEffect, createSignal, on, Show } from "solid-js";
import Definition from "~/components/Definition";
import { VocabularyTranslationType, VocabularyType } from "~/types";
import { OcX2 } from "solid-icons/oc";
import { Collapsible } from "@kobalte/core/collapsible";
import { FiChevronDown } from "solid-icons/fi";
import { BiSolidSave } from "solid-icons/bi";
import {
  layoutStore,
  setNavStore,
  setVocabStore,
  vocabStore,
} from "~/lib/store";
import FlipNumber from "~/components/FlipNumber";
import {
  editVocabularyItem,
  getTextDataWebster,
  getTotalMemories,
  getTranslationArr,
  insertVocabularyItem,
  searchMemoriesText,
} from "~/lib/server";
import { toast } from "~/components/Toast";
import { Toast } from "@kobalte/core/toast";
import Dialog from "@corvu/dialog";
import { Portal } from "solid-js/web";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { getUser } from "~/lib/login";

const Vocab: Component<{}> = (props) => {
  // ***************check login**************
  // const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const totalMemories_data = createAsync(() => getTotalMemories());

  createEffect(() => {
    if (totalMemories_data()) {
      setNavStore("totalMemories", totalMemories_data()!);
    }
  });

  let audioRef1: HTMLAudioElement | undefined;
  let audioRef2: HTMLAudioElement | undefined;

  const [audioSrc1, setAudioSrc1] = createSignal<string>(
    "/assets/sounds/mp3_Ding.mp3",
  );
  const [audioSrc2, setAudioSrc2] = createSignal<string>(
    "/assets/sounds/mp3_Ding.mp3",
  );

  /////////////////////edit////////////////////////////

  const [editWordGet, setEditWordGet] = createSignal<
    VocabularyType | undefined
  >();

  const makeTranslationText = (arr: VocabularyTranslationType[]) => {
    return arr
      .map((item) => {
        let part = item.partOfSpeech;
        let mean = item.translations.join("-");
        return " -" + part + "-" + mean;
      })
      .join("");
  };

  const renderWordStore = () => vocabStore.renderWord;
  const editWordStore = () => vocabStore.editWord;

  const handleEditFromDefinition = async () => {
    setVocabStore("editWord", {
      ...renderWordStore(),
      number: renderWordStore()!.number - 1,
    });
    setVocabStore("showEdit", true);
  };

  const getEditWordDefinition = async () => {
    if (vocabStore.editWord!.word !== editWordGet()?.word) {
      const data = await getTextDataWebster(vocabStore.editWord!.word);
      if (data) setEditWordGet(data);
    }
  };

  const handleCheckEdit = () => {
    setVocabStore("editWord", {
      ...editWordStore(),
      definitions: editWordGet()?.definitions!,
      phonetics: editWordGet()?.phonetics!,
    });
  };

  const editActionResult = useSubmission(editVocabularyItem);

  createEffect(
    on(
      () => editActionResult.result,
      () => {
        if (editActionResult.result?.message === "success") {
          toast.success("Edit Successful");
          setAudioSrc1("/assets/sounds/mp3_Ding.mp3");
          audioRef1?.load();
          audioRef1?.addEventListener("canplaythrough", () => {
            audioRef1?.play();
          });
        } else if (
          editActionResult.result?.message !== "success" &&
          editActionResult.result?.message !== undefined
        ) {
          toast.error(editActionResult.result?.message!);
          setAudioSrc1("/assets/sounds/mp3_Boing.mp3");
          audioRef1?.load();
          audioRef1?.addEventListener("canplaythrough", () => {
            audioRef1?.play();
          });
        }
      },
    ),
  );

  const handleSubmitForm = (e: any) => {
    e.preventDefault();
    if (renderWordStore()?.word === editWordStore()?.word) {
      setVocabStore("renderWord", editWordStore());
    }
  };

  const handleCloseDialogEdit = (open: boolean) => {
    if (!open) layoutStore.layoutMainRef?.focus();
    setVocabStore("showEdit", open);
  };

  /////////////////////translate////////////////////////////

  const [translateWord, setTranslateWord] = createSignal<
    VocabularyType | undefined
  >();

  const insertActionResult = useSubmission(insertVocabularyItem);

  createEffect(
    on(
      () => insertActionResult.result,
      () => {
        if (insertActionResult.result?.message === "success") {
          toast.success("New word has been saved successfully.");
          setAudioSrc1("/assets/sounds/mp3_Ding.mp3");
          audioRef1?.load();
          audioRef1?.addEventListener("canplaythrough", () => {
            audioRef1?.play();
          });
        } else if (
          insertActionResult.result?.message !== "success" &&
          insertActionResult.result?.message !== undefined
        ) {
          toast.error(insertActionResult.result?.message!);
          setAudioSrc1("/assets/sounds/mp3_Boing.mp3");
          audioRef1?.load();
          audioRef1?.addEventListener("canplaythrough", () => {
            audioRef1?.play();
          });
        }
      },
    ),
  );

  const handleGetTranslateWord = async (word: string) => {
    const checkMemories = await searchMemoriesText(word);
    if (checkMemories) {
      toast.error(checkMemories.message);
      setAudioSrc1("/assets/sounds/mp3_Boing.mp3");
      audioRef1?.load();
      audioRef1?.addEventListener("canplaythrough", () => {
        audioRef1?.play();
      });
      return;
    }
    const data = await getTextDataWebster(word);
    if (data) {
      setTranslateWord({
        ...translateWord()!,
        definitions: data!.definitions,
        phonetics: data!.phonetics,
        audio: data!.audio,
        translations: [],
      });
    }
  };

  createEffect(
    on(
      () => vocabStore.renderWord?.audio,
      (v) => {
        const translations = vocabStore.renderWord?.translations
          .map((item) => item.translations.join(", "))
          .join(", ");
        const tranSound = `https://vocabs3.vercel.app/speech?text=${translations}`;

        setAudioSrc1(v as string);
        audioRef1?.load();
        audioRef1?.addEventListener("canplaythrough", () => {
          audioRef1?.play();
        });

        audioRef1?.addEventListener("ended", () => {
          setAudioSrc2(tranSound);
          audioRef2?.load();
          audioRef2?.addEventListener("canplaythrough", () => {
            audioRef2?.play();
          });
        });
      },
    ),
  );

  return (
    <MetaProvider>
      <Title>{vocabStore.renderWord?.word || "vocab"}</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <main class="relative h-full w-full">
        <audio ref={audioRef1} hidden src={audioSrc1()} />
        <audio ref={audioRef2} hidden src={audioSrc2()} />
        <div class="relative h-11 w-full border-b border-[#343434] bg-[url('/images/input-wall.webp')] bg-cover pt-[7px]">
          <p
            class={`absolute left-0 top-0 w-full truncate px-[72px] text-center font-constantine text-7 font-700 uppercase leading-10.5 ${vocabStore.searchTermColor ? "text-white" : "text-black"}`}
            style={{
              "text-shadow": "0 2px 2px rgba(0, 0, 0, 0.9)",
            }}
          >
            {vocabStore.searchTerm || renderWordStore()?.word}
          </p>
          <p class="absolute bottom-0 left-0 w-full truncate px-[72px] text-center font-opensans text-3 font-600 leading-2 text-white/50">
            {renderWordStore()?.phonetics}
          </p>
        </div>
        <div class="no-scrollbar relative z-50 h-[calc(100vh-72px)] w-full overflow-y-scroll bg-black">
          <Show when={renderWordStore()}>
            <Show when={renderWordStore()}>
              <FlipNumber value={renderWordStore()?.number!} />
            </Show>

            <Definition
              item={renderWordStore()!}
              onEdit={handleEditFromDefinition}
            />
          </Show>
        </div>

        {/* translate  */}
        <Dialog
          open={vocabStore.showTranslate}
          onOpenChange={(open) => setVocabStore("showTranslate", open)}
        >
          <Dialog.Portal>
            <Dialog.Overlay
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50%-180px)]"} top-0 z-50 h-[calc(100vh-36px)] w-[360px] bg-black/60`}
            />

            <div
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50%-180px)]"} top-0 z-50 flex h-[calc(100vh-36px)] w-[360px] items-center justify-center bg-black`}
            >
              <Dialog.Content class="no-scrollbar z-50 h-full w-full overflow-y-scroll outline-none">
                <div class="flex h-8 w-full justify-end border-b border-gray-500 bg-gray-200">
                  <Dialog.Close class="btn-close">
                    <OcX2 size={15} />
                  </Dialog.Close>
                </div>

                <form
                  class="w-full bg-[#fffeff] p-1"
                  action={insertVocabularyItem}
                  method="post"
                >
                  <input
                    class="h-9 w-full border-0 bg-black text-center font-constantine text-6 font-700 uppercase leading-9 text-white outline-none"
                    name="word"
                    autocomplete="off"
                    value={vocabStore.translateTerm}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleGetTranslateWord(e.currentTarget.value);
                      }
                    }}
                    onChange={async (e) => {
                      setTranslateWord({
                        ...translateWord()!,
                        word: e.currentTarget.value,
                      });
                    }}
                  />

                  <input
                    class="mb-1 w-full border-0 border-b border-[#343434] p-1 font-basier text-4 font-400 leading-5 text-black outline-none"
                    name="audio"
                    autocomplete="off"
                    value={translateWord()?.audio}
                    onChange={(e) => {
                      setTranslateWord({
                        ...translateWord()!,
                        audio: e.currentTarget.value,
                      });
                    }}
                  />

                  <input
                    class="mb-1 w-full border-0 border-b border-[#343434] p-1 font-sfpro text-4 font-400 leading-5 text-black outline-none"
                    name="phonetics"
                    autocomplete="off"
                    value={translateWord()?.phonetics}
                    onChange={(e) => {
                      setTranslateWord({
                        ...translateWord()!,
                        phonetics: e.currentTarget.value,
                      });
                    }}
                  />

                  <input
                    hidden
                    name="definitions"
                    autocomplete="off"
                    value={JSON.stringify(translateWord()?.definitions)}
                  />

                  <Collapsible class="border-b border-[#343434]">
                    <div class="flex h-[22px] w-full justify-end">
                      <Show when={translateWord()?.definitions.length}>
                        <Collapsible.Trigger class="collapsible__trigger">
                          <FiChevronDown
                            size={15}
                            class="collapsible__trigger-icon"
                          />
                        </Collapsible.Trigger>
                      </Show>
                    </div>
                    <Collapsible.Content>
                      <textarea
                        class="mb-1 h-fit w-full border-0 p-1 font-basier text-4 font-400 leading-5 text-black outline-none"
                        name="definitions"
                        autocomplete="off"
                        rows="12"
                        value={JSON.stringify(
                          translateWord()?.definitions,
                          null,
                          " ",
                        )}
                        onChange={(e) => {
                          setTranslateWord({
                            ...translateWord()!,
                            definitions: JSON.parse(e.currentTarget.value),
                          });
                        }}
                      />
                    </Collapsible.Content>
                  </Collapsible>

                  <input
                    class="mb-1 w-full border-0 border-b border-[#343434] p-1 font-sfpro text-4 font-400 leading-5 text-black outline-none"
                    name="meaning"
                    autocomplete="off"
                    onChange={(e) => {
                      setTranslateWord({
                        ...translateWord()!,
                        translations: getTranslationArr(e.currentTarget.value),
                      });
                    }}
                  />

                  <button class="btn-submit" type="submit">
                    <BiSolidSave size={15} />
                  </button>
                </form>

                <Show when={translateWord()}>
                  <Definition item={translateWord()!} />
                </Show>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        </Dialog>

        {/* edit  */}
        <Dialog
          open={vocabStore.showEdit}
          onOpenChange={(open) => handleCloseDialogEdit(open)}
          onInitialFocus={getEditWordDefinition}
        >
          <Dialog.Portal>
            <Dialog.Overlay
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50%-180px)]"} top-0 z-50 h-[calc(100vh-36px)] w-[360px] bg-black/60`}
            />

            <div
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50%-180px)]"} top-0 z-50 flex h-[calc(100vh-36px)] w-[360px] items-center justify-center bg-black`}
            >
              <Dialog.Content class="no-scrollbar z-50 h-full w-full overflow-y-scroll outline-none">
                <div class="flex h-8 w-full justify-end border-b border-gray-500 bg-gray-200">
                  <Dialog.Close class="btn-close">
                    <OcX2 size={15} />
                  </Dialog.Close>
                </div>

                <form
                  class="w-full bg-[#fffeff] p-1"
                  action={editVocabularyItem}
                  method="post"
                  onSubmit={(e) => handleSubmitForm(e)}
                >
                  <input
                    hidden
                    name="created_at"
                    autocomplete="off"
                    value={editWordStore()?.created_at}
                  />
                  <input
                    class="h-9 w-full border-0 bg-black text-center font-constantine text-6 font-700 uppercase leading-9 text-white outline-none"
                    name="word"
                    autocomplete="off"
                    value={editWordStore()?.word}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const data = await getTextDataWebster(
                          e.currentTarget.value,
                        );
                        if (data) {
                          setEditWordGet({
                            ...editWordStore()!,
                            definitions: data!.definitions,
                          });
                          setVocabStore("editWord", {
                            ...editWordStore()!,
                            definitions: data!.definitions,
                            phonetics: data!.phonetics,
                            audio: data!.audio,
                          });
                        }
                      }
                    }}
                    onChange={async (e) => {
                      setVocabStore("editWord", {
                        ...editWordStore()!,
                        word: e.currentTarget.value,
                      });
                    }}
                  />

                  <input
                    class="mb-1 w-full border-0 border-b border-[#343434] p-1 font-basier text-4 font-400 leading-5 text-black outline-none"
                    name="audio"
                    autocomplete="off"
                    value={editWordStore()?.audio}
                    onChange={(e) => {
                      setVocabStore("editWord", {
                        ...editWordStore()!,
                        audio: e.currentTarget.value,
                      });
                    }}
                  />

                  <input
                    class="mb-1 w-full border-0 border-b border-[#343434] p-1 font-sfpro text-4 font-400 leading-5 text-black outline-none"
                    name="phonetics"
                    autocomplete="off"
                    value={editWordStore()?.phonetics}
                    onChange={(e) => {
                      setVocabStore("editWord", {
                        ...editWordStore()!,
                        phonetics: e.currentTarget.value,
                      });
                    }}
                  />

                  <input
                    hidden
                    name="definitions"
                    autocomplete="off"
                    value={JSON.stringify(editWordStore()?.definitions)}
                  />

                  <Collapsible class="border-b border-[#343434]">
                    <div class="flex h-[22px] w-full justify-end">
                      <Collapsible.Trigger class="collapsible__trigger">
                        <FiChevronDown
                          size={15}
                          class="collapsible__trigger-icon"
                        />
                      </Collapsible.Trigger>
                    </div>
                    <Collapsible.Content>
                      <textarea
                        class="mb-1 h-fit w-full border-0 p-1 font-basier text-4 font-400 leading-5 text-black outline-none"
                        name="definitionsCollapsible"
                        autocomplete="off"
                        rows="12"
                        value={JSON.stringify(
                          editWordStore()?.definitions,
                          null,
                          " ",
                        )}
                        onChange={(e) => {
                          setVocabStore("editWord", {
                            ...editWordStore()!,
                            definitions: JSON.parse(e.currentTarget.value),
                          });
                          setEditWordGet({
                            ...editWordStore()!,
                            definitions: JSON.parse(e.currentTarget.value),
                          });
                        }}
                      />
                    </Collapsible.Content>
                  </Collapsible>

                  <input
                    class="mb-1 w-full border-0 border-b border-[#343434] p-1 font-sfpro text-4 font-400 leading-5 text-black outline-none"
                    name="meaning"
                    autocomplete="off"
                    value={makeTranslationText(editWordStore()?.translations!)}
                    onChange={(e) => {
                      setVocabStore("editWord", {
                        ...editWordStore()!,
                        translations: getTranslationArr(e.currentTarget.value),
                      });
                    }}
                  />

                  <input
                    class="mb-1 w-full border-0 border-b border-[#343434] p-1 font-basier text-4 font-400 leading-5 text-black outline-none"
                    name="number"
                    type="number"
                    max={240}
                    min={1}
                    autocomplete="off"
                    value={editWordStore()?.number}
                    onChange={(e) => {
                      setVocabStore("editWord", {
                        ...editWordStore()!,
                        number: Number(e.currentTarget.value),
                      });
                    }}
                  />

                  <button class="btn-submit" type="submit">
                    <BiSolidSave size={15} />
                  </button>
                </form>

                <Show when={editWordGet()}>
                  <Definition item={editWordGet()!} onCheck={handleCheckEdit} />
                </Show>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        </Dialog>

        <Portal>
          <Toast.Region duration={3000}>
            <Toast.List class="toast__list" />
          </Toast.Region>
        </Portal>
      </main>
    </MetaProvider>
  );
};

export default Vocab;
