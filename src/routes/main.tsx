import {
  useAction,
  type RouteDefinition,
  RouteSectionProps,
} from "@solidjs/router";
import { Show, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { getUser } from "~/api";
import { getDataImage, getUnsplashImage } from "~/api/api";
import Bottom from "~/components/bottom";
import { ImageType } from "~/types";
import "/public/styles/main.scss";
import { GlobalContextProvider } from "~/globalcontext/store";
import { Motion, Presence } from "solid-motionone";
import { VsLayoutActivitybarRight, VsLayoutCentered } from "solid-icons/vs";
import { FaRegularCircle, FaRegularCircleDot } from "solid-icons/fa";

export const route = {
  load: () => getUser(),
} satisfies RouteDefinition;

const MainLayout = (props: RouteSectionProps) => {
  const getDataImageAction = useAction(getDataImage);

  const mockObj = {
    image: "/images/main/main-image.jpg",
    date: "01 July 2023",
    title: "The Red Buoy, Saint-Tropez",
    attr: "Oil on canvas • 81 × 65 cm",
    authorImg: "/images/main/main-author.jpg",
    authorName: "Paul Signac",
    authorYear: "1895",
    content:
      "\x3Cp>Hello July!\x3C/p>\x3Cp>Time for an artist who in my opinion, created one of the best images of Summer ... the French Pointillist, Paul Signac!\x3C/p>\x3Cp>Signac was a painter and an avid sailor. He created several marine paintings, including a series of views over the port of Saint-Tropez, where he settled in 1892.\x3C/p>\x3Cp>In this vertical painting, the eye initially fixes on the vibrant red-orange buoy, which contrasts with the water's deep blue. The reflections of the buildings then lead the viewer's eye to the background, with lighter tones. The divisionist technique and the combination of pure colors allowed Signac to depict a glittering sea, and the glimmering light of the Midi.\x3C/p>\x3Cp>The Pointillist painters differ from the Impressionists, most notably in the scientific dimension of their work. Regarding the rigor of his initial work, Signac's strokes have widened for this series; the division of tones is more relaxed.\x3C/p>",
    nextImageUrl:
      "https://www.getdailyart.com/en/24707/mykola-pymonenko/the-idyll",
  };

  const [imageObj, setImageObj] = createStore<ImageType>(mockObj);

  const getNextImageData = async (url: string) => {
    const result = await getDataImageAction(url);
    if (result) {
      setImageObj(result);
    } else handleGetUnsplashImage();
  };

  //Wakeup sever render after 14 minutes
  const getWakeup = async () => {
    const url = "https://myapp-9r5h.onrender.com/wakeup";
    const response = await fetch(url);
    const result = response.json();
    return result;
  };

  onMount(() => {
    getWakeup();
    setInterval(() => {
      getWakeup();
    }, 840000);
  });

  const [toggleMainPage, setToggleMainPage] = createSignal<boolean>(false);
  const [toggleButton, setToggleButton] = createSignal<boolean>(false);

  const changeToggle = () => {
    setToggleMainPage(!toggleMainPage());
  };

  const handleGetNextImage = () => {
    getNextImageData(imageObj.nextImageUrl!);
    setToggleButton(!toggleButton());
    setTimeout(() => {
      setToggleButton(!toggleButton());
    }, 300);
  };

  const handleGetUnsplashImage = async () => {
    const data = await getUnsplashImage();
    setImageObj({
      image: data[0].urls.regular,
      date: new Date(data[0].created_at).toLocaleString([], {
        dateStyle: "long",
      }),
      title: data[0].description || data[0].alt_description,
      attr: data[0].exif.name,
      authorImg: data[0].user.profile_image.medium,
      authorName: data[0].user.name,
      authorYear: "",
    });
    const bookmarkUrl = import.meta.env.VITE_BOOKMARK;
    const quote = await (await fetch(bookmarkUrl + `getRandomBookmark`)).json();
    setImageObj({
      content: `<p>"${quote.value}"</p>`,
    });
  };

  return (
    <div>
      <div class="main">
        <Motion.div
          class="mainImageContainer"
          animate={{
            maxWidth: toggleMainPage() ? "calc(50vw - 180px)" : "unset",
          }}
          transition={{ duration: 0.6, easing: "ease" }}
        >
          <Presence>
            <Show when={!toggleMainPage()}>
              <Motion.div
                class="mainImageContentAnimation"
                initial={{
                  opacity: 0,
                  x: "-100%",
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: "-100%",
                }}
                transition={{ duration: 0.6, easing: "ease" }}
              >
                <img class="mainImage" src={imageObj.image} />
                <img class="mainImageBlurred" src={imageObj.image} />
              </Motion.div>
            </Show>
          </Presence>
        </Motion.div>

        <div class="mainImageContent">
          <GlobalContextProvider>
            {props.children}
            <Bottom />
          </GlobalContextProvider>
        </div>

        <Motion.div
          class="mainDescriptionContainter"
          animate={{
            width: toggleMainPage() ? "calc(50vw - 180px)" : "300px",
            background: toggleMainPage() ? "#000" : "#121212",
          }}
          transition={{ duration: 0.6, easing: "ease" }}
        >
          <Presence>
            <Show when={!toggleMainPage()}>
              <Motion.div
                class="mainDescriptionContent"
                initial={{
                  opacity: 0,
                  x: "-100%",
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: "-100%",
                }}
                transition={{ duration: 0.6, easing: "ease" }}
              >
                <div class="mainDescriptionHeader">
                  <p class="mainDescriptionDate">{imageObj.date}</p>
                  <h3 class="mainDescriptionTitle">{imageObj.title}</h3>
                  <p class="mainDescriptionAttribute">{imageObj.attr}</p>
                  <div class="mainDescriptionAuthors">
                    <img
                      class="mainDescriptionAuthorImage"
                      src={imageObj.authorImg}
                    />
                    <div class="mainDescriptionAuthor">
                      <p class="mainDescriptionAuthorName">
                        {imageObj.authorName}
                      </p>
                      <p class="mainDescriptionAuthorYear">
                        {imageObj.authorYear}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  class="mainDescriptionBody"
                  innerHTML={imageObj.content}
                ></div>
              </Motion.div>
            </Show>
          </Presence>
          <div class="mainImageBottomBar">
            <button onClick={changeToggle} class="mainImageRoundBtn">
              <Show
                when={toggleMainPage()}
                fallback={<VsLayoutCentered size={17} />}
              >
                <VsLayoutActivitybarRight size={17} />
              </Show>
            </button>
            <button onClick={handleGetNextImage} class="mainImageRoundBtn">
              <Show
                when={toggleButton()}
                fallback={<FaRegularCircle size={15} />}
              >
                <FaRegularCircleDot size={15} />
              </Show>
            </button>
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default MainLayout;
