import { RouteSectionProps, useLocation } from "@solidjs/router";
import {
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import { ImageType, VocabularySearchType } from "~/types";
import "../styles/layout.css";
import LayoutImageLoader from "~/components/LayoutImageLoader";
import { ImBooks } from "solid-icons/im";
import { TbRefresh } from "solid-icons/tb";
import Bookmark from "~/components/Bookmark";
import Nav from "~/components/Nav";
import ImageLoader from "~/components/ImageLoader";
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
  getDataImage,
  getUnsplashImage,
  getWordData,
  handleCheckAndRender,
  searchText,
} from "~/lib/server";
import { format } from "date-fns";
import { debounce } from "@solid-primitives/scheduled";
import { OcX2 } from "solid-icons/oc";
import Dialog from "@corvu/dialog";
import toast, { Toaster } from "solid-toast";
import { BiRegularSkipPrevious } from "solid-icons/bi";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      handleKeyDown: null;
    }
  }
}

export default function Layout(props: RouteSectionProps) {
  let audioRef: HTMLAudioElement | undefined;
  let checkTimeout: NodeJS.Timeout;
  let deleteSearchTimeout: NodeJS.Timeout;

  const [audioSrc, setAudioSrc] = createSignal<string>();

  onMount(() => {
    if (audioRef) audioRef.volume = 0.1;
  });

  const defaultLayoutImageData: ImageType = {
    image: "https://hoctuvung3.vercel.app/images/main-image.webp",
    date: "01 July 2023",
    title: "The Red Buoy, Saint-Tropez",
    attr: "Oil on canvas • 81 × 65 cm",
    authorImg: "https://hoctuvung3.vercel.app/images/main-author.webp",
    authorName: "Paul Signac",
    authorYear: "1895",
    content:
      "\x3Cp>Hello July!\x3C/p>\x3Cp>Time for an artist who in my opinion, created one of the best images of Summer ... the French Pointillist, Paul Signac!\x3C/p>\x3Cp>Signac was a painter and an avid sailor. He created several marine paintings, including a series of views over the port of Saint-Tropez, where he settled in 1892.\x3C/p>\x3Cp>In this vertical painting, the eye initially fixes on the vibrant red-orange buoy, which contrasts with the water's deep blue. The reflections of the buildings then lead the viewer's eye to the background, with lighter tones. The divisionist technique and the combination of pure colors allowed Signac to depict a glittering sea, and the glimmering light of the Midi.\x3C/p>\x3Cp>The Pointillist painters differ from the Impressionists, most notably in the scientific dimension of their work. Regarding the rigor of his initial work, Signac's strokes have widened for this series; the division of tones is more relaxed.\x3C/p>",
    nextImageUrl:
      "https://www.getdailyart.com/en/24707/mykola-pymonenko/the-idyll",
  };

  onCleanup(() => {
    clearTimeout(checkTimeout);
    clearTimeout(deleteSearchTimeout);
  });

  const [layoutImageDataPrevious, setLayoutImageDataPrevious] =
    createSignal<ImageType>(defaultLayoutImageData);

  const [layoutImageData, setLayoutImageData] = createSignal<ImageType>(
    defaultLayoutImageData,
  );

  const handleGetImage = async () => {
    if (layoutImageData().nextImageUrl) {
      const result = await getDataImage(layoutImageData().nextImageUrl!);
      if (result) {
        setLayoutImageDataPrevious(layoutImageData());
        setLayoutImageData(result);
      } else handleGetUnsplashImage();
    } else handleGetUnsplashImage();
  };

  const handleGetPreviousImage = () => {
    const previousData = layoutImageDataPrevious();
    const currentData = layoutImageData();
    setLayoutImageData(previousData);
    setLayoutImageDataPrevious(currentData);
  };

  const handleGetUnsplashImage = async () => {
    const data = await getUnsplashImage();
    if (data)
      setLayoutImageData({
        image: data[0].urls.regular,
        date: format(new Date(data[0].created_at), "PP"),
        title: data[0].description || data[0].alt_description,
        attr: data[0].exif.name,
        authorImg: data[0].user.profile_image.medium,
        authorName: data[0].user.name,
        authorYear: "",
      });
  };

  const [showBookmark, setShowBookmark] = createSignal<boolean>(false);
  const handleShowBookmark = () => setShowBookmark(!showBookmark());

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
        setVocabStore("searchResults", res);
        checkTimeout = setTimeout(() => {
          handleSelectSearchResult(0);
        }, 1500);
      } else {
        setVocabStore("searchResults", res);
      }
    }
  }, 450);

  const handleKeyDownMain = (e: KeyboardEvent) => {
    if (location.pathname === "/vocab") {
      clearTimeout(checkTimeout);
      let value = vocabStore.searchTerm;
      if (e.key === "Backspace") {
        value = value.slice(0, -1);
        trigger(value.toLowerCase());
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
      } else if (e.key.length === 1) {
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
    setVocabStore("searchResults", []);
  };

  const handleSelectSearchResult = (index: number) => {
    setActive(null);
    handleCheckAndRender(vocabStore.searchResults[index]);
    setTimeout(() => {
      setActive(index);
    }, 200);
    setTimeout(() => {
      setActive(null);
    }, 400);
    setTimeout(() => {
      handleCloseDialogSearch();
    }, 600);
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
    setVocabStore("searchResults", []);
    setVocabStore("showEdit", true);
  };

  const handleSelectWordFromSearch = async (index: number) => {
    handleCheckAndRender(vocabStore.searchResults[index]);
    setActive(null);
    setVocabStore("searchTerm", "");
    setVocabStore("searchResults", []);
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
    setVocabStore("searchResults", []);
  };

  return (
    <main
      class="flex h-screen w-screen justify-center overflow-hidden bg-black"
      tabIndex={1}
      on:keydown={handleKeyDownMain}
      ref={(el) => setLayoutStore("layoutMainRef", el)}
    >
      <audio ref={audioRef} hidden src={audioSrc()} />
      <Show when={layoutStore.showLayout}>
        <div class="hidden sm:flex sm:h-full sm:flex-grow">
          <div class="relative h-full w-[calc(100vw-660px)]">
            <Show
              when={showBookmark()}
              fallback={<LayoutImageLoader src={layoutImageData().image} />}
            >
              <Bookmark />
            </Show>

            <div class="absolute bottom-0.5 right-0.5 z-50 flex">
              <Show when={!showBookmark()}>
                <button class="btn-layout" onClick={handleGetPreviousImage}>
                  <BiRegularSkipPrevious size={21} />
                </button>
                <button class="btn-layout" onClick={handleGetImage}>
                  <TbRefresh size={18} />
                </button>
              </Show>
              <button class="btn-layout" onClick={handleShowBookmark}>
                <ImBooks size={18} />
              </button>
            </div>
          </div>
          <div class="pb5 flex h-full min-w-[300px] max-w-[300px] flex-col bg-[#19191c] p-3">
            <p class="font-basier text-4 font-600 leading-5 text-[#989da7]">
              {layoutImageData().date}
            </p>
            <h3 class="font-roslindale text-8 font-600 leading-10 text-white">
              {layoutImageData().title}
            </h3>
            <p class="mb-1 font-basier text-4 font-400 leading-5 text-[#989da7]">
              {layoutImageData().attr}
            </p>
            <div class="mb-4 flex justify-start">
              <ImageLoader
                src={layoutImageData().authorImg}
                width={45}
                height={45}
                className="rounded object-cover drop-shadow"
              />
              <div class="ml-2 font-basier text-4 font-400 leading-4 text-white">
                <p class="rounded-md bg-[#343434] px-2 py-1">
                  {layoutImageData().authorName}
                </p>
                <p class="m-1">{layoutImageData().authorYear}</p>
              </div>
            </div>
            <Show when={layoutImageData().content}>
              <div
                class="imageTextContent flex-grow overflow-auto py-3 font-basier text-4 font-400 leading-5.5 text-[#989da7]"
                innerHTML={layoutImageData().content}
              />
            </Show>
          </div>
        </div>
      </Show>

      <div
        class="h-full min-w-[360px] max-w-[360px]"
        style={{
          "box-shadow": ".5px 0 #363636,-.5px 0 #363636",
        }}
      >
        <Suspense>
          <div class="relative z-40 h-[calc(100vh-36px)] w-full">
            {props.children}

            {/* search  */}
            <Suspense>
              <Show when={vocabStore.searchResults.length > 0}>
                <div class="absolute top-11 z-50 flex h-[calc(100vh-72px)] w-full flex-col bg-black pt-2">
                  <For each={vocabStore.searchResults}>
                    {(item, index) => (
                      <div
                        aria-selected={active() === index()}
                        onMouseOver={() => handleMouseOver(index())}
                        onMouseOut={handleMouseOut}
                        class="my-2 flex h-9.5 w-[360px] cursor-pointer justify-between bg-[#343434]"
                      >
                        <button
                          class="relative z-50 h-full w-9.5 pl-2 font-basier text-3.5 font-400 leading-9.5 text-[#f7f7f7] hover:text-white"
                          onClick={() => handleEditFromSearch(item)}
                        >
                          {index() + 1}
                        </button>
                        <div
                          class={`${active() === index() ? "scale-[2.7]" : ""} relative z-30 grow text-center font-constantine text-7 font-700 leading-9.5 text-white transition duration-100`}
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
                          onClick={() =>
                            handleOpenDialogDelete(item.created_at)
                          }
                        >
                          <BsTrash3 size={13} color="white" />
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </Suspense>
          </div>
        </Suspense>
        <Nav />
      </div>

      <Dialog open={openDeleteAlert()} onOpenChange={setOpenDeleteAlert}>
        <Dialog.Portal>
          <Dialog.Overlay
            class={`fixed ${layoutStore.showLayout ? "inset-[36px_0_auto_auto]" : "inset-0 left-[calc(50vw-180px)]"} top-11 z-50 h-[calc(100vh-72px)] min-w-[360px] max-w-[360px] bg-black/60`}
          />
          <div
            class={`fixed ${layoutStore.showLayout ? "inset-[36px_0_auto_auto]" : "inset-0 left-[calc(50vw-180px)]"} top-11 z-50 flex h-[calc(100vh-72px)] min-w-[360px] max-w-[360px] items-center justify-center bg-black`}
          >
            <Dialog.Content
              class={`no-scrollbar z-50 w-[210px] overflow-hidden overflow-y-scroll rounded-sm bg-gray-50 outline-none`}
            >
              <div class="flex h-8 w-full justify-between border-b border-gray-500 bg-gray-200">
                <Dialog.Label class="ml-1 font-rubik text-4.5 font-400 leading-8">
                  Delete this word?
                </Dialog.Label>
                <Dialog.Close class="btn-close">
                  <OcX2 size={15} />
                </Dialog.Close>
              </div>
              <div class="flex w-full items-center justify-center p-1">
                <button
                  class="mx-3 flex h-8 w-[45px] items-center justify-center rounded-[3px] bg-[#070707] font-basier text-4 font-500 leading-8 text-[#ececec] shadow transition hover:bg-black hover:text-[#de0000]"
                  onClick={confirmDelete}
                >
                  Yes
                </button>
                <button
                  class="mx-3 flex h-8 w-[45px] items-center justify-center rounded-[3px] bg-[#070707] font-basier text-4 font-500 leading-8 text-[#ececec] shadow transition hover:bg-black hover:text-[#de0000]"
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
