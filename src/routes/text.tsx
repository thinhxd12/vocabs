import { FaSolidLocationDot } from "solid-icons/fa";
import {
  Component,
  createEffect,
  createSignal,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import toast, { Toaster } from "solid-toast";
import Collapsible from "~/components/Collapsible";
import {
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

const Text: Component<{}> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let ani: number;
  let canvasWidth: number;
  let canvasHeight: number;
  let img: HTMLImageElement;

  const [state, setstate] = createSignal(9);

  const notify = async () => {
    // state() !== 0 ? setstate(state() - 1) : setstate(9);
    setstate(Math.floor(Math.random() * 240) + 1);
  };

  const notify1 = () => {};

  return (
    <div class="relative h-screen w-screen">
      <div class="flex items-start">
        <button onClick={notify} class="mr-2">
          run {state()}
        </button>
        <button onClick={notify1}>reset</button>
      </div>
      <div class="relative flex font-helvetica text-[40px] font-600 leading-[36px]">
        {/* <Tick number={state()} animating /> */}
        <FlipCard number={state()} />
      </div>
    </div>
  );
};

export default Text;
