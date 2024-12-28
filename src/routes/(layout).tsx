import { RouteSectionProps, useLocation } from "@solidjs/router";
import { createSignal, For, lazy, onCleanup, onMount, Show } from "solid-js";
import { LoginImageType, VocabularySearchType } from "~/types";
import {
  layoutStore,
  setLayoutStore,
  setVocabStore,
  vocabStore,
} from "~/lib/store";
import { BsTrash3 } from "solid-icons/bs";
import { createList } from "solid-list";
import {
  base64ToUint8Array,
  deleteVocabulary,
  getSpotlightImage_v4,
  getWordData,
  handleCheckAndRender,
  searchText,
} from "~/lib/server";
import { debounce } from "@solid-primitives/scheduled";
import { OcX2 } from "solid-icons/oc";
import Dialog from "@corvu/dialog";
import toast, { Toaster } from "solid-toast";
import { VsTarget } from "solid-icons/vs";
const Art = lazy(() => import("~/components/Art"));
const Bookmark = lazy(() => import("~/components/Bookmark"));
import Nav from "~/components/Nav";
import { thumbHashToDataURL } from "thumbhash";

export default function Layout(props: RouteSectionProps) {
  let audioRef: HTMLAudioElement | undefined;
  let checkTimeout: NodeJS.Timeout;
  let deleteSearchTimeout: NodeJS.Timeout;

  const [audioSrc, setAudioSrc] = createSignal<string>();
  const [imageData, setImageData] = createSignal<LoginImageType | undefined>();
  const [isLoaded, setIsLoaded] = createSignal<boolean>(false);

  const handleLoadImage = () => {
    setIsLoaded(true);
  };

  const handleChangeBackground = async () => {
    const data = await getSpotlightImage_v4();
    setImageData(data);
    setIsLoaded(false);
  };

  onMount(async () => {
    if (audioRef) audioRef.volume = 0.1;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    setLayoutStore("isMobile", isMobile);
    handleChangeBackground();
  });

  onCleanup(() => {
    clearTimeout(checkTimeout);
    clearTimeout(deleteSearchTimeout);
  });

  const location = useLocation();

  const trigger = debounce(async (str: string) => {
    checkTimeout && clearTimeout(checkTimeout);
    const res = await searchText(str);
    if (res) {
      if (res.length === 0) {
        setVocabStore("searchTermColor", false);
        setVocabStore("translateTerm", str);
        deleteSearchTimeout = setTimeout(() => {
          setVocabStore("searchTermColor", true);
          handleCloseDialogSearch();
        }, 1500);
        setAudioSrc("/assets/sounds/mp3_Boing.mp3");
        audioRef?.play();
      } else if (res.length === 1 && str.length > 4) {
        setVocabStore("searchTermColor", true);
        setVocabStore("searchResults", res);
        setLayoutStore("showSearchResults", true);
        checkTimeout = setTimeout(() => {
          handleSelectSearchResult(0);
        }, 1500);
      } else {
        setVocabStore("searchResults", res);
        setVocabStore("searchTermColor", true);
        setLayoutStore("showSearchResults", true);
      }
    }
  }, 450);

  const handleKeyDownMain = (e: KeyboardEvent) => {
    if (location.pathname === "/vocab") {
      checkTimeout && clearTimeout(checkTimeout);
      deleteSearchTimeout && clearTimeout(deleteSearchTimeout);
      let value = vocabStore.searchTerm;
      trigger.clear();
      if (e.key === "Backspace") {
        value = value.slice(0, -1);
        if (value.length > 2) trigger(value.toLowerCase());
        setVocabStore("searchTerm", value);
        return;
      } else if (e.key.match(/^[1-9]$/)) {
        if (
          vocabStore.searchResults.length > 0 &&
          Number(e.key) <= vocabStore.searchResults.length
        ) {
          handleSelectSearchResult(Number(e.key) - 1);
        }
        return;
      } else if (e.key === " ") {
        value = "";
        setVocabStore("searchTerm", value);
        handleCloseDialogSearch();
        return;
      } else if (e.key.match(/^[a-zA-Z\-]$/)) {
        value += e.key;
        if (value.length > 2) {
          trigger(value.toLowerCase());
        }
        setVocabStore("searchTerm", value);
        return;
      } else if (e.key === "Enter") {
        if (active() !== null) {
          handleCheckAndRender(vocabStore.searchResults[active()!]);
          handleCloseDialogSearch();
        } else if (vocabStore.searchResults.length === 0) {
          setVocabStore("showTranslate", true);
        }
        return;
      }
      onKeyDown(e);
    }
  };

  const handleCloseDialogSearch = () => {
    setActive(null);
    setVocabStore("searchTerm", "");
    setLayoutStore("showSearchResults", false);
  };

  const handleSelectSearchResult = (index: number) => {
    handleCheckAndRender(vocabStore.searchResults[index]);
    handleCloseDialogSearch();
  };

  const { active, setActive, onKeyDown } = createList({
    items: () => vocabStore.searchResults.map((result, index) => index),
    initialActive: null,
  });

  const handleMouseOver = (index: number) => {
    clearTimeout(checkTimeout);
    setActive(index);
  };

  const handleMouseOut = () => {
    clearTimeout(checkTimeout);
    setActive(null);
  };

  const handleEditFromSearch = async (word: VocabularySearchType) => {
    const data = await getWordData(word.id);
    if (!data) return;
    setActive(null);
    setVocabStore("editWord", data);
    setVocabStore("searchTerm", "");
    setLayoutStore("showSearchResults", false);
    setVocabStore("showEdit", true);
  };

  const handleSelectWordFromSearch = async (index: number) => {
    handleCheckAndRender(vocabStore.searchResults[index]);
    setActive(null);
    setVocabStore("searchTerm", "");
    setLayoutStore("showSearchResults", false);
  };

  const [openDeleteAlert, setOpenDeleteAlert] = createSignal<boolean>(false);
  const [deleteId, setDeleteId] = createSignal<string>("");

  const handleOpenDialogDelete = (id: string) => {
    setDeleteId(id);
    setOpenDeleteAlert(true);
  };

  const confirmDelete = async () => {
    const res = await deleteVocabulary(deleteId());
    if (res.status) {
      toast.success("Successfully deleted!", {
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
    } else {
      toast.error(res.data, {
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
    rejectDelete();
  };

  const rejectDelete = () => {
    setOpenDeleteAlert(false);
    setActive(null);
    setVocabStore("searchTerm", "");
    setLayoutStore("showSearchResults", false);
  };

  return (
    <main
      class="relative h-screen w-screen overflow-hidden outline-none"
      tabIndex={1}
      on:keydown={handleKeyDownMain}
      ref={(el) => setLayoutStore("layoutMainRef", el)}
    >
      <audio ref={audioRef} hidden src={audioSrc()} />

      <Show when={imageData()}>
        <img
          src={
            layoutStore.isMobile ? imageData()!.image_P : imageData()!.image_L
          }
          onLoad={handleLoadImage}
          style={{
            opacity: isLoaded() ? 1 : 0,
          }}
          class="absolute z-10 h-screen w-screen object-cover brightness-90"
        />

        <Show when={!isLoaded()}>
          <img
            src={thumbHashToDataURL(base64ToUint8Array(imageData()!.hash))}
            style={{
              opacity: isLoaded() ? 0 : 1,
            }}
            class="absolute z-0 h-screen w-screen object-cover brightness-90"
          />
        </Show>
        <Show when={!layoutStore.showLayout}>
          <div class="group absolute left-0 top-0 z-50 hidden w-1/4 sm:block">
            <p
              style="text-shadow: 0 0 3px black;"
              class="absolute left-0 top-0 z-40 cursor-pointer pl-2 pt-1 text-4 leading-7 text-white opacity-100 transition group-hover:opacity-0"
            >
              {imageData()?.hs1_title}
            </p>
            <p
              style="text-shadow: 0 0 3px black;"
              class="absolute left-0 top-0 z-40 cursor-pointer pl-2 pt-1 text-4 leading-7 text-white opacity-0 transition group-hover:opacity-100"
            >
              {imageData()?.hs2_title}
            </p>
          </div>

          <p class="absolute bottom-0 left-0 hidden w-1/4 truncate pb-1 pl-2 pr-1 text-4 leading-7 text-white sm:block">
            {imageData()?.title}
          </p>

          <button
            onClick={handleChangeBackground}
            class="absolute bottom-[215px] left-[calc(50vw+163px)] z-50 flex h-7 w-7 items-center justify-center text-white opacity-30 outline-none hover:opacity-100 sm:bottom-0 sm:left-[calc(100vw-21px)]"
          >
            <VsTarget size={15} />
          </button>
        </Show>
      </Show>

      <div class="absolute left-0 top-0 z-30 flex h-screen w-screen justify-center overflow-hidden">
        <Show when={layoutStore.showLayout}>
          <div class="relative h-full w-[calc(100vw-402px)] px-[80px] pb-[90px] pt-[50px]">
            <Show when={layoutStore.showBookmark} fallback={<Art />}>
              <Bookmark />
            </Show>
          </div>
        </Show>
        <div class="w-main relative h-full">
          <Show when={layoutStore.showSearchResults}>
            <div
              class={`no-scrollbar light-layout w-content fixed p-2 ${layoutStore.showLayout ? "right-0 -translate-x-4" : "left-1/2 -translate-x-1/2"} top-12 z-50 max-h-[calc(100vh-96px)] overflow-y-scroll rounded-2 p-2 outline-none`}
            >
              <For each={vocabStore.searchResults}>
                {(item, index) => (
                  <div
                    aria-selected={active() === index()}
                    onMouseOver={() => handleMouseOver(index())}
                    onMouseOut={handleMouseOut}
                    class="my-2 flex h-9.5 w-full cursor-pointer justify-between rounded-2 bg-black/50 shadow-md shadow-black/30"
                  >
                    <button
                      class="relative z-50 h-full w-9.5 pl-2 text-3.5 font-400 leading-9.5 text-secondary-white hover:text-white"
                      onClick={() => handleEditFromSearch(item)}
                    >
                      {index() + 1}
                    </button>
                    <div
                      class={`${active() === index() ? "scale-[2]" : ""} relative z-30 grow text-center font-constantine text-8 font-700 leading-9 text-white transition duration-100`}
                      style={{
                        "text-shadow":
                          active() === index()
                            ? "0 3px 5px black"
                            : "0 2px 3px black",
                      }}
                      onClick={() => handleSelectWordFromSearch(index())}
                    >
                      {item.word}
                    </div>
                    <div
                      class="relative z-50 flex h-full w-9.5 items-center justify-center pr-1"
                      onClick={() => handleOpenDialogDelete(item.id)}
                    >
                      <BsTrash3 size={13} color="white" />
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>

          {props.children}

          <Show when={location.pathname !== "/"}>
            <Nav />
          </Show>
        </div>
      </div>

      <Dialog open={openDeleteAlert()} onOpenChange={setOpenDeleteAlert}>
        <Dialog.Portal>
          <Dialog.Content
            class={`no-scrollbar light-layout w-content fixed flex items-center justify-center p-2 ${layoutStore.showLayout ? "right-0 -translate-x-4" : "left-1/2 -translate-x-1/2"} top-12 z-50 h-[calc(100vh-96px)] overflow-y-scroll rounded-2 p-2 outline-none`}
          >
            <div class="w-2/3 overflow-hidden rounded-2">
              <div class="flex h-8 w-full justify-between border-b border-black/30 bg-black/90">
                <Dialog.Label class="pl-2 text-4 font-400 leading-8 text-white">
                  Delete this word?
                </Dialog.Label>
                <Dialog.Close class="btn-close">
                  <OcX2 size={15} />
                </Dialog.Close>
              </div>
              <div class="flex w-full items-center justify-center bg-white/30 p-2">
                <button
                  class="mx-3 flex h-8 w-[45px] items-center justify-center rounded-[3px] bg-[#070707] text-4 font-500 leading-8 text-white shadow transition hover:bg-black hover:text-[#de0000]"
                  onClick={confirmDelete}
                >
                  Yes
                </button>
                <button
                  class="mx-3 flex h-8 w-[45px] items-center justify-center rounded-[3px] bg-[#070707] text-4 font-500 leading-8 text-white shadow transition hover:bg-black hover:text-[#de0000]"
                  onClick={rejectDelete}
                >
                  No
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <Toaster />
    </main>
  );
}
