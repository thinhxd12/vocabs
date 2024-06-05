import { RouteSectionProps } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { getDataImage, getUnsplashImage } from "~/lib/api";
import Bottom from "~/components/bottom";
import { ImageType } from "~/types";
import { Motion } from "solid-motionone";
import { VsLayoutActivitybarRight, VsLayoutCentered } from "solid-icons/vs";
import { TbRefresh } from "solid-icons/tb";
import { format } from "date-fns";
import { mainStore, setMainStore } from "~/lib/mystore";
import styles from "./main.module.scss";

export default function Main(props: RouteSectionProps) {
  const mockObj = {
    image: "/images/main/main-image.webp",
    date: "01 July 2023",
    title: "The Red Buoy, Saint-Tropez",
    attr: "Oil on canvas • 81 × 65 cm",
    authorImg: "/images/main/main-author.webp",
    authorName: "Paul Signac",
    authorYear: "1895",
    content:
      "\x3Cp>Hello July!\x3C/p>\x3Cp>Time for an artist who in my opinion, created one of the best images of Summer ... the French Pointillist, Paul Signac!\x3C/p>\x3Cp>Signac was a painter and an avid sailor. He created several marine paintings, including a series of views over the port of Saint-Tropez, where he settled in 1892.\x3C/p>\x3Cp>In this vertical painting, the eye initially fixes on the vibrant red-orange buoy, which contrasts with the water's deep blue. The reflections of the buildings then lead the viewer's eye to the background, with lighter tones. The divisionist technique and the combination of pure colors allowed Signac to depict a glittering sea, and the glimmering light of the Midi.\x3C/p>\x3Cp>The Pointillist painters differ from the Impressionists, most notably in the scientific dimension of their work. Regarding the rigor of his initial work, Signac's strokes have widened for this series; the division of tones is more relaxed.\x3C/p>",
    nextImageUrl:
      "https://www.getdailyart.com/en/24707/mykola-pymonenko/the-idyll",
  };

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

  return (
    <div class={styles.main}>
      <div class={styles.mainButtons}>
        <button
          onClick={() => setMainStore("mainToggle", !mainStore.mainToggle)}
          class={styles.mainButton}
        >
          <Show
            when={mainStore.mainToggle}
            fallback={<VsLayoutCentered size={17} />}
          >
            <VsLayoutActivitybarRight size={17} />
          </Show>
        </button>
        <button onClick={handleGetNextImage} class={styles.mainButton}>
          <TbRefresh size={17} />
        </button>
      </div>

      <Motion.div
        class={styles.mainLeft}
        animate={{
          opacity: mainStore.mainToggle ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <img class={styles.mainLeftImage} src={imageObj.image} />
        <img class={styles.mainLeftImageBlurred} src={imageObj.image} />
      </Motion.div>

      <div class={styles.mainCenter}>
        <div class={styles.mainCenterContent}>
          <Suspense>{props.children}</Suspense>
        </div>
        <Bottom />
      </div>

      <Motion.div
        class={styles.mainRight}
        animate={{
          width: mainStore.mainToggle ? "300px" : "calc(50vw - 180px)",
          opacity: mainStore.mainToggle ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
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
      </Motion.div>
    </div>
  );
}
