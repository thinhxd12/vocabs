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
} from "~/lib/server";

import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";
import sharp from "sharp";
import { Buffer } from "buffer";
import Tick from "~/components/Tick";

const Text: Component<{}> = (props) => {
  const [result, setResult] = createSignal<any>();
  const [number, setNumber] = createSignal<number>(9);

  const notify = () => {
    if (number() > 0) setNumber(number() - 1);
  };

  const notify1 = () => {
    setNumber(78);
  };

  return (
    <div class="flex flex-col items-start">
      <button onClick={notify}>click</button>
      <button onClick={notify1}>click1</button>
      <div class="flex font-helvetica text-[40px] font-600 leading-[36px] text-[#f4f4f4]">
        <Tick number={number()} />
      </div>
    </div>
  );
};

export default Text;
