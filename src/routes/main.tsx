import {
  useAction,
  type RouteDefinition,
  RouteSectionProps,
} from "@solidjs/router";
import { Show, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { getUser } from "~/api";
import { getDataImage } from "~/api/api";
import Bottom from "~/components/bottom";
import { ImageType } from "~/types";
import { URL_IMAGE_MAIN_PAGE } from "~/utils";
import "/public/styles/main.scss";
import { GlobalContextProvider } from "~/globalcontext/store";
import { Motion, Presence } from "solid-motionone";

export const route = {
  load: () => getUser(),
} satisfies RouteDefinition;

const MainLayout = (props: RouteSectionProps) => {
  const getDataImageAction = useAction(getDataImage);

  const mockObj = {
    image: "",
    date: "",
    title: "",
    attr: "",
    authorImg: "",
    authorName: "",
    authorYear: "",
    content: "",
    nextImageUrl: "",
  };

  const [imageObj, setImageObj] = createStore<ImageType>(mockObj);

  const getNextImageData = async (url: string) => {
    const result = await getDataImageAction(url);
    setImageObj(result!);
  };

  //Wakeup sever render after 14 minutes
  const getWakeup = async () => {
    const url = "https://myapp-9r5h.onrender.com/wakeup";
    const response = await fetch(url);
    const result = response.json();
    return result;
  };

  onMount(() => {
    getNextImageData(URL_IMAGE_MAIN_PAGE);
    getWakeup();
    setInterval(() => {
      getWakeup();
    }, 840000);
  });

  const [toggleMainPage, setToggleMainPage] = createSignal<boolean>(false);
  const changeToggle = () => {
    setToggleMainPage(!toggleMainPage());
  };

  const handleGetNextImage = () => {
    getNextImageData(imageObj.nextImageUrl!);
  };

  return (
    <div>
      <div class="main">
        <Motion.div
          class="mainImageContainer"
          animate={{
            maxWidth: toggleMainPage() ? "calc(50vw - 180px)" : "unset",
          }}
          transition={{ duration: 0.6 }}
        >
          <Presence>
            <Show when={!toggleMainPage()}>
              <Motion.div
                class="mainImageContentAnimation"
                initial={{
                  opacity: 0,
                  x: "-100%",
                  scale: 0.6,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: "-100%",
                  scale: 0.6,
                }}
                transition={{ duration: 0.3 }}
              >
                <img class="mainImage" src={imageObj.image} />
                <img class="mainImageBlurred" src={imageObj.image} />
              </Motion.div>
            </Show>
          </Presence>
          <div class="mainImageBottomBar">
            <button onClick={handleGetNextImage} class="mainImageRoundBtn">
              &#924;
            </button>
            <button onClick={changeToggle} class="mainImageRoundBtn">
              Ψ
            </button>
          </div>
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
            background: toggleMainPage() ? "#000" : "#19191c",
          }}
          transition={{ duration: 0.6 }}
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
                transition={{ duration: 0.3 }}
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
        </Motion.div>
      </div>
    </div>
  );
};

export default MainLayout;
