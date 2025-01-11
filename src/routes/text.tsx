import { FaSolidLocationDot } from "solid-icons/fa";
import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
  Suspense,
  untrack,
} from "solid-js";
import toast, { Toaster } from "solid-toast";
import {
  editVocabularyItem,
  getLayoutImage,
  getOedSoundURL,
  getTextDataWebster,
  getTranslateData,
  getTranslationArr,
} from "~/lib/server";

import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";
import sharp from "sharp";
import { Buffer } from "buffer";
import Tick from "~/components/Tick";
import FlipCard from "~/components/FlipCard";
import { RiArrowsCornerDownRightFill } from "solid-icons/ri";
import {
  VocabDefinitionsType,
  VocabDefinitionType,
  VocabExampleType,
  VocabMeaningType,
  VocabType,
} from "~/types";
import { InsertVocab } from "~/db/schema";
import Definition from "~/components/Definition";

const Text: Component<{}> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let ani: number;
  let canvasWidth: number;
  let canvasHeight: number;
  let img: HTMLImageElement;

  const [state, setstate] = createSignal<number>(0);

  const makeTranslationText = (arr: VocabMeaningType[]) => {
    return arr
      .map((item) => {
        let part = item.partOfSpeech;
        let mean = item.translation.join("-");
        return " -" + part + "-" + mean;
      })
      .join("");
  };

  const notify = async () => {
    const has = makeTranslationText(item.meanings);

    const newItemMeaning = getTranslationArr(has);
    if (!newItemMeaning) return;
    console.log(has);
    console.log(newItemMeaning);
  };

  const item: VocabType = {
    id: "0194071f-90f8-75d6-85e1-a3a17c972910",
    word: "sham",
    phonetics: "ˈsham",
    number: 144,
    audio:
      "https://www.oxfordlearnersdictionaries.com/media/american_english/us_pron/s/sha/sham_/sham__us_1.mp3",
    meanings: [
      {
        partOfSpeech: "noun",
        definitions: [
          {
            definition: [
              {
                num: "",
                sense: ": a trick that deludes : hoax",
                letter: "",
              },
            ],
            example: {
              year: "28 July 2024",
              title: "Peoplemag",
              author: "Maggie Horton",
              sentence:
                "Complete the set with matching linen sheets, pillowcases, and <b>shams</b>, also on sale for an additional 20 percent off now.",
            },
            hash: "",
            image:
              "https://media.gettyimages.com/id/159307508/photo/job-interview.jpg?s=612x612&w=0&k=20&c=srvyVlB-9SUlIVuKpucAM0okoO5kdKJHDO7lpGtKjFM=",
          },
        ],
        synonyms: ["caricature", "cartoon", "farce"],
        translation: ["giả mạo", "adfasdf asdf"],
      },
      {
        partOfSpeech: "verb",
        definitions: [
          {
            definition: [
              {
                num: "",
                sense:
                  ": to go through the external motions necessary to counterfeit",
                letter: "",
              },
            ],
            example: {
              year: "1 Aug. 2024",
              title: "Los Angeles Times",
              author: "Nathan Solis",
              sentence:
                "The <b>sham</b> citations claimed that residents had not moved their vehicles for scheduled street sweeping, which immediately raised red flags for those familiar with the local parking schedule.",
            },
            hash: "",
            image: "",
          },
        ],
        synonyms: ["act", "affect", "assume"],
        translation: ["giả mạo"],
      },
    ],
  };

  const [hundreds, setHundreds] = createSignal<number>(0);
  const [tens, setTens] = createSignal<number>(0);
  const [ones, setOnes] = createSignal<number>(0);

  createEffect(() => {
    const v = state();
    untrack(() => {
      setHundreds(Math.floor(v / 100));
      setTens(Math.floor((v % 100) / 10));
      setOnes(v % 10);
    });
  });

  return (
    <div class="relative h-screen w-screen">
      <div class="absolute z-30 flex items-start text-white">
        <button
          onClick={() => setstate(100)}
          class="mr-2 rounded-1 border px-1"
        >
          100
        </button>
        <button
          onClick={() => setstate(127)}
          class="mr-2 rounded-1 border px-1"
        >
          127
        </button>
        <button onClick={() => setstate(10)} class="mr-2 rounded-1 border px-1">
          10
        </button>
        <button
          onClick={() => setstate(223)}
          class="mr-2 rounded-1 border px-1"
        >
          223
        </button>
      </div>
      <img
        class="absolute z-10 h-full w-full object-cover brightness-90"
        src="https://res.public.onecdn.static.microsoft/creativeservice/03eaa581-ff4d-0bc4-b161-84295b10bcea_desktop-b004_cloudyvalleydolomites_adobestock_469430780_3840x2160_1689173699682.jpg"
      />
      <div class="w-main no-scrollbar absolute left-1/2 z-30 h-full -translate-x-1/2 overflow-y-scroll">
        <div class="relative flex font-helvetica text-[40px] font-600 leading-[36px]">
          <Tick number={hundreds()} delay={300} />
          <Tick number={tens()} delay={150} />
          <Tick number={ones()} image={state() === 1} />
        </div>
      </div>
    </div>
  );
};

export default Text;
