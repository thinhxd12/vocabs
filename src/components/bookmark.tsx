import {
  Component,
  Setter,
  Show,
  Suspense,
  createResource,
  createSignal,
} from "solid-js";
import styles from "./bookmark.module.scss";
import buttons from "../assets/styles/buttons.module.scss";
import {
  OcChevronleft2,
  OcChevronright2,
  OcCopy2,
  OcStar2,
  OcStarfill2,
  OcX2,
} from "solid-icons/oc";
import { cache } from "@solidjs/router";

const Bookmark: Component<{ onClose?: Setter<boolean> }> = (props) => {
  const bookmarkUrl = import.meta.env.VITE_BOOKMARK;

  const getBookMarkData = cache(async (num: number) => {
    return (await fetch(bookmarkUrl + `getBookmark&num=${num}`)).json();
  }, "bookmark");

  const [bookmarkId, setBookmarkId] = createSignal<number>(0);
  const [bookmark, { refetch: refetchBookmark, mutate: mutateBookmark }] =
    createResource(bookmarkId, getBookMarkData);

  const handleGetNextBookmark = (num: number) => {
    setBookmarkId(num);
    refetchBookmark();
  };

  const handleCheckBookmark = (val: boolean) => {
    fetch(bookmarkUrl + `setBookmark&check=${val}`);
    mutateBookmark((item) => {
      return {
        ...item,
        check: val,
      };
    });
  };

  const copyBookMarkToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div class={styles.bookmarkContainer}>
      <div class={styles.bookmarkHeader}>
        <div class={styles.bookmarkHeaderLeft}>
          <button
            class={buttons.buttonBookmark}
            onclick={() => handleGetNextBookmark(-1)}
          >
            <OcChevronleft2 size={17} />
          </button>
          <button
            class={buttons.buttonBookmark}
            onclick={() => handleCheckBookmark(!bookmark()?.check)}
          >
            <Suspense fallback={<OcStar2 size={17} />}>
              <Show when={bookmark()?.check} fallback={<OcStar2 size={17} />}>
                <OcStarfill2 size={17} color="#ffc107" />
              </Show>
            </Suspense>
          </button>
          <button
            class={buttons.buttonBookmark}
            onclick={() => handleGetNextBookmark(1)}
          >
            <OcChevronright2 size={17} />
          </button>
          <button
            class={buttons.buttonBookmark}
            onclick={() => copyBookMarkToClipboard(bookmark()?.value)}
          >
            <OcCopy2 size={14} />
          </button>
        </div>
        <div class={styles.bookmarkHeaderRight}>
          <button class={buttons.buttonClose} onclick={props.onClose}>
            <OcX2 size={15} />
          </button>
        </div>
      </div>

      <Suspense
        fallback={<p class={styles.bookmarkLoading}>loading bookmark...</p>}
      >
        <div
          class={
            bookmark()?.check ? styles.bookmarkBodyChecked : styles.bookmarkBody
          }
        >
          <p class={styles.bookmarkPassage}>{bookmark()?.value}</p>
        </div>
      </Suspense>
    </div>
  );
};

export default Bookmark;
