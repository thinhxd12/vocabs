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
import FlipCard from "~/components/FlipCard";

const Text: Component<{}> = (props) => {
  const [result, setResult] = createSignal<any>();
  const [number, setNumber] = createSignal<number>(9);

  const notify = () => {
    setNumber(100);
  };

  const notify1 = () => {
    setNumber(99);
  };

  const notify2 = () => {
    setNumber(27);
  };

  return (
    <div class="flex flex-col items-start">
      <button onClick={notify}>100</button>
      <button onClick={notify1}>99</button>
      <button onClick={notify2}>27</button>
      <FlipCard number={number()} />
    </div>
  );
};

export default Text;
