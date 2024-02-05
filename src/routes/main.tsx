import {
  useAction,
  type RouteDefinition,
  RouteSectionProps,
  A,
  useSubmission,
} from "@solidjs/router";
import {
  createContext,
  createEffect,
  createResource,
  createSignal,
  onMount,
} from "solid-js";
import { createStore } from "solid-js/store";
import { getUser, logout } from "~/api";
import { getDataImage, getImageFromUnsplash } from "~/api/api";
import Bottom from "~/components/bottom";
import { ImageType } from "~/types";
import { URL_IMAGE_MAIN_PAGE } from "~/utils";
import "/public/styles/main.scss";
import { createPolled } from "@solid-primitives/timer";
import { OcChevronleft2, OcChevronright2 } from "solid-icons/oc";

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

  return (
    <div>
      <div class="main">
        <div class="mainImageContainer">
          <img class="mainImage" src={imageObj.image} />
          <img class="mainImageBlurred" src={imageObj.image} />
          <button
            onClick={() => getNextImageData(imageObj.nextImageUrl!)}
            class="mainImageRoundBtn"
          >
            <svg
              width="8"
              height="14"
              viewBox="0 0 8 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 1L7.5 7L1.5 13"
                stroke="white"
                stroke-linecap="square"
                stroke-linejoin="round"
              ></path>
            </svg>
          </button>
        </div>

        <div class="mainImageContent">
          {props.children}
          <Bottom />
        </div>

        <div class="mainDescriptionContainter">
          <div class="mainDescriptionContent">
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
                  <p class="mainDescriptionAuthorName">{imageObj.authorName}</p>
                  <p class="mainDescriptionAuthorYear">{imageObj.authorYear}</p>
                </div>
              </div>
            </div>
            <div class="mainDescriptionBody" innerHTML={imageObj.content}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
