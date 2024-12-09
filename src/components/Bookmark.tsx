import {
  Component,
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import {
  FaRegularCopy,
  FaRegularTrashCan,
  FaSolidDiceThree,
  FaSolidFeather,
  FaSolidFileCirclePlus,
} from "solid-icons/fa";
import { AiOutlineInsertRowBelow } from "solid-icons/ai";
import { BsHeartFill } from "solid-icons/bs";
import {
  BiSolidLeftArrow,
  BiSolidRightArrow,
  BiSolidSave,
} from "solid-icons/bi";
import { OcSearch2 } from "solid-icons/oc";
import { OcX2 } from "solid-icons/oc";
import { createList } from "solid-list";
import { BookmarkType } from "~/types";
import {
  checkBookMarkData,
  deleteBookmark,
  findBookMarkData,
  getBookMarkData,
  getBookMarkDataItem,
  getNextBookMarkData,
  getPrevBookMarkData,
  getRandomBookMarkData,
  insertBookmarkData,
  updateBookmarkData,
} from "~/lib/server";
import { createMarker, makeSearchRegex } from "@solid-primitives/marker";
import { Motion } from "solid-motionone";
import Dialog from "@corvu/dialog";

const Bookmark: Component<{}> = (props) => {
  let searchInputRef: HTMLInputElement | undefined;
  let searchResultsRef: HTMLInputElement | undefined;

  const [bookmark, setBookmark] = createSignal<BookmarkType>();
  const [likeReset, setLikeReset] = createSignal<boolean>(true);

  onMount(async () => {
    const data = await getBookMarkData();
    if (data) {
      setBookmark(data);
    }
  });

  const handleGetPrevBookmark = async () => {
    setBookmark({
      ...bookmark()!,
      content: "",
      like: 0,
    });
    setLikeReset(true);
    const data = await getPrevBookMarkData(bookmark()!.created_at);
    if (data) {
      setBookmark(data);
    }
  };

  const handleGetNextBookmark = async () => {
    setBookmark({
      ...bookmark()!,
      content: "",
      like: 0,
    });
    setLikeReset(true);
    const data = await getNextBookMarkData(bookmark()!.created_at);
    if (data) {
      setBookmark(data);
    }
  };

  const handleCheckBookmark = () => {
    if (!likeReset()) {
      setBookmark({ ...bookmark()!, like: bookmark()!.like - 1 });
      checkBookMarkData(bookmark()!.created_at, bookmark()!.like);
      setLikeReset(!likeReset());
    } else {
      setBookmark({ ...bookmark()!, like: bookmark()!.like + 1 });
      checkBookMarkData(bookmark()!.created_at, bookmark()!.like);
      setLikeReset(!likeReset());
      animationRun();
    }
  };

  const copyBookMarkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookmark()?.content || "");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getRandomBookmark = async () => {
    const data = await getRandomBookMarkData();
    if (data) {
      setBookmark(data);
    }
  };

  const [openDialogEdit, setOpenDialogEdit] = createSignal<boolean>(false);
  const [openDialogInsert, setOpenDialogInsert] = createSignal<boolean>(false);
  const [openDialogSearch, setOpenDialogSearch] = createSignal<boolean>(false);
  const [openDeleteAlert, setOpenDeleteAlert] = createSignal<boolean>(false);
  const [searchTerm, setSearchTerm] = createSignal<string>("");
  const [searchResults, setSearchResults] = createSignal<BookmarkType[]>([]);
  const { active, setActive, onKeyDown } = createList({
    items: () => searchResults().map((result, index) => index),
    initialActive: null,
  });

  const regex = createMemo(() => makeSearchRegex(searchTerm()));
  const highlight = createMarker((text) => (
    <mark class="bg-blue-500">{text()}</mark>
  ));

  const searchBookmark = async () => {
    if (searchTerm().length > 2) {
      const data = await findBookMarkData(searchTerm());
      if (data) setSearchResults(data);
      searchInputRef?.focus();
    }
  };

  const handleBookmarkSearchKeyDown = async (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!active()) {
        searchBookmark();
      } else {
        if (searchResults().length) {
          if (bookmark())
            setBookmark({
              ...searchResults()[active()!],
              created_at: bookmark()!.created_at,
            });
          setSearchTerm("");
          setSearchResults([]);
          setOpenDialogSearch(false);
        }
      }
      return;
    } else if (active()) {
      searchResultsRef?.focus();
    }
    onKeyDown(e);
  };

  const handleSelectSearch = async (item: BookmarkType) => {
    setSearchTerm("");
    setSearchResults([]);
    setOpenDialogSearch(false);
    const data = await getBookMarkDataItem(item.created_at);
    if (data) setBookmark({ ...data, created_at: bookmark()?.created_at });
  };

  const handleCloseDialogSearch = (open: boolean) => {
    if (!open) {
      setSearchTerm("");
      setSearchResults([]);
    }
    setOpenDialogSearch(open);
  };

  const [hearts, setHearts] = createSignal<number[]>([]);

  const animationRun = () => {
    setHearts(Array.from({ length: 36 }, (_, i) => i));
    setTimeout(() => setHearts([]), 3000);
  };

  const handleDeleteBookmark = () => {
    deleteBookmark(bookmark()!.created_at);
    handleGetNextBookmark();
  };

  return (
    <div class="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#dcd8d1] px-11 py-8">
      <Show when={hearts().length}>
        <div class="w-[calc(100vw-732px) absolute inset-0 left-11 z-50 h-full">
          <For each={hearts()}>
            {(item) => (
              <Motion.span
                class="absolute text-5.5"
                animate={{
                  left: [`${Math.random() * 99}%`, `${Math.random() * 99}%`],
                  bottom: ["-30px", "120%"],
                  transform: `scale(${Math.random() + 1})`,
                  opacity: [1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 1,
                }}
              >
                <BsHeartFill
                  size={21}
                  color="#fd2c55"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(0, 0, 0, 0.3))",
                  }}
                />
              </Motion.span>
            )}
          </For>
        </div>
      </Show>
      <div
        class={`${bookmark()?.like ? "bookmarkContainerCheck" : "bookmarkContainer"} no-scrollbar`}
      >
        <div class="bookmarkContent no-scrollbar">
          <p class="px-2 pt-4 text-center font-garamond text-11 font-600 uppercase leading-11 text-[#111111]">
            {bookmark()?.bookTile}
          </p>
          <img
            src="/images/bookmark-onarment-1.webp"
            width={120}
            class="mx-auto mb-8 mt-2"
          />
          <p class="bookmarkTextContent pl-7 pr-3 font-garamond text-6.5 font-400 leading-10 text-black">
            <Show
              when={bookmark()?.content}
              fallback={
                <img
                  src="/assets/svg/loader.svg"
                  width={40}
                  height={10}
                  class="mx-auto"
                />
              }
            >
              {bookmark()?.content}
            </Show>
          </p>
          <img
            src="/images/bookmark-onarment-2.webp"
            width={100}
            class="mb-1 ml-auto mt-2 pr-8"
          />
          <p class="mb-1 pr-9 text-right font-garamond text-5 font-700 leading-5 text-[#111111]">
            {bookmark()?.authors}
          </p>
          <p class="px-3 pb-7 text-right font-garamond text-5 font-700 leading-5 text-[#111111]">
            {bookmark()?.dateOfCreation}
          </p>
        </div>
      </div>

      <div class="absolute bottom-8.5 left-0 z-50 flex w-full justify-between px-11">
        <button
          class="flex h-6 w-9 items-end justify-start opacity-0 transition hover:opacity-100"
          onClick={handleGetPrevBookmark}
        >
          <BiSolidLeftArrow size={18} color="#111111" />
        </button>
        <button
          class="flex h-6 w-9 items-end justify-end opacity-0 hover:opacity-100"
          onClick={handleGetNextBookmark}
        >
          <BiSolidRightArrow size={18} color="#111111" />
        </button>
      </div>

      <div class="absolute right-0 top-0 flex h-full w-11 flex-col items-center justify-center">
        <button
          class="mb-1 drop-shadow-md transition active:scale-90"
          onClick={handleCheckBookmark}
        >
          <BsHeartFill
            size={22}
            class={
              bookmark()?.like
                ? likeReset()
                  ? "text-[#f08399]"
                  : "text-[#fd2c55]"
                : "text-white"
            }
          />
        </button>
        <span
          class={`mb-2 font-basier text-4 font-600 leading-4 ${bookmark()?.like ? (likeReset() ? "text-[#f08399]" : "text-[#fd2c55]") : "text-white"}`}
        >
          {bookmark()?.like}
        </span>

        <button
          class="mb-3 transform drop-shadow-md transition active:scale-90"
          onClick={copyBookMarkToClipboard}
        >
          <FaRegularCopy size={18} color="#ffffff" />
        </button>

        <button
          class="mb-3 drop-shadow-md transition active:scale-90"
          onClick={getRandomBookmark}
        >
          <FaSolidDiceThree size={18} color="#ffffff" />
        </button>

        <button
          class="mb-3 drop-shadow-md transition active:scale-90"
          onClick={() => setOpenDialogEdit(true)}
        >
          <FaSolidFeather size={18} color="#ffffff" />
        </button>

        <button
          class="mb-3 drop-shadow-md transition active:scale-90"
          onClick={() => setOpenDialogInsert(true)}
        >
          <FaSolidFileCirclePlus size={18} color="#ffffff" />
        </button>

        <button
          class="mb-3 drop-shadow-md transition active:scale-90"
          onClick={() => setOpenDialogSearch(true)}
        >
          <OcSearch2 size={18} color="#ffffff" />
        </button>

        <button
          class="mb-3 drop-shadow-md transition active:scale-90"
          onClick={() => setOpenDeleteAlert(true)}
        >
          <FaRegularTrashCan size={18} color="#ffffff" />
        </button>
      </div>

      <Dialog open={openDialogEdit()} onOpenChange={setOpenDialogEdit}>
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 left-0 z-50 h-full w-[calc(100vw-660px)] bg-black/60" />
          <div class="fixed inset-0 left-0 z-50 flex h-full w-[calc(100vw-660px)] items-center justify-center">
            <Dialog.Content class="no-scrollbar z-50 w-[calc(100%-72px)] overflow-hidden rounded-sm">
              <div class="flex h-8 w-full justify-between border-b border-gray-500 bg-gray-200">
                <Dialog.Label class="ml-1 font-garamond text-5.5 font-700 leading-8">
                  Edit bookmark
                </Dialog.Label>
                <Dialog.Close class="btn-close">
                  <OcX2 size={15} />
                </Dialog.Close>
              </div>

              <form
                method="post"
                action={updateBookmarkData}
                class="flex h-[calc(100vh-72px)] w-full flex-col overflow-hidden"
                onSubmit={() => setOpenDialogEdit(false)}
              >
                <input
                  hidden
                  name="id"
                  autocomplete="off"
                  value={bookmark()?.created_at}
                />
                <textarea
                  class="mb-0 min-h-[calc(100vh-100px)] w-full flex-grow p-2 pl-3 indent-3 font-garamond text-6 font-400 leading-7 text-black outline-none"
                  autocomplete="off"
                  name="bookmarks"
                  value={bookmark()?.content}
                  onChange={(e) => {
                    e.stopPropagation();
                    setBookmark({
                      ...bookmark()!,
                      content: e.currentTarget.value,
                    });
                  }}
                />

                <button
                  class="flex h-9 w-full items-center justify-center rounded-[3px] bg-[#070707] text-[#ececec] shadow transition hover:bg-black hover:text-white"
                  type="submit"
                >
                  <BiSolidSave size={15} />
                </button>
              </form>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog>

      <Dialog open={openDialogInsert()} onOpenChange={setOpenDialogInsert}>
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 left-0 z-50 h-full w-[calc(100vw-660px)] bg-black/60" />
          <div class="fixed inset-0 left-0 z-50 flex h-full w-[calc(100vw-660px)] items-center justify-center">
            <Dialog.Content class="no-scrollbar z-50 w-[calc(100%-72px)] overflow-hidden rounded-sm">
              <div class="flex h-8 w-full justify-between border-b border-gray-500 bg-gray-200">
                <Dialog.Label class="ml-1 font-garamond text-5.5 font-700 leading-8">
                  Insert bookmark
                </Dialog.Label>
                <Dialog.Close class="btn-close">
                  <OcX2 size={15} />
                </Dialog.Close>
              </div>

              <form
                class="flex h-[calc(100vh-72px)] w-full flex-col overflow-hidden"
                method="post"
                action={insertBookmarkData}
                onSubmit={() => setOpenDialogInsert(false)}
              >
                <input
                  hidden
                  name="id"
                  autocomplete="off"
                  value={bookmark()?.created_at}
                />
                <textarea
                  class="mb-0 min-h-[calc(100vh-100px)] w-full flex-grow p-2 pl-3 indent-3 font-garamond text-6 font-400 leading-7 text-black outline-none"
                  autocomplete="off"
                  name="bookmarksInsert"
                />

                <button
                  class="flex h-9 w-full items-center justify-center rounded-[3px] bg-[#070707] text-[#ececec] shadow transition hover:bg-black hover:text-white"
                  type="submit"
                >
                  <AiOutlineInsertRowBelow size={18} />
                </button>
              </form>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog>

      <Dialog
        open={openDialogSearch()}
        onOpenChange={(open) => handleCloseDialogSearch(open)}
      >
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 left-0 z-50 h-full w-[calc(100vw-660px)] bg-black/60" />
          <div class="fixed inset-0 left-0 z-50 flex h-full w-[calc(100vw-660px)] items-center justify-center">
            <Dialog.Content class="no-scrollbar z-50 w-[calc(100%-72px)] overflow-hidden rounded-sm">
              <div class="overflow-hiddenp-3 h-[calc(100vh-48px)] w-full bg-gray-50 p-3">
                <div class="bg-gray-0 relative h-10 w-full overflow-hidden rounded-md shadow focus-within:shadow-md">
                  <span class="cursor-pointer" onClick={searchBookmark}>
                    <OcSearch2 size={18} class="absolute left-2 h-full" />
                  </span>
                  <input
                    ref={searchInputRef}
                    onFocus={() => setActive(null)}
                    onBlur={() => setActive(null)}
                    name="bookmarkSearchInput"
                    autocomplete="off"
                    onInput={(e) =>
                      setSearchTerm((e.target as HTMLInputElement).value)
                    }
                    onKeyDown={handleBookmarkSearchKeyDown}
                    value={searchTerm()}
                    class="absolute left-0 right-0 ml-10 h-full px-3 font-basier text-4.5 font-400 leading-10 outline-none"
                  />
                </div>
                <div
                  ref={searchResultsRef}
                  class="no-scrollbar mt-1 h-[calc(100vh-110px)] w-full overflow-y-scroll py-3"
                >
                  <Suspense>
                    <Show when={searchResults()}>
                      <For each={searchResults()}>
                        {(item, index) => (
                          <p
                            aria-selected={active() === index()}
                            onMouseMove={() => setActive(index())}
                            onClick={() => handleSelectSearch(item)}
                            class={`cursor-pointer rounded-md px-2 font-basier text-5 font-400 leading-10 ${active() === index() ? "!bg-blue-200" : ""} mb-2 bg-gray-200 shadow`}
                          >
                            ...{highlight(item.content, regex())}
                          </p>
                        )}
                      </For>
                    </Show>
                  </Suspense>
                </div>
              </div>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog>

      <Dialog open={openDeleteAlert()} onOpenChange={setOpenDeleteAlert}>
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 left-0 z-50 h-full w-[calc(100vw-660px)] bg-black/60" />
          <div class="fixed inset-0 left-0 z-50 flex h-full w-[calc(100vw-660px)] items-center justify-center">
            <Dialog.Content class="no-scrollbar z-50 w-[210px] overflow-hidden rounded-sm bg-gray-100">
              <div class="flex h-8 w-full justify-between border-b border-gray-500 bg-gray-200">
                <Dialog.Label class="ml-1 font-garamond text-5.5 font-700 leading-8">
                  Delete this bookmark?
                </Dialog.Label>
                <Dialog.Close class="btn-close">
                  <OcX2 size={15} />
                </Dialog.Close>
              </div>

              <div class="flex w-full items-center justify-center p-1">
                <button
                  onClick={handleDeleteBookmark}
                  class="mx-3 flex h-8 w-[45px] items-center justify-center rounded-[3px] bg-[#070707] font-basier text-4 font-500 leading-8 text-[#ececec] shadow transition hover:bg-black hover:text-[#de0000]"
                >
                  Yes
                </button>
                <Dialog.Close class="mx-3 flex h-8 w-[45px] items-center justify-center rounded-[3px] bg-[#070707] font-basier text-4 font-500 leading-8 text-[#ececec] shadow transition hover:bg-black hover:text-[#de0000]">
                  No
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog>
    </div>
  );
};

export default Bookmark;
