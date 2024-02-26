import {
  Component,
  Setter,
  Show,
  createResource,
  createSignal,
} from "solid-js";
import "/public/styles/quote.scss";
import {
  OcChevronleft2,
  OcChevronright2,
  OcCopy2,
  OcStar2,
  OcStarfill2,
  OcX2,
} from "solid-icons/oc";

const Bookmark: Component<{ onClose?: Setter<boolean> }> = (props) => {
  const bookmarkUrl = import.meta.env.VITE_BOOKMARK;

  const getBookMarkData = async (num: number) => {
    return (await fetch(bookmarkUrl + `getBookmark&num=${num}`)).json();
  };

  const [bookMarkNum, setbookMarkNum] = createSignal<number>(0);
  const [bookmarkItem, { refetch, mutate }] = createResource(
    bookMarkNum,
    getBookMarkData
  );

  const getBookMark = (num: number) => {
    if (num === bookMarkNum()) {
      refetch();
      return;
    }
    setbookMarkNum(num);
  };

  const checkBookMark = (val: boolean) => {
    fetch(bookmarkUrl + `setBookmark&check=${val}`);
    mutate((item) => {
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
    <div class="quoteContainer">
      <div class="quoteHeader">
        <div class="quoteHeaderLeft">
          <button class="button button--quote" onclick={() => getBookMark(-1)}>
            <OcChevronleft2 size={17} />
          </button>
          <button
            class="button button--quote"
            onclick={() => checkBookMark(!bookmarkItem().check)}
          >
            <Show
              when={bookmarkItem.loading}
              fallback={
                <Show
                  when={bookmarkItem().check}
                  fallback={<OcStar2 size={17} />}
                >
                  <OcStarfill2 size={17} color="#ffc107" />
                </Show>
              }
            >
              <OcStar2 size={17} />
            </Show>
          </button>
          <button class="button button--quote" onclick={() => getBookMark(1)}>
            <OcChevronright2 size={17} />
          </button>
          <button
            class="button button--quote"
            onclick={() => copyBookMarkToClipboard(bookmarkItem().value)}
          >
            <OcCopy2 size={14} />
          </button>
        </div>
        <div class="quoteHeaderRight">
          <button class="button button--close" onclick={props.onClose}>
            <OcX2 size={15} />
          </button>
        </div>
      </div>

      <Show
        when={bookmarkItem.loading}
        fallback={
          <div
            class={
              bookmarkItem().check
                ? "quoteBody quoteBody--bookmark"
                : "quoteBody"
            }
          >
            <p class="quotePassage">{bookmarkItem().value}</p>
          </div>
        }
      >
        <p class="quoteLoading">loading...</p>
      </Show>
    </div>
  );
};

export default Bookmark;
