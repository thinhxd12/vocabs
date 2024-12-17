import { AiOutlineLeft, AiOutlineRight } from "solid-icons/ai";
import { Component, createSignal, For, onMount } from "solid-js";
import { getLayoutImage } from "~/lib/server";
import { LayoutImageType } from "~/types";

const Art: Component<{}> = (props) => {
  let scrollContainer: HTMLUListElement | undefined;

  const defaultLayoutImageData: LayoutImageType = {
    mainImage: "/images/main-image.webp",
    shareDate: "01 July 2023",
    title: "The Red Buoy, Saint-Tropez",
    attr: "Oil on canvas • 81 × 65 cm",
    authorImage: "/images/main-author.webp",
    author: "Paul Signac",
    authorYears: "1895",
    content:
      "<p>Hello July!</p>\n<p>Time for an artist who in my opinion, created one of the best images of Summer ... the French Pointillist, Paul Signac!</p>\n<p>Signac was a painter and an avid sailor. He created several marine paintings, including a series of views over the port of Saint-Tropez, where he settled in 1892.</p>\n<p>In this vertical painting, the eye initially fixes on the vibrant red-orange buoy, which contrasts with the water's deep blue. The reflections of the buildings then lead the viewer's eye to the background, with lighter tones. The divisionist technique and the combination of pure colors allowed Signac to depict a glittering sea, and the glimmering light of the Midi.</p>\n<p>The Pointillist painters differ from the Impressionists, most notably in the scientific dimension of their work. Regarding the rigor of his initial work, Signac's strokes have widened for this series; the division of tones is more relaxed.</p>\n<p>P.S. Our sale is on! Save 20% on our <a href=\"https://shop.dailyartmagazine.com/product-category/prints/?utm_campaign=DailyArt-Prints&amp;utm_medium=text&amp;utm_source=DailyArtapp&amp;utm_term=fine-art-prints\">Prints Collection</a> and order a high-quality reproduction of the greatest masterpieces.&nbsp;</p>",
    alsoItems: [
      {
        url: "https://www.getdailyart.com/en/24707/mykola-pymonenko/the-idyll",
        img: "https://img.getdailyart.com/90559/conversions/%D0%9F%D0%B8%D0%BC%D0%BE%D0%BD%D0%B5%D0%BD%D0%BA%D0%BEg-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/21983/kazimir-malevich/suprematism",
        img: "https://img.getdailyart.com/86179/conversions/img-20161127583ad61ba3194-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/23101/joaquin-sorolla/maria-en-los-jardines-de-la-granja",
        img: "https://img.getdailyart.com/87267/conversions/img-201908025d448433c009e-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/23160/kazimir-malevich/landscape-with-a-yellow-house-winter-landscape",
        img: "https://img.getdailyart.com/87322/conversions/img-201909165d7f659e7feef-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/18837/winslow-homer/the-fox-hunt",
        img: "https://img.getdailyart.com/85831/conversions/vsyVHIjxOa_retina-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/24134/arkhip-kuindzhi/red-sunset-on-the-dnipro",
        img: "https://img.getdailyart.com/88264/conversions/img-20220418625d5784d37dc-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/24055/raphaelle-peale/still-life-with-strawberries-and-nuts",
        img: "https://img.getdailyart.com/88186/conversions/img-2022020862027f80d3c4f-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/23400/jean-francois-millet/the-gleaners",
        img: "https://img.getdailyart.com/87549/conversions/img-202004025e86142a4e62a-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/18153/pierre-auguste-renoir/the-swing",
        img: "https://img.getdailyart.com/89097/conversions/img-201807105b45029523342-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/18150/fernand-khnopff/i-lock-my-door-upon-myself",
        img: "https://img.getdailyart.com/85152/conversions/A2ZHQ427-486M-21K2-M90L-A6KDSAX4RAF-3A9-ZS30ZC8M1AKLQ9C_retina-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/23305/charles-meryon/le-stryge-the-vampire",
        img: "https://img.getdailyart.com/87462/conversions/img-202004025e85da1b4b782-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/18691/paul-cezanne/still-life-with-apples-and-oranges",
        img: "https://img.getdailyart.com/85687/conversions/img-201808035b6456872b2a0-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/19/edouard-manet/banks-of-the-seine-at-argenteuil",
        img: "https://img.getdailyart.com/89655/conversions/2560px-Banks_of_the_Seine_at_Argenteuil_Edouard_Manet_1874-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/17829/paul-peel/after-the-bath",
        img: "https://img.getdailyart.com/88954/conversions/7hcuioHYtq_retina-small.jpg",
      },
      {
        url: "https://www.getdailyart.com/en/24370/wilhelm-leibl/right-hand-of-the-girl-with-carnation",
        img: "https://img.getdailyart.com/89554/conversions/img-2023010363b481c60080a-small.jpg",
      },
    ],
  };

  const [layoutImageData, setLayoutImageData] = createSignal<LayoutImageType>(
    defaultLayoutImageData,
  );

  const handleGetImageData = async (url: string | undefined) => {
    if (!url) return;
    const data = await getLayoutImage(url);
    if (data) setLayoutImageData(data);
    setCurrentAlsoItem(0);
    scrollContainer &&
      scrollContainer.scrollTo({
        left: 0,
      });
  };

  const [currentAlsoItem, setCurrentAlsoItem] = createSignal<number>(0);

  onMount(() => {
    if (scrollContainer)
      scrollContainer.addEventListener("wheel", (event) => {
        event.preventDefault();
        scrollContainer.scrollBy({
          left: event.deltaY < 0 ? -102 : 102,
        });
      });
  });

  return (
    <>
      <div class="light-layout relative flex h-full w-full rounded-3">
        <div class="flex h-full w-1/4 flex-col bg-black/15 p-4">
          <div class="w-full">
            <p class="text-4 font-500 leading-5 text-secondary-white">
              {layoutImageData().shareDate}
            </p>
            <h3 class="mb-2 font-roslindale text-8 font-600 leading-10 text-white">
              {layoutImageData().title}
            </h3>
          </div>

          <div class="flex h-1/2 w-full flex-grow flex-col">
            <div class="rounded-2 bg-white/15 p-2">
              <div class="flex">
                <img
                  src={layoutImageData().authorImage}
                  class="h-10 w-10 rounded-2 object-cover shadow"
                />
                <span class="truncate text-wrap pl-3 text-4 font-400 text-white">
                  {layoutImageData().author}
                </span>
              </div>
            </div>
            <div
              innerHTML={layoutImageData().content}
              class="no-scrollbar my-3 w-full flex-grow overflow-y-scroll text-4 font-400 leading-5.5 text-secondary-white *:indent-3"
              style="mask-image: linear-gradient(to top, transparent, #fff 5%, #fff 100%)"
            ></div>
          </div>
        </div>

        <div class="h-full w-3/4">
          <div class="flex h-full w-full flex-col items-center px-[10%] pb-[10%] pt-[5%]">
            <img
              src={layoutImageData().mainImage}
              class="max-h-full max-w-full rounded-4 object-cover shadow-xl shadow-black/80"
            />
            <div class="relative z-50 mt-5 flex w-full justify-between px-9">
              <p class="text-4 font-400 leading-5 text-white">
                {layoutImageData().attr}
              </p>
              <p class="pl-1 text-3.5 text-white">
                {layoutImageData().authorYears}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 flex items-center p-2">
        <div class="dark-layout mx-auto flex items-center justify-center rounded-3 px-4">
          <button
            class="btn-bookmark mr-1"
            onClick={() => {
              if (scrollContainer) {
                let index = currentAlsoItem();
                if (index === 0) return;
                scrollContainer.scrollTo({
                  left: (index - 1) * 51,
                  behavior: "smooth",
                });
                setCurrentAlsoItem(index - 1);
              }
            }}
          >
            <AiOutlineLeft size={15} />
          </button>
          <ul
            ref={scrollContainer}
            class="no-scrollbar flex max-w-[300px] flex-nowrap items-stretch justify-start gap-2 overflow-x-auto scroll-smooth py-2"
          >
            <For each={layoutImageData().alsoItems}>
              {(item) => (
                <li
                  onClick={() => handleGetImageData(item.url)}
                  class="h-[45px] min-h-[45px] w-[45px] min-w-[45px] cursor-pointer rounded-2 shadow-md shadow-black/30"
                >
                  <img
                    srcset={item.img}
                    class="h-full w-full rounded-2 object-cover"
                    loading="lazy"
                  />
                </li>
              )}
            </For>
          </ul>
          <button
            onClick={() => {
              if (scrollContainer) {
                let index = currentAlsoItem() + 1;
                if (index + 6 == layoutImageData().alsoItems.length) index = 0;
                scrollContainer.scrollTo({
                  left: (index + 1) * 51,
                  behavior: "smooth",
                });
                setCurrentAlsoItem(index);
              }
            }}
            class="btn-bookmark ml-1"
          >
            <AiOutlineRight size={12} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Art;
