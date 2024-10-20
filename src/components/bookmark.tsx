import {
  Component,
  Index,
  Setter,
  Show,
  createSignal,
  onMount,
} from "solid-js";
import styles from "./bookmark.module.scss";
import buttons from "../assets/styles/buttons.module.scss";
import { OcSearch2, OcX2 } from "solid-icons/oc";
import {
  checkBookMarkData,
  findBookMarkData,
  getBookMarkData,
  getBookMarkDataItem,
  getNextBookMarkData,
  getPrevBookMarkData,
  getRandomBookMarkData,
  insertBookmarkData,
  updateBookmarkData,
} from "~/lib/api";
import { stopKeydown } from "~/utils";
import { BookmarkType } from "~/types";
import { FaSolidFeather } from "solid-icons/fa";
import { AiOutlineInsertRowBelow } from "solid-icons/ai";
import { BsHeartFill } from "solid-icons/bs";
import { BiSolidLeftArrow, BiSolidPaste, BiSolidRightArrow, BiSolidSave } from "solid-icons/bi";
import { FaSolidDice } from "solid-icons/fa";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      searchBookmark: null;
    }
  }
}

const Bookmark: Component<{ onClose?: Setter<boolean> }> = (props) => {
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

  const getRandomBookmark = async () => {
    const data = await getRandomBookMarkData();
    if (data) {
      setBookmark(data);
    }
  };

  const [spans, setSpans] = createSignal<number[]>([]);

  const animationRun = () => {
    setSpans(Array.from({ length: 45 }, (_, i) => i))
    setTimeout(() => setSpans([]), 1500);
  }

  return (
    <div class={styles.bookmarkContainer} tabIndex={1}>
      <div
        class={
          bookmark()?.like
            ? styles.bookmarkContentChecked
            : styles.bookmarkContent
        }
      >
        <div class={styles.bookmarkContentInside}>
          <div class={styles.bookmarkTitleContent}>
            <p class={styles.bookmarkTitle}>{bookmark()?.bookTile}</p>
            <img class={styles.bookmarkSeparated} src="images/main/bookmark-onarment-1.webp" width={150} />
          </div>

          <Show
            when={bookmark()?.content}
            fallback={
              <div class={styles.bookmarkPassageLoading}>
                <img src="images/svg/loader.svg" width={40} height={10} />
              </div>
            }
          >
            <p class={styles.bookmarkPassage}>{bookmark()?.content}</p>
          </Show>

          <div class={styles.bookmarkCredit} >
            <img src="images/main/bookmark-onarment-2.webp" width={100} />
            <p class={styles.bookmarkAuthor}>{bookmark()?.authors} </p>
            <p class={styles.bookmarkYear}>{bookmark()?.dateOfCreation}</p>
          </div>
        </div>

        <Show when={spans().length > 0}>
          <Index each={spans()}>
            {
              data => {
                return <span class={styles.heart} style={{ left: `${Math.random() * 100}%`, bottom: "0px", "animation-delay": `${Math.random() * 0.5}s` }}>
                  <BsHeartFill size={24} color="#e92f3f" />
                </span>
              }
            }
          </Index>
        </Show>

        <div
          class={styles.buttonBookmarkLeft}
          onclick={() => handleGetPrevBookmark()}
        >
          <BiSolidLeftArrow size={18} color="#111111" />
        </div>
        <div
          class={styles.buttonBookmarkRight}
          onclick={() => handleGetNextBookmark()}
        >
          <BiSolidRightArrow size={18} color="#111111" />
        </div>
      </div>

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
              <BiSolidSave size={15} />
              <span>Save</span>
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

      <div class={styles.bookmarkButtons}>
        <button
          class={buttons.buttonBookmark}
          onclick={() => handleCheckBookmark()}
        >
          <Show
            when={bookmark()?.like}
            fallback={<BsHeartFill size={22} color="#ffffffe6" />}
          >
            <BsHeartFill size={22} color="#fd2c55" />
          </Show>
        </button>
        <div class={styles.bookmarkLike}>{bookmark()?.like}</div>

        <button
          class={buttons.buttonBookmark}
          onclick={() => copyBookMarkToClipboard(bookmark()!.content)}
        >
          <BiSolidPaste size={22} color="#ffffffe6" />
        </button>

        <button
          class={buttons.buttonBookmark}
          onclick={() => getRandomBookmark()}
        >
          <FaSolidDice size={26} color="#ffffffe6" />
        </button>

        <button
          class={buttons.buttonBookmark}
          onclick={() => setShowEdit(!showEdit())}
        >
          <FaSolidFeather size={19} color="#ffffffe6" />
        </button>

        <button
          class={buttons.buttonBookmark}
          onclick={() => setShowInsert(!showInsert())}
        >
          <AiOutlineInsertRowBelow size={22} color="#ffffffe6" />
        </button>

        <button
          class={buttons.buttonBookmark}
          onclick={() => setShowSearch(!showSearch())}
        >
          <OcSearch2 size={18} color="#ffffffe6" />
        </button>

        <button class={buttons.buttonBookmark} onclick={props.onClose}>
          <OcX2 size={20} color="#ffffffe6" />
        </button>
      </div>
    </div>
  );
};

export default Bookmark;
