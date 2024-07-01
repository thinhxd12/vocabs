import {
  Component,
  Index,
  Setter,
  Show,
  Suspense,
  createSignal,
  onMount,
} from "solid-js";
import styles from "./bookmark.module.scss";
import buttons from "../assets/styles/buttons.module.scss";
import { OcCopy2, OcSearch2, OcStar2, OcStarfill2, OcX2 } from "solid-icons/oc";
import {
  checkBookMarkData,
  findBookMarkData,
  getBookMarkData,
  getBookMarkDataItem,
  getNextBookMarkData,
  getPrevBookMarkData,
  insertBookmarkData,
  updateBookmarkData,
} from "~/lib/api";
import { BookmarkType } from "~/types";
import { FaSolidFeather } from "solid-icons/fa";
import { AiOutlineInsertRowBelow } from "solid-icons/ai";
import { stopKeydown } from "~/utils";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      searchBookmark: null;
    }
  }
}

const Bookmark: Component<{ onClose?: Setter<boolean> }> = (props) => {
  const [bookmark, setBookmark] = createSignal<BookmarkType>();

  onMount(async () => {
    const data = await getBookMarkData();
    if (data) {
      setBookmark(data);
    }
  });

  const handleGetPrevBookmark = async () => {
    const data = await getPrevBookMarkData(bookmark()!.created_at);
    if (data) setBookmark(data);
  };
  const handleGetNextBookmark = async () => {
    const data = await getNextBookMarkData(bookmark()!.created_at);
    if (data) setBookmark(data);
  };

  const handleCheckBookmark = (val: boolean) => {
    setBookmark({ ...bookmark()!, checked: val });
    checkBookMarkData(bookmark()!.created_at, val);
  };

  const copyBookMarkToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const [showEdit, setShowEdit] = createSignal<boolean>(false);
  const [showInsert, setShowInsert] = createSignal<boolean>(false);
  const [showSearch, setShowSearch] = createSignal<boolean>(false);
  const [searchData, setSearchData] = createSignal<BookmarkType[]>();

  const searchBookmark = (element: HTMLDivElement) => {
    element.addEventListener("keydown", async (e) => {
      const value = (e.target as HTMLInputElement).value;
      if (e.key === "Enter") {
        const data = await findBookMarkData(value);
        if (data) setSearchData(data);
      }
    });
  };

  const handleRenderSearchItem = async (item: BookmarkType) => {
    const data = await getBookMarkDataItem(item.created_at);
    if (data) setBookmark(data);
    setShowSearch(false);
  };

  return (
    <div class={styles.bookmarkContainer} tabIndex={1}>
      <Suspense fallback={<p class={styles.bookmarkLoading}>...</p>}>
        <div
          class={
            bookmark()?.checked
              ? styles.bookmarkBodyChecked
              : styles.bookmarkBody
          }
        >
          <div class={styles.bookmarkCredits}>
            <Show when={bookmark()?.bookTile}>
              <p class={styles.bookmarkTitle}>{bookmark()?.bookTile}</p>
            </Show>
            <Show when={bookmark()?.authors}>
              <p class={styles.bookmarkAuthor}>{bookmark()?.authors}</p>
            </Show>
            <Show when={bookmark()?.dateOfCreation}>
              <p class={styles.bookmarkYear}>{bookmark()?.dateOfCreation}</p>
            </Show>
          </div>
          <p class={styles.bookmarkPassage}>{bookmark()?.content}</p>
          <button
            class={styles.buttonBookmarkLeft}
            onclick={() => handleGetPrevBookmark()}
          ></button>
          <button
            class={styles.buttonBookmarkRight}
            onclick={() => handleGetNextBookmark()}
          ></button>
        </div>
      </Suspense>

      <Show when={showEdit()}>
        <div class={styles.bookmarkEditContainer}>
          <form
            action={updateBookmarkData}
            method="post"
            onSubmit={() => setShowEdit(false)}
          >
            <textarea
              class={styles.bookmarkTextArea}
              autocomplete="off"
              name="bookmarks"
              value={bookmark()!.content}
              use:stopKeydown={null}
              onChange={(e) => {
                e.stopPropagation();
                setBookmark({
                  ...bookmark()!,
                  content: e.currentTarget.value,
                });
              }}
            />
            <input hidden name="id" value={bookmark()!.created_at} />
            <button type="submit" class={buttons.buttonSubmit}>
              Edit
            </button>
          </form>
        </div>
      </Show>

      <Show when={showInsert()}>
        <div class={styles.bookmarkEditContainer}>
          <form
            action={insertBookmarkData}
            method="post"
            onSubmit={() => setShowInsert(false)}
          >
            <textarea
              class={styles.bookmarkTextArea}
              autocomplete="off"
              name="bookmarks"
              use:stopKeydown={null}
            />
            <button type="submit" class={buttons.buttonSubmit}>
              Insert
            </button>
          </form>
        </div>
      </Show>

      <Show when={showSearch()}>
        <div class={styles.bookmarkEditContainer}>
          <div class={styles.bookmarkTextArea}>
            <input
              class={styles.bookmarkInput}
              use:searchBookmark={null}
              use:stopKeydown={null}
            />
            <Show when={searchData()}>
              <Index each={searchData()}>
                {(data) => {
                  return (
                    <p onClick={() => handleRenderSearchItem(data())}>
                      ... {data()?.content} ...
                    </p>
                  );
                }}
              </Index>
            </Show>
          </div>
        </div>
      </Show>

      <div class={styles.bookmarkHeader}>
        <div class={styles.bookmarkHeaderLeft}></div>
        <div class={styles.bookmarkHeaderRight}>
          <button
            class={buttons.buttonBookmark}
            onclick={() => handleCheckBookmark(!bookmark()?.checked)}
          >
            <Show when={bookmark()?.checked} fallback={<OcStar2 size={17} />}>
              <OcStarfill2 size={17} color="#ffc107" />
            </Show>
          </button>
          <button
            class={buttons.buttonBookmark}
            onclick={() => copyBookMarkToClipboard(bookmark()!.content)}
          >
            <OcCopy2 size={14} />
          </button>
          <button
            class={buttons.buttonBookmark}
            onclick={() => setShowEdit(!showEdit())}
          >
            <FaSolidFeather size={13} />
          </button>
          <button
            class={buttons.buttonBookmark}
            onclick={() => setShowInsert(!showInsert())}
          >
            <AiOutlineInsertRowBelow size={16} />
          </button>
          <button
            class={buttons.buttonBookmark}
            onclick={() => setShowSearch(!showSearch())}
          >
            <OcSearch2 size={14} />
          </button>
          <button class={buttons.buttonBookmark} onclick={props.onClose}>
            <OcX2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bookmark;
