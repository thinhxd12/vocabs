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
import { createMs } from "@solid-primitives/raf";
import {
  createIntervalCounter,
  createPolled,
  createTimeoutLoop,
  createTimer,
  makeTimer,
} from "@solid-primitives/timer";

const Text: Component<{}> = (props) => {
  const [count, setCount] = createSignal(0);
  const legn = 10;

  const callback = () => {
    if (count() < legn) {
      setCount(count() + 1);
    } else stopautoplay();
  };

  // createPolled(() => callback(), 1000);

  const [paused, setPaused] = createSignal(true);
  const [delay, setDelay] = createSignal(1000);
  // createTimer(callback, () => !paused() && delay(), setInterval);
  // createTimer(callback, delay(), setInterval);

  const startautoplay = () => {
    callback();
    setPaused(!paused());
  };
  const pauseautoplay = () => {
    setPaused(!paused());
  };
  const stopautoplay = () => {
    setPaused(!paused());
    setCount(0);
  };
  return (
    <div class="relative h-screen w-screen">
      <div class="absolute z-30 flex items-start text-white">
        <button onClick={startautoplay} class="mr-2 rounded-1 border px-1">
          start
        </button>
        <button onClick={pauseautoplay} class="mr-2 rounded-1 border px-1">
          pause
        </button>
        <button onClick={stopautoplay} class="mr-2 rounded-1 border px-1">
          stop
        </button>
      </div>
      <img
        class="absolute z-10 h-full w-full object-cover brightness-90"
        src="https://res.public.onecdn.static.microsoft/creativeservice/03eaa581-ff4d-0bc4-b161-84295b10bcea_desktop-b004_cloudyvalleydolomites_adobestock_469430780_3840x2160_1689173699682.jpg"
      />
      <div class="w-main no-scrollbar absolute left-1/2 z-30 h-full -translate-x-1/2 overflow-y-scroll">
        <h1 class="text-[90px] text-white">{count()}</h1>
      </div>
    </div>
  );
};

export default Text;
