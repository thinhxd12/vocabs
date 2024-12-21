import { createAsync, RouteSectionProps, useLocation } from "@solidjs/router";
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
import { getUser } from "~/lib/login";
import { VsSymbolColor } from "solid-icons/vs";
import { FiBookOpen } from "solid-icons/fi";
const Art = lazy(() => import("~/components/Art"));
const Bookmark = lazy(() => import("~/components/Bookmark"));
import Nav from "~/components/Nav";

export default function Layout(props: RouteSectionProps) {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  let audioRef: HTMLAudioElement | undefined;
  let checkTimeout: NodeJS.Timeout;
  let deleteSearchTimeout: NodeJS.Timeout;

  const [audioSrc, setAudioSrc] = createSignal<string>();
  const [imageData, setImageData] = createSignal<LoginImageType | undefined>();
  const [showLayoutImageInfo, setShowLayoutImageInfo] =
    createSignal<boolean>(false);

  onMount(async () => {
    if (audioRef) audioRef.volume = 0.1;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    setLayoutStore("isMobile", isMobile);
    const data = await getSpotlightImage_v4();
    setImageData(data);
  });

  onCleanup(() => {
    clearTimeout(checkTimeout);
    clearTimeout(deleteSearchTimeout);
  });

  const [showBookmark, setShowBookmark] = createSignal<boolean>(false);
  const location = useLocation();

  const [showSearchResults, setShowSearchResults] =
    createSignal<boolean>(false);

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
        setVocabStore("searchResults", res);
        setShowSearchResults(true);
        checkTimeout = setTimeout(() => {
          handleSelectSearchResult(0);
        }, 1500);
      } else {
        setVocabStore("searchResults", res);
        setShowSearchResults(true);
      }
    }
  }, 450);

  const handleKeyDownMain = (e: KeyboardEvent) => {
    if (location.pathname === "/vocab") {
      let value = vocabStore.searchTerm;
      if (e.key === "Backspace") {
        checkTimeout && clearTimeout(checkTimeout);
        deleteSearchTimeout && clearTimeout(deleteSearchTimeout);
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
        checkTimeout && clearTimeout(checkTimeout);
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
    setShowSearchResults(false);
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
    const data = await getWordData(word.created_at);
    if (!data) return;
    setActive(null);
    setVocabStore("editWord", data);
    setVocabStore("searchTerm", "");
    setShowSearchResults(false);
    setVocabStore("showEdit", true);
  };

  const handleSelectWordFromSearch = async (index: number) => {
    handleCheckAndRender(vocabStore.searchResults[index]);
    setActive(null);
    setVocabStore("searchTerm", "");
    setShowSearchResults(false);
  };

  const [openDeleteAlert, setOpenDeleteAlert] = createSignal<boolean>(false);
  const [deleteId, setDeleteId] = createSignal<string>("");

  const handleOpenDialogDelete = (id: string) => {
    setDeleteId(id);
    setOpenDeleteAlert(true);
  };

  const confirmDelete = async () => {
    const res = await deleteVocabulary(deleteId());
    if (res.message === "success") {
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
      toast.error(res.message, {
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
    setShowSearchResults(false);
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
          class="absolute z-0 h-screen w-screen object-cover brightness-90"
        />

        <Show
          when={showLayoutImageInfo()}
          fallback={
            <p
              onMouseOver={() => setShowLayoutImageInfo(!showLayoutImageInfo())}
              class="absolute left-0 top-0 z-40 hidden w-1/4 cursor-pointer pl-2 pt-1 text-4 leading-7 text-white sm:block"
            >
              {imageData()?.hs1_title}
            </p>
          }
        >
          <p
            onMouseLeave={() => setShowLayoutImageInfo(!showLayoutImageInfo())}
            class="absolute left-0 top-0 z-40 hidden w-1/4 cursor-pointer pl-2 pt-1 text-4 leading-7 text-white sm:block"
          >
            {imageData()?.hs2_title}
          </p>
        </Show>
        <Show when={!layoutStore.showLayout}>
          <p class="absolute bottom-0 right-0 hidden w-1/4 truncate pb-1 pr-1 text-right text-4 leading-6 text-white sm:block">
            {imageData()?.title}
          </p>
        </Show>
      </Show>
      <div class="absolute left-0 top-0 z-30 flex h-full w-full justify-center overflow-hidden">
        <Show when={layoutStore.showLayout}>
          <div class="relative h-full w-[calc(100vw-360px)] px-[80px] pb-[90px] pt-[50px]">
            <Show when={showBookmark()} fallback={<Art />}>
              <Bookmark />
            </Show>

            <div class="absolute bottom-0 right-3 top-0 flex items-center">
              <div class="dark-layout mx-auto flex flex-col items-center justify-center rounded-full p-1 text-white">
                <button
                  onClick={() => setShowBookmark(false)}
                  class="mb-2 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15"
                >
                  <VsSymbolColor size={15} />
                </button>
                <button
                  onClick={() => setShowBookmark(true)}
                  class="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15"
                >
                  <FiBookOpen size={15} />
                </button>
              </div>
            </div>
          </div>
        </Show>
        <div class="relative h-full min-w-[360px] max-w-[360px]">
          <Show when={showSearchResults()}>
            <div class="absolute top-[40px] z-50 h-[calc(100vh-81px)] w-full py-2">
              <div class="dark-layout no-scrollbar flex h-full flex-col overflow-y-scroll rounded-2 pt-2">
                <For each={vocabStore.searchResults}>
                  {(item, index) => (
                    <div
                      aria-selected={active() === index()}
                      onMouseOver={() => handleMouseOver(index())}
                      onMouseOut={handleMouseOut}
                      class="my-2 flex h-9.5 w-[360px] cursor-pointer justify-between bg-black/50"
                    >
                      <button
                        class="relative z-50 h-full w-9.5 pl-2 text-3.5 font-400 leading-9.5 text-secondary-white hover:text-white"
                        onClick={() => handleEditFromSearch(item)}
                      >
                        {index() + 1}
                      </button>
                      <div
                        class={`${active() === index() ? "scale-[2.1]" : ""} relative z-30 grow text-center font-constantine text-8 font-700 leading-9 text-white transition duration-100`}
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
                        onClick={() => handleOpenDialogDelete(item.created_at)}
                      >
                        <BsTrash3 size={13} color="white" />
                      </div>
                    </div>
                  )}
                </For>
              </div>
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
          <div
            class={`no-scrollbar fixed ${layoutStore.showLayout ? "inset-[0_0_auto_auto]" : "inset-0 left-[calc(50vw-180px)]"} light-layout top-0 z-50 flex h-[calc(100vh-40px)] min-w-[360px] max-w-[360px] flex-col items-center justify-center rounded-2`}
          >
            <Dialog.Content
              class={`no-scrollbar z-50 w-[210px] overflow-hidden overflow-y-scroll rounded-2 outline-none`}
            >
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
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog>

      <Toaster />
    </main>
  );
}
