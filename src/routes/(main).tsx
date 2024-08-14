import { RouteSectionProps } from "@solidjs/router";
import { lazy, onCleanup, onMount, Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import {
  getDataImage,
  getUnsplashImage,
  handleCheckWord,
  searchText,
} from "~/lib/api";
import Bottom from "~/components/bottom";
import { ImageType } from "~/types";
import { VsLayoutActivitybarRight, VsLayoutCentered } from "solid-icons/vs";
import { TbRefresh } from "solid-icons/tb";
import { ImBooks } from "solid-icons/im";
import { format } from "date-fns";
import { mainStore, setMainStore } from "~/lib/mystore";
import styles from "./main.module.scss";
import { debounce } from "@solid-primitives/scheduled";
import { PUBLIC_URL } from "~/utils";
const Bookmark = lazy(() => import("~/components/bookmark"));

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      searchWord: null;
    }
  }
}

export default function Main(props: RouteSectionProps) {
  let audio: HTMLAudioElement | null;
  let checkTimeout: NodeJS.Timeout;
  const mockObj = {
    image: PUBLIC_URL + "images/main/main-image.webp",
    date: "01 July 2023",
    title: "The Red Buoy, Saint-Tropez",
    attr: "Oil on canvas • 81 × 65 cm",
    authorImg: PUBLIC_URL + "images/main/main-author.webp",
    authorName: "Paul Signac",
    authorYear: "1895",
    content:
      "\x3Cp>Hello July!\x3C/p>\x3Cp>Time for an artist who in my opinion, created one of the best images of Summer ... the French Pointillist, Paul Signac!\x3C/p>\x3Cp>Signac was a painter and an avid sailor. He created several marine paintings, including a series of views over the port of Saint-Tropez, where he settled in 1892.\x3C/p>\x3Cp>In this vertical painting, the eye initially fixes on the vibrant red-orange buoy, which contrasts with the water's deep blue. The reflections of the buildings then lead the viewer's eye to the background, with lighter tones. The divisionist technique and the combination of pure colors allowed Signac to depict a glittering sea, and the glimmering light of the Midi.\x3C/p>\x3Cp>The Pointillist painters differ from the Impressionists, most notably in the scientific dimension of their work. Regarding the rigor of his initial work, Signac's strokes have widened for this series; the division of tones is more relaxed.\x3C/p>",
    nextImageUrl:
      // "https://www.getdailyart.com/en/24707/mykola-pymonenko/the-idyll",
      "https://www.getdailyart.com/en/21/paul-signac/the-red-buoy-saint-tropez",
  };
  onMount(() => {
    audio = new Audio();
    audio.src = "/sounds/mp3_Boing.mp3";
    audio.volume = 0.3;
  });

  onCleanup(() => {
    audio?.pause();
    audio = null;
    clearTimeout(checkTimeout);
  });

  const [imageObj, setImageObj] = createStore<ImageType>(mockObj);

  const getNextImageData = async (url: string) => {
    const result = await getDataImage(url);
    if (result) {
      setImageObj(result);
    } else handleGetUnsplashImage();
  };

  const handleGetNextImage = () => {
    getNextImageData(imageObj.nextImageUrl!);
  };

  const handleGetUnsplashImage = async () => {
    const data = await getUnsplashImage();
    setImageObj({
      image: data[0].urls.regular,
      date: format(new Date(data[0].created_at), "PP"),
      title: data[0].description || data[0].alt_description,
      attr: data[0].exif.name,
      authorImg: data[0].user.profile_image.medium,
      authorName: data[0].user.name,
      authorYear: "",
    });
  };

  //------------------HANDLE SEARCH--------------------
  const trigger = debounce(async (str: string) => {
    const res = await searchText(str);
    if (res) {
      if (res.length === 0) {
        setMainStore("searchTermColor", "#f90000");
        if (str.length > 3) {
          audio?.play();
        }
      }
      setMainStore("searchResult", res);
      mainStore.searchDeleteIndex !== 0 && setMainStore("searchDeleteIndex", 0);
      if (res.length === 1 && str.length > 4) {
        checkTimeout = setTimeout(() => {
          hanldeRenderWordFromSearch("1");
        }, 1500);
      }
    }
  }, 450);

  const hanldeRenderWordFromSearch = (keyDown: string) => {
    setMainStore("searchTermColor", "#ffffffe6");
    setMainStore("searchSelectedIndex", Number(keyDown));
    setTimeout(() => {
      setMainStore("searchSelectedIndex", 0);
    }, 300);
    const parsedResult = JSON.parse(JSON.stringify(mainStore.searchResult));
    setTimeout(() => {
      setMainStore("searchTerm", "");
      setMainStore("searchResult", []);
      handleCheckWord(parsedResult[Number(keyDown) - 1]);
    }, 600);
  };

  const searchWord = (element: HTMLDivElement) => {
    element.addEventListener("keydown", (e) => {
      const keyDown = e.key;
      if (keyDown.match(/^[a-zA-Z\-]$/)) {
        setMainStore(
          "searchTerm",
          mainStore.searchTerm + String(keyDown).toLowerCase()
        );
        if (mainStore.searchTerm.length > 2) {
          trigger(mainStore.searchTerm);
        }
      }
      if (keyDown?.match(/^[1-9]$/)) {
        const keyDonwNumber = Number(keyDown);
        if (
          mainStore.searchResult.length > 0 &&
          keyDonwNumber <= mainStore.searchResult.length
        ) {
          hanldeRenderWordFromSearch(keyDown);
          checkTimeout && clearTimeout(checkTimeout);
        }
      }
      if (keyDown === "Backspace") {
        setMainStore("searchTerm", mainStore.searchTerm.slice(0, -1));
        if (mainStore.searchTerm.length > 2) {
          trigger(mainStore.searchTerm);
        }
      }
      if (keyDown === " ") {
        setMainStore("searchTermColor", "#ffffffe6");
        setMainStore("searchTerm", "");
        setMainStore("searchResult", []);
        checkTimeout && clearTimeout(checkTimeout);
      }
      if (keyDown === "Enter" && mainStore.searchResult.length === 0) {
        setMainStore("searchTermColor", "#ffffffe6");
        setMainStore("translateTerm", mainStore.searchTerm);
        setMainStore("searchTerm", "");
        setMainStore("showTranslate", true);
      }
    });
  };

  return (
    <div class={styles.main} tabIndex={0} use:searchWord={null}>
      <Show when={mainStore.mainToggle}>
        <Show
          when={!mainStore.showBookmark}
          fallback={
            <Bookmark onClose={() => setMainStore("showBookmark", false)} />
          }
        >
          <div class={styles.mainLeft}>
            <img class={styles.mainLeftImageBlurred} src={imageObj.image} />
            <img class={styles.mainLeftImage} src={imageObj.image} />

            <div class={styles.mainButtons}>
              <button
                aria-label="Layout"
                onClick={() =>
                  setMainStore("mainToggle", !mainStore.mainToggle)
                }
                class={styles.mainButton}
              >
                <Show
                  when={mainStore.mainToggle}
                  fallback={<VsLayoutCentered size={17} />}
                >
                  <VsLayoutActivitybarRight size={17} />
                </Show>
              </button>

              <button
                onClick={() => setMainStore("showBookmark", true)}
                class={styles.mainButton}
                aria-label="Open Bookmark"
              >
                <ImBooks size={17} />
              </button>

              <button
                onClick={handleGetNextImage}
                class={styles.mainButton}
                aria-label="Change Image"
              >
                <TbRefresh size={17} />
              </button>
            </div>
          </div>
          <div class={styles.mainRight}>
            <div class={styles.mainRightHeader}>
              <p class={styles.mainRightDate}>{imageObj.date}</p>
              <h3 class={styles.mainRightTitle}>{imageObj.title}</h3>
              <p class={styles.mainRightAttribute}>{imageObj.attr}</p>
              <div class={styles.mainRightAuthors}>
                <img class={styles.mainRightImage} src={imageObj.authorImg} />
                <div class={styles.mainRightAuthor}>
                  <p class={styles.mainRightName}>{imageObj.authorName}</p>
                  <p class={styles.mainRightYear}>{imageObj.authorYear}</p>
                </div>
              </div>
            </div>
            <div class={styles.mainRightBody} innerHTML={imageObj.content} />
          </div>
        </Show>
      </Show>

      <div class={styles.mainCenter}>
        <Suspense fallback={<div class={styles.mainCenterContent}></div>}>
          <div class={styles.mainCenterContent}>{props.children}</div>
        </Suspense>
        <Bottom />
      </div>
    </div>
  );
}
