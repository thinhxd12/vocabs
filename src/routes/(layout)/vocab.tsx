import { createAsync, useSubmission } from "@solidjs/router";
import {
  Component,
  createEffect,
  createSignal,
  on,
  onCleanup,
  Show,
} from "solid-js";
import Definition from "~/components/Definition";
import { VocabularyTranslationType, VocabularyType } from "~/types";
import { OcX2 } from "solid-icons/oc";
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
  searchText,
} from "~/lib/server";
import Dialog from "@corvu/dialog";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { getUser } from "~/lib/login";
import { debounce } from "@solid-primitives/scheduled";
import toast, { Toaster } from "solid-toast";
import Collapsible from "~/components/Collapsible";

const Vocab: Component<{}> = (props) => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const totalMemories_data = createAsync(() => getTotalMemories());

  createEffect(() => {
    if (totalMemories_data()) {
      setNavStore("totalMemories", totalMemories_data()!);
    }
  });

  let audioRef: HTMLAudioElement | undefined;
  let audioRef1: HTMLAudioElement | undefined;
  let audioRef2: HTMLAudioElement | undefined;

  const [audioSrc, setAudioSrc] = createSignal<string>(
    "/assets/sounds/mp3_Ding.mp3",
  );

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
      (v) => {
        if (!v) return;
        if (v!.message === "success") {
          toast.success("Successfully saved!", {
            className: "text-4 font-sfpro",
            position: "bottom-right",
          });
          setAudioSrc("/assets/sounds/mp3_Ding.mp3");
          if (audioRef) {
            audioRef.load();
            audioRef.addEventListener("canplaythrough", () => {
              audioRef.play();
            });
          }
          if (renderWordStore()?.word === editWordStore()?.word) {
            setVocabStore("renderWord", editWordStore());
          }
        } else if (v!.message !== "success" && v!.message !== undefined) {
          toast.error(v!.message, {
            position: "bottom-right",
            className: "text-4 font-sfpro",
          });
          setAudioSrc("/assets/sounds/mp3_Boing.mp3");
          if (audioRef) {
            audioRef.load();
            audioRef.addEventListener("canplaythrough", () => {
              audioRef.play();
            });
          }
        }
      },
    ),
  );

  const handleCloseDialogEdit = (open: boolean) => {
    if (!open) layoutStore.layoutMainRef?.focus();
    setVocabStore("showEdit", open);
  };

  /////////////////////translate////////////////////////////
  const [translateWord, setTranslateWord] = createSignal<
    VocabularyType | undefined
  >({
    word: "",
    audio: "",
    phonetics: "",
    number: 240,
    translations: [],
    definitions: [],
    created_at: "",
  });

  const insertActionResult = useSubmission(insertVocabularyItem);

  createEffect(
    on(
      () => insertActionResult.result,
      (v) => {
        if (!v) return;
        if (v!.message === "success") {
          toast.success(
            `"${vocabStore.translateTerm}" has been saved successfully!`,
            {
              className: "text-4 font-sfpro",
              position: "bottom-right",
            },
          );
          setAudioSrc("/assets/sounds/mp3_Ding.mp3");
          if (audioRef) {
            audioRef.load();
            audioRef.addEventListener("canplaythrough", () => {
              audioRef.play();
            });
          }
        } else if (v!.message !== "success" && v!.message !== undefined) {
          toast.error(v!.message, {
            position: "bottom-right",
            className: "text-4 font-sfpro",
          });
          setAudioSrc("/assets/sounds/mp3_Boing.mp3");
          if (audioRef) {
            audioRef.load();
            audioRef.addEventListener("canplaythrough", () => {
              audioRef.play();
            });
          }
        }
      },
    ),
  );

  const handleGetTranslateWord = async (word: string) => {
    const checkMemories = await searchMemoriesText(word);
    if (checkMemories) {
      toast.error(checkMemories.message, {
        position: "bottom-right",
        className: "text-4 font-sfpro",
      });
      setAudioSrc("/assets/sounds/mp3_Boing.mp3");
      if (audioRef) {
        audioRef.load();
        audioRef.addEventListener("canplaythrough", () => {
          audioRef.play();
        });
      }
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
        if (audioRef1) {
          audioRef1.load();
          audioRef1.addEventListener("canplaythrough", () => {
            audioRef1.play();
          });

          audioRef1.addEventListener("ended", () => {
            setAudioSrc2(tranSound);
            if (audioRef2) {
              audioRef2.load();
              audioRef2.addEventListener("canplaythrough", () => {
                audioRef2.play();
              });
            }
          });
        }
      },
    ),
  );

  const triggerMobile = debounce(async (str: string) => {
    const res = await searchText(str);
    if (res) {
      if (res.length === 0) {
        setVocabStore("searchTermColor", false);
        setTimeout(() => {
          setVocabStore("searchTermColor", true);
          setVocabStore("searchTerm", "");
          setVocabStore("searchResults", []);
        }, 1500);
      } else {
        setVocabStore("searchTermColor", true);
        setVocabStore("searchResults", res);
      }
    }
  }, 450);

  onCleanup(() => {
    setVocabStore("searchTerm", "");
    setVocabStore("searchTermColor", true);
    setVocabStore("searchResults", []);
    setVocabStore("renderWord", undefined);
  });

  return (
    <MetaProvider>
      <Title>{vocabStore.renderWord?.word || "vocab"}</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <main class="relative h-full w-full">
        <audio ref={audioRef} hidden src={audioSrc()} />
        <audio ref={audioRef1} hidden src={audioSrc1()} />
        <audio ref={audioRef2} hidden src={audioSrc2()} />
        <div class="relative h-11 w-full border-b border-[#343434] bg-[url('/images/input-wall.webp')] bg-cover pt-[7px]">
          <p
            class={`absolute left-0 top-0 hidden w-full truncate text-center font-constantine text-7 font-700 uppercase leading-10.5 sm:block ${vocabStore.searchTermColor ? "text-white" : "text-black"}`}
            style={{
              "text-shadow": "0 2px 2px rgba(0, 0, 0, 0.9)",
            }}
          >
            {vocabStore.searchTerm || renderWordStore()?.word}
          </p>
          <input
            class={`back absolute left-0 top-0 block w-full truncate bg-transparent text-center font-constantine text-7 font-700 uppercase leading-10.5 outline-none sm:hidden ${vocabStore.searchTermColor ? "text-white" : "text-black"}`}
            type="text"
            autocomplete="off"
            value={vocabStore.searchTerm || renderWordStore()?.word}
            onFocus={(e) => {
              setVocabStore("searchTerm", "");
              e.currentTarget.value = "";
            }}
            onBlur={() => {
              setVocabStore("searchTerm", "");
              setVocabStore("searchTermColor", true);
            }}
            onInput={(e) => {
              setVocabStore(
                "searchTerm",
                (e.target as HTMLInputElement).value.toLowerCase(),
              );
              if (vocabStore.searchTerm.length > 2) {
                triggerMobile(vocabStore.searchTerm);
              }
            }}
            onKeyDown={(e) => {
              e.preventDefault();
            }}
          />
          <p class="absolute bottom-0 left-0 w-full truncate text-center font-opensans text-3 font-600 leading-2 text-white/50">
            {renderWordStore()?.phonetics}
          </p>
        </div>
        <div class="no-scrollbar relative z-50 h-[calc(100vh-72px)] w-full overflow-y-scroll bg-black">
          <Show when={renderWordStore()}>
            <Show when={renderWordStore()}>
              <FlipNumber value={renderWordStore()!.number} />
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
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50vw-180px)]"} top-0 z-50 h-[calc(100vh-36px)] min-w-[360px] max-w-[360px] bg-black/60`}
            />
            <div
              class={`no-scrollbar fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50vw-180px)]"} top-0 z-50 flex h-[calc(100vh-36px)] min-w-[360px] max-w-[360px] flex-col items-center justify-center bg-black`}
            >
              <Dialog.Content class="no-scrollbar z-50 h-full w-[360px] overflow-y-scroll outline-none">
                <div class="flex h-8 w-full justify-end border-b border-gray-500 bg-gray-200">
                  <Dialog.Close class="btn-close">
                    <OcX2 size={15} />
                  </Dialog.Close>
                </div>

                <form
                  class="w-full bg-[#fffeff] p-1"
                  action={insertVocabularyItem}
                  method="post"
                  on:keydown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                >
                  <input
                    class="h-9 w-full border-0 bg-black text-center font-constantine text-6 font-700 uppercase leading-9 text-white outline-none"
                    name="word"
                    autocomplete="off"
                    value={vocabStore.translateTerm}
                    onKeyDown={(e) => {
                      if (e.keyCode === 13 || e.key === "Enter") {
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

                  <Collapsible>
                    <textarea
                      class="w-full border-0 font-basier text-4 font-400 leading-5 text-black outline-none"
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
              class={`fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50vw-180px)]"} top-0 z-50 h-[calc(100vh-36px)] min-w-[360px] max-w-[360px] bg-black/60`}
            />
            <div
              class={`no-scrollbar fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50vw-180px)]"} top-0 z-50 flex h-[calc(100vh-36px)] min-w-[360px] max-w-[360px] flex-col items-center justify-center bg-black`}
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

                  <Collapsible>
                    <textarea
                      class="w-full border-0 font-basier text-4 font-400 leading-5 text-black outline-none"
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

        <Toaster />
      </main>
    </MetaProvider>
  );
};

export default Vocab;
