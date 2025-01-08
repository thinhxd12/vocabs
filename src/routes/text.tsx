import { FaSolidLocationDot } from "solid-icons/fa";
import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import toast, { Toaster } from "solid-toast";
import {
  editVocabularyItem,
  getLayoutImage,
  getOedSoundURL,
  getTextDataWebster,
  getTranslateData,
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

  const [state, setstate] = createSignal<VocabMeaningType[]>();

  const notify = async () => {
    const has = "aaaaaaaaaaaaaaaaaaaaa";

    const newItemMeaning = item.meanings.map((item) => {
      item.definitions = item.definitions.map((el) => {
        return { ...el, hash: el.image ? has : "" };
      });
      return { ...item };
    });
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

  return (
    <div class="relative h-screen w-screen">
      <div class="absolute z-30 flex items-start text-white">
        <button onClick={notify}>run</button>
      </div>
      <img
        class="absolute z-10 h-full w-full object-cover brightness-90"
        src="https://res.public.onecdn.static.microsoft/creativeservice/03eaa581-ff4d-0bc4-b161-84295b10bcea_desktop-b004_cloudyvalleydolomites_adobestock_469430780_3840x2160_1689173699682.jpg"
      />
      <div class="w-main no-scrollbar absolute left-1/2 z-30 h-full -translate-x-1/2 overflow-y-scroll">
        <For each={state()}>
          {(entry) => (
            <div class="w-content light-layout mb-2 rounded-3">
              <div class="flex justify-between px-2">
                <span class="font-roslindale text-8 font-500">
                  {entry.partOfSpeech}
                </span>
                <span class="text-4.5 leading-6 opacity-0 hover:opacity-100">
                  {entry.translation.join("-")}
                </span>
              </div>

              <For each={entry.definitions}>
                {(el) => (
                  <>
                    <Show when={el.example.sentence}>
                      <div class="relative mb-3 flex min-h-[210px] w-full flex-col justify-between">
                        <Show when={el.image}>
                          <img
                            class="absolute h-full w-full object-cover brightness-50"
                            src={el.image}
                          />
                        </Show>
                        <div class="z-30 flex flex-1 items-center p-6">
                          <h2 class="text-center text-6 leading-9">
                            <span
                              class="definition-example"
                              innerHTML={el.example.sentence}
                            ></span>
                          </h2>
                        </div>

                        <div class="definition-credit relative z-30">
                          <span
                            style={{
                              "font-variant": "small-caps",
                            }}
                          >
                            {el.example.author}
                          </span>
                          <span class="!font-700 uppercase">
                            {el.example.title}
                          </span>
                          <span>{el.example.year}</span>
                        </div>
                      </div>
                    </Show>
                    <For each={el.definition}>
                      {(def) => (
                        <p class="flex pl-1 text-4.5 font-500 leading-6">
                          <span class="mt-0.1 inline-block min-w-4 text-4.5 font-700 uppercase">
                            {def.letter}
                          </span>
                          {def.num && (
                            <small class="inline-block min-w-4 pr-0.5">
                              {def.num}
                            </small>
                          )}
                          <span>{def.sense}</span>
                        </p>
                      )}
                    </For>
                  </>
                )}
              </For>

              <Show when={entry.synonyms.length}>
                <div class="flex items-center justify-start px-1 pb-1 pt-0.1">
                  <RiArrowsCornerDownRightFill
                    size={16}
                    class="ml-0.1 mr-0.5 mt-0.5"
                  />
                  <span class="text-4.5 font-500 leading-5.5 text-black">
                    {entry.synonyms.join(", ")}
                  </span>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default Text;
