import {
  useAction,
  type RouteDefinition,
  RouteSectionProps,
  A,
} from "@solidjs/router";
import { createResource, createSignal } from "solid-js";
import { getUser, logout } from "~/api";
import { getDataImage } from "~/api/api";
import Bottom from "~/components/bottom";
import { URL_IMAGE_MAIN_PAGE } from "~/utils";

export const route = {
  load: () => getUser(),
} satisfies RouteDefinition;

const MainLayout = (props: RouteSectionProps) => {
  const [imageUrl, setImageUrl] = createSignal<string>(URL_IMAGE_MAIN_PAGE);
  const [focusMode, setFocusMode] = createSignal<boolean>(false);

  const getDataImageAction = useAction(getDataImage);

  const [imageObj, { mutate, refetch }] = createResource(
    imageUrl,
    getDataImageAction
  );

  return (
    <div>
      <div class="main">
        <div class="mainImageContainer">
          <img class="mainImage" src={imageObj()?.image} />
          <img class="mainImageBlurred" src={imageObj()?.image} />
          <button
            onClick={() => setImageUrl(imageObj()?.nextImageUrl!)}
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
              <p class="mainDescriptionDate">{imageObj()?.date}</p>
              <h3 class="mainDescriptionTitle">{imageObj()?.title}</h3>
              <p class="mainDescriptionAttribute">{imageObj()?.attr}</p>
              <div class="mainDescriptionAuthors">
                <img
                  class="mainDescriptionAuthorImage"
                  srcset={imageObj()?.authorImg}
                />
                <div class="mainDescriptionAuthor">
                  <p class="mainDescriptionAuthorName">
                    {imageObj()?.authorName}
                  </p>
                  <p class="mainDescriptionAuthorYear">
                    {imageObj()?.authorYear}
                  </p>
                </div>
              </div>
            </div>
            <div
              class="mainDescriptionBody"
              innerHTML={imageObj()?.content}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
