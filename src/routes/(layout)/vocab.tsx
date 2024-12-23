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
import {
  VocabularyDefinitionType,
  VocabularyTranslationType,
  VocabularyType,
} from "~/types";
import { OcSearch2 } from "solid-icons/oc";
import { BiRegularBandAid, BiSolidSave } from "solid-icons/bi";
import {
  layoutStore,
  setNavStore,
  setVocabStore,
  vocabStore,
} from "~/lib/store";
import {
  editVocabularyItem,
  getTextDataWebster,
  getTotalMemories,
  getTranslateData,
  getTranslationArr,
  getWordData,
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
import FlipCard from "~/components/FlipCard";

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

  const handleGetEditWord = async (word: string) => {
    const data = await getTextDataWebster(word);
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
  };

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
    const data = await getWordData(renderWordStore()!.created_at);
    if (!data) return;
    setVocabStore("editWord", data);
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

  const handleFixDefinition = () => {
    const definition = JSON.parse(
      JSON.stringify(editWordStore()?.definitions),
    ) as VocabularyDefinitionType[];
    if (definition) {
      const definitionFixed = JSON.stringify(definition).replace("&emsp;", "");
      const definitionFixedFull = definition.map((item, index) => {
        const getDefinition = editWordGet()?.definitions.find(
          (m) => m.partOfSpeech === item.partOfSpeech,
        )?.definitions;

        const fixDefinitions = item.definitions.map((d, i) => {
          return {
            ...d,
            definition: getDefinition
              ? getDefinition[i].definition
              : d.definition,
          };
        });

        return {
          ...item,
          definitions: fixDefinitions,
        };
      });
      setVocabStore("editWord", {
        ...editWordStore()!,
        definitions: definitionFixedFull
          ? definitionFixedFull
          : JSON.parse(definitionFixed),
      });
    }
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
    const data = await Promise.all([
      getTextDataWebster(word),
      getTranslateData(word),
    ]);
    if (data[0]) {
      setTranslateWord({
        ...translateWord()!,
        definitions: data[0].definitions,
        phonetics: data[0].phonetics,
        audio: data[0].audio,
        translations: [
          {
            partOfSpeech: "noun",
            translations: [data[1]?.translation || ""],
          },
        ],
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
      <audio ref={audioRef} hidden src={audioSrc()} />
      <audio ref={audioRef1} hidden src={audioSrc1()} />
      <audio ref={audioRef2} hidden src={audioSrc2()} />
      <main class="h-main w-main relative flex flex-wrap">
        <div class="my-2 ml-2">
          <Show
            when={renderWordStore()}
            fallback={<div class="light-layout h-11 w-[82px] rounded-2"></div>}
          >
            <FlipCard number={renderWordStore()!.number} />
          </Show>
        </div>

        <div class="relative m-2 grow">
          <Show
            when={layoutStore.isMobile}
            fallback={
              <div
                class={`light-layout h-11 w-full truncate rounded-2 pt-1 text-center align-baseline font-constantine text-7 font-700 uppercase leading-10 ${vocabStore.searchTermColor ? "text-white" : "text-black"}`}
              >
                {vocabStore.searchTerm || renderWordStore()?.word}
                <small class="pl-1 pt-3 text-center align-baseline font-opensans text-3 font-600 leading-4 text-secondary-white">
                  {renderWordStore()?.phonetics}
                </small>
              </div>
            }
          >
            <input
              class={`back light-layout absolute left-0 top-0 block h-11 w-full truncate rounded-2 bg-transparent text-center font-constantine text-7 font-700 uppercase leading-10.5 outline-none sm:block ${vocabStore.searchTermColor ? "text-white" : "text-black"}`}
              type="text"
              autocomplete="off"
              name="mobileInputSearch"
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
            <p class="absolute bottom-0 left-0 w-full truncate text-center font-opensans text-3 font-600 leading-3 text-white/50">
              {renderWordStore()?.phonetics}
            </p>
          </Show>
        </div>

        <div class="no-scrollbar h-[calc(100vh-96px)] w-full overflow-y-scroll">
          <Show when={renderWordStore()}>
            <Definition
              item={renderWordStore()!}
              onEdit={handleEditFromDefinition}
            />
          </Show>
        </div>

        <Dialog
          open={vocabStore.showTranslate}
          onOpenChange={(open) => setVocabStore("showTranslate", open)}
        >
          <Dialog.Portal>
            <Dialog.Content
              class={`no-scrollbar light-layout w-content fixed p-2 ${layoutStore.showLayout ? "right-0 -translate-x-2" : "left-1/2 -translate-x-1/2"} top-[42px] z-50 h-[calc(100vh-96px)] overflow-y-scroll rounded-2 p-2 outline-none`}
            >
              <form
                class="mb-2 w-full p-1"
                action={insertVocabularyItem}
                method="post"
              >
                <div class="relative mx-auto h-9 w-3/4 overflow-hidden rounded-full bg-black/15 shadow-[0_0_3px_0px_#00000054_inset]">
                  <span
                    class="absolute right-0.1 top-0.1 z-30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition hover:bg-white/10"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGetTranslateWord(vocabStore.translateTerm);
                    }}
                  >
                    <OcSearch2 size={15} />
                  </span>
                  <input
                    name="word"
                    autocomplete="off"
                    value={vocabStore.translateTerm}
                    on:keydown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleGetTranslateWord(e.currentTarget.value);
                      }
                    }}
                    onInput={(e) => {
                      setTranslateWord({
                        ...translateWord()!,
                        word: e.currentTarget.value,
                      });
                      setVocabStore("translateTerm", e.currentTarget.value);
                    }}
                    class="absolute left-0 top-0 h-full w-full rounded-3 bg-transparent px-3 text-center font-constantine text-6 font-700 uppercase leading-9 text-white outline-none"
                  />
                </div>

                <input
                  class="mb-1 w-full border-0 border-b border-white/30 bg-transparent p-1 pl-2 text-4 font-400 leading-5 text-white outline-none"
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
                  class="mb-1 w-full border-0 border-b border-white/30 bg-transparent p-1 pl-2 text-4 font-400 leading-5 text-white outline-none"
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
                    class="w-full border-0 bg-transparent p-1 text-4 font-400 leading-5 text-white outline-none"
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
                  class="mb-1 w-full border-0 border-b border-white/30 bg-transparent p-1 text-4 font-400 leading-5 text-white outline-none"
                  name="meaning"
                  autocomplete="off"
                  value={makeTranslationText(translateWord()?.translations!)}
                  onChange={(e) => {
                    e.preventDefault();
                    setTranslateWord({
                      ...translateWord()!,
                      translations: getTranslationArr(e.currentTarget.value),
                    });
                  }}
                />

                <button class="btn-submit ml-2 mt-2" type="submit">
                  <BiSolidSave size={15} />
                </button>
              </form>

              <Show when={translateWord()}>
                <div class="[&>div]:w-full">
                  <Definition item={translateWord()!} />
                </div>
              </Show>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>

        {/* edit  */}
        <Dialog
          open={vocabStore.showEdit}
          onOpenChange={(open) => handleCloseDialogEdit(open)}
          onInitialFocus={getEditWordDefinition}
        >
          <Dialog.Portal>
            <Dialog.Content
              class={`no-scrollbar light-layout w-content fixed p-2 ${layoutStore.showLayout ? "right-0 -translate-x-2" : "left-1/2 -translate-x-1/2"} top-[42px] z-50 h-[calc(100vh-96px)] overflow-y-scroll rounded-2 p-2 outline-none`}
            >
              <form
                class="mb-2 w-full p-1"
                action={editVocabularyItem}
                method="post"
              >
                <input
                  hidden
                  name="created_at"
                  autocomplete="off"
                  value={editWordStore()?.created_at}
                />

                <div class="relative mx-auto h-9 w-3/4 overflow-hidden rounded-full bg-black/15 shadow-[0_0_3px_0px_#00000054_inset]">
                  <span
                    class="absolute right-0.1 top-0.1 z-30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition hover:bg-white/10"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGetEditWord(vocabStore.editWord!.word);
                    }}
                  >
                    <OcSearch2 size={15} />
                  </span>
                  <input
                    name="word"
                    autocomplete="off"
                    value={editWordStore()?.word}
                    on:keydown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleGetEditWord(e.currentTarget.value);
                      }
                    }}
                    onInput={(e) => {
                      setVocabStore("editWord", {
                        ...editWordStore()!,
                        word: e.currentTarget.value,
                      });
                    }}
                    class="absolute left-0 top-0 h-full w-full rounded-3 bg-transparent px-3 text-center font-constantine text-6 font-700 uppercase leading-9 text-white outline-none"
                  />
                </div>

                <input
                  class="mb-1 w-full border-0 border-b border-white/30 bg-transparent p-1 pl-2 text-4 font-400 leading-5 text-white outline-none"
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
                  class="mb-1 w-full border-0 border-b border-white/30 bg-transparent p-1 pl-2 text-4 font-400 leading-5 text-white outline-none"
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
                    class="w-full border-0 bg-transparent p-1 text-4 font-400 leading-5 text-white outline-none"
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
                  class="mb-1 w-full border-0 border-b border-white/30 bg-transparent p-1 text-4 font-400 leading-5 text-white outline-none"
                  name="meaning"
                  autocomplete="off"
                  value={makeTranslationText(editWordStore()?.translations!)}
                  onChange={(e) => {
                    e.preventDefault();
                    setVocabStore("editWord", {
                      ...editWordStore()!,
                      translations: getTranslationArr(e.currentTarget.value),
                    });
                  }}
                />

                <input
                  class="mb-1 w-full border-0 border-b border-white/30 bg-transparent p-1 pl-2 text-4 font-400 leading-5 text-white outline-none"
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

                <div class="flex w-full">
                  <button class="btn-submit ml-2 mt-2" type="submit">
                    <BiSolidSave size={15} />
                  </button>

                  <button
                    class="btn-submit ml-2 mt-2"
                    onClick={(e) => {
                      e.preventDefault();
                      handleFixDefinition();
                    }}
                  >
                    <BiRegularBandAid size={15} />
                  </button>
                </div>
              </form>

              <Show when={editWordGet()}>
                <div class="[&>div]:w-full">
                  <Definition item={editWordGet()!} onCheck={handleCheckEdit} />
                </div>
              </Show>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>

        <Toaster />
      </main>
    </MetaProvider>
  );
};

export default Vocab;
