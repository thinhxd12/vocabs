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
  let canvasRef: HTMLCanvasElement | undefined;
  let ani: number;

  const [result, setResult] = createSignal<any>();
  const [number, setNumber] = createSignal<number>(9);

  const hearSvg =
    '<svg stroke-width="0" color="red" fill="red" viewBox="0 0 16 16" size="15" class="text-white" height="15" width="15" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"></path></svg>';

  const notify = () => {
    const img = new Image();
    const svgBlob = new Blob([hearSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;

    img.onload = () => {
      drawCanvas(img);
      URL.revokeObjectURL(url);
    };
  };

  const [rectx, setrectx] = createSignal<number>(0);
  const drawCanvas = (img: HTMLImageElement) => {
    // let img = new Image();
    // img.onload = function () {
    //   ctx.drawImage(img, 0, 0);
    // };
    // img.src =
    //   "http://upload.wikimedia.org/wikipedia/commons/d/d2/Svg_example_square.svg";

    // ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    // ctx.fillStyle = "blue";
    // ctx.fillRect(rectx(), 100, 40, 80);
    // setrectx(rectx() + 2);

    console.log(1);

    if (canvasRef) {
      const ctx = canvasRef.getContext("2d")!;
      canvasRef.width = window.innerWidth;
      canvasRef.height = window.innerHeight;
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
      ctx.drawImage(img, rectx(), 100, 30, 30); // Draw SVG with size 30x30
      setrectx(rectx() + 3);
      // Release the blob URL after the image is loaded

      if (rectx() <= canvasRef.width) {
        // ani = requestAnimationFrame(drawCanvas(img));
      }
    }
  };

  const notify1 = () => {
    cancelAnimationFrame(ani);
    setrectx(0);
    if (canvasRef) {
      const ctx = canvasRef.getContext("2d")!;
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    }
  };

  return (
    <div class="relative h-screen w-screen">
      <div class="flex items-start">
        <button onClick={notify} class="mr-2">
          run
        </button>
        <button onClick={notify1}>reset</button>
      </div>
      <canvas ref={canvasRef} class="absolute h-full w-full object-cover" />

      <canvas />
    </div>
  );
};

export default Text;
