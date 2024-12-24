import {
  Component,
  createMemo,
  createSignal,
  For,
  lazy,
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
import {
  AiOutlineInsertRowBelow,
  AiOutlineLeft,
  AiOutlineRight,
} from "solid-icons/ai";
import { BsHeartFill } from "solid-icons/bs";
import { BiSolidSave } from "solid-icons/bi";
import { OcSearch2 } from "solid-icons/oc";
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
import Dialog from "@corvu/dialog";
const HeartAnimate = lazy(() => import("./HeartAnimate"));

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
      setHeartId(heartId() + 1);
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
    <mark class="bg-black/60 px-1 font-600 text-white">{text()}</mark>
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

  const handleDeleteBookmark = () => {
    deleteBookmark(bookmark()!.created_at);
    handleGetNextBookmark();
    setOpenDeleteAlert(false);
  };

  const [heartId, setHeartId] = createSignal<number>(0);

  return (
    <>
      <HeartAnimate id={heartId()} />

      <div class="light-layout flex h-full w-full rounded-3 px-11 py-8">
        <div
          class={`no-scrollbar relative h-full w-full overflow-y-scroll rounded-3 border border-black/60 ${bookmark()?.like ? "bg-[url('/images/paper.webp')] shadow-md shadow-black/60" : "bg-[#dcd8d1]"} bg-cover bg-local`}
        >
          <p class="px-2 pt-4 text-center font-garamond text-11 font-600 uppercase leading-11">
            {bookmark()?.bookTile}
          </p>
          <img
            src="/images/bookmark-onarment-1.webp"
            width={120}
            class="mx-auto mb-8 mt-2"
          />
          <p class="bookmarkTextContent pl-7 pr-3 font-garamond text-6.5 font-400 leading-10">
            <Show
              when={bookmark()?.content}
              fallback={
                <img src="/assets/svg/loader.svg" class="mx-auto w-11" />
              }
            >
              {bookmark()?.content}
            </Show>
          </p>
          <div class="mb-4 ml-auto mr-6 mt-6 flex w-fit flex-col items-center justify-center">
            <img src="/images/bookmark-onarment-2.webp" class="mb-1 w-[72px]" />
            <p class="font-garamond text-5 font-700 leading-5">
              {bookmark()?.authors}
            </p>
          </div>
          <p class="px-3 pb-3 text-right font-garamond text-5 font-700 leading-5">
            {bookmark()?.dateOfCreation}
          </p>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 flex items-center p-2">
        <div class="dark-layout mx-auto flex items-center justify-center rounded-3 px-3 py-2">
          <button class="btn-bookmark pt-0.5" onClick={handleCheckBookmark}>
            <BsHeartFill
              size={16}
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
            class={`-ml-0.5 mr-1.5 mt-5.5 text-3.5 font-600 leading-4 ${bookmark()?.like ? (likeReset() ? "text-[#f08399]" : "text-[#fd2c55]") : "text-white"}`}
          >
            {bookmark()?.like}
          </span>

          <button class="btn-bookmark" onClick={copyBookMarkToClipboard}>
            <FaRegularCopy size={12} color="#ffffff" />
          </button>

          <button class="btn-bookmark" onClick={getRandomBookmark}>
            <FaSolidDiceThree size={12} color="#ffffff" />
          </button>

          <button class="btn-bookmark" onClick={() => setOpenDialogEdit(true)}>
            <FaSolidFeather size={12} color="#ffffff" />
          </button>

          <button
            class="btn-bookmark"
            onClick={() => setOpenDialogInsert(true)}
          >
            <FaSolidFileCirclePlus size={12} color="#ffffff" />
          </button>

          <button
            class="btn-bookmark"
            onClick={() => setOpenDialogSearch(true)}
          >
            <OcSearch2 size={12} color="#ffffff" />
          </button>

          <button class="btn-bookmark" onClick={() => setOpenDeleteAlert(true)}>
            <FaRegularTrashCan size={12} color="#ffffff" />
          </button>

          <button class="btn-bookmark" onClick={handleGetPrevBookmark}>
            <AiOutlineLeft size={12} />
          </button>

          <button class="btn-bookmark" onClick={handleGetNextBookmark}>
            <AiOutlineRight size={12} />
          </button>
        </div>
      </div>

      <Show when={openDeleteAlert()}>
        <div class="absolute bottom-[50px] left-[47.5%] flex items-center p-2">
          <div class="dark-layout mx-auto flex flex-col items-center justify-center rounded-3 px-3 py-2">
            <p class="mb-1 text-5 text-white">Delete this bookmark?</p>
            <div class="flex items-center justify-center">
              <button
                class="btn-bookmark-delete"
                onClick={() => setOpenDeleteAlert(false)}
              >
                Cancel
              </button>
              <button
                class="btn-bookmark-delete text-red-600"
                onClick={handleDeleteBookmark}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Show>

      <Dialog open={openDialogEdit()} onOpenChange={setOpenDialogEdit}>
        <Dialog.Portal>
          <div class="fixed inset-0 left-0 z-50 h-screen w-[calc(100vw-402px)] px-[80px] pb-[90px] pt-[30px]">
            <Dialog.Content class="no-scrollbar dark-layout h-full w-full rounded-3 px-11 pb-4 pt-8">
              <form
                method="post"
                action={updateBookmarkData}
                class="flex h-full w-full flex-col overflow-hidden"
                onSubmit={() => setOpenDialogEdit(false)}
              >
                <input
                  hidden
                  name="id"
                  autocomplete="off"
                  value={bookmark()?.created_at}
                />
                <textarea
                  class="w-full flex-grow rounded-3 p-2 pl-3 indent-3 font-garamond text-6 font-400 leading-7 text-black outline-none"
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

                <div class="flex h-11 w-full items-center justify-end p-1">
                  <button class="btn-bookmark" type="submit">
                    <BiSolidSave size={15} />
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog>

      <Dialog open={openDialogInsert()} onOpenChange={setOpenDialogInsert}>
        <Dialog.Portal>
          <div class="fixed inset-0 left-0 z-50 h-screen w-[calc(100vw-402px)] px-[80px] pb-[90px] pt-[30px]">
            <Dialog.Content class="no-scrollbar dark-layout h-full w-full rounded-3 px-11 pb-4 pt-8">
              <form
                class="flex h-full w-full flex-col overflow-hidden"
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
                  class="w-full flex-grow rounded-3 p-2 pl-3 indent-3 font-garamond text-6 font-400 leading-7 text-black outline-none"
                  autocomplete="off"
                  name="bookmarksInsert"
                />

                <div class="flex h-11 w-full items-center justify-end p-1">
                  <button class="btn-bookmark" type="submit">
                    <AiOutlineInsertRowBelow size={18} />
                  </button>
                </div>
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
          <div class="fixed inset-0 left-0 z-50 h-screen w-[calc(100vw-402px)] px-[80px] pb-[90px] pt-[30px]">
            <Dialog.Content class="no-scrollbar light-layout h-full w-full rounded-3 px-11 pb-4 pt-8">
              <div class="flex h-[40px] w-full justify-center overflow-hidden rounded-full bg-white/15 py-2 shadow focus-within:shadow-md">
                <div class="relative h-full w-1/2 overflow-hidden rounded-full bg-black/15 shadow-[0_0_3px_0px_#00000054_inset]">
                  <span class="cursor-pointer" onClick={searchBookmark}>
                    <OcSearch2
                      size={18}
                      class="absolute left-3 h-full text-white"
                    />
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
                    on:keydown={handleBookmarkSearchKeyDown}
                    value={searchTerm()}
                    class="absolute left-0 right-0 ml-10 h-full rounded-3 bg-transparent px-3 text-5 font-400 leading-10 text-white outline-none"
                  />
                </div>
              </div>
              <div
                ref={searchResultsRef}
                class="no-scrollbar mt-1 h-[calc(100%-40px)] w-full overflow-y-scroll py-3"
              >
                <Suspense>
                  <Show when={searchResults()}>
                    <For each={searchResults()}>
                      {(item, index) => (
                        <p
                          aria-selected={active() === index()}
                          onMouseMove={() => setActive(index())}
                          onClick={() => handleSelectSearch(item)}
                          class={`cursor-pointer px-2 text-5 font-400 leading-8 text-secondary-white ${active() === index() ? "!bg-white/15" : ""} mb-4 border-b border-white/5`}
                        >
                          ...{highlight(item.content, regex())}
                        </p>
                      )}
                    </For>
                  </Show>
                </Suspense>
              </div>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog>
    </>
  );
};

export default Bookmark;
