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
  let canvasWidth: number;
  let canvasHeight: number;
  let img: HTMLImageElement;

  const hearSvg =
    '<svg stroke-width="0" color="red" fill="red" viewBox="0 0 16 16" size="15" class="text-white" height="15" width="15" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"></path></svg>';

  const notify = () => {
    generateRandomPositions();
    img = new Image();
    const svgBlob = new Blob([hearSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
    img.onload = () => {
      animate();
    };
  };

  const [positions, setPositions] = createSignal<
    { x: number; y: number; speed: number; targetX: number }[]
  >([]);
  const hearts = Array.from({ length: 99 }, (_, i) => i);

  const generateRandomPositions = () => {
    if (canvasRef) {
      canvasRef.width = window.innerWidth;
      canvasRef.height = window.innerHeight;
      canvasWidth = canvasRef.width;
      canvasHeight = canvasRef.height;

      const initialPositions = [];
      for (let i = 0; i < hearts.length; i++) {
        initialPositions.push({
          x: Math.random() * canvasWidth,
          y: canvasHeight + 30,
          speed: 2 + Math.random() * 4,
          targetX: Math.random() * canvasWidth,
        });
      }
      setPositions(initialPositions);
    }

    console.log(positions());
  };

  const drawImages = () => {
    if (canvasRef) {
      const ctx = canvasRef.getContext("2d")!;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      positions().forEach((pos, index) => {
        ctx.drawImage(img, pos.x, pos.y, 30, 30);
      });
    }
  };

  const updatePositions = () => {
    setPositions((prevPositions) =>
      prevPositions.map((pos) => {
        let newY = pos.y - pos.speed;
        let newX = pos.x;

        if (pos.x < pos.targetX) {
          newX = pos.x + 1;
        } else if (pos.x > pos.targetX) {
          newX = pos.x - 1;
        }
        if (newY < -30) {
          newY = -31;
          pos.x = Math.random() * canvasRef!.width;
          pos.speed = 3 + Math.random() * 6;
        }
        return { ...pos, x: newX, y: newY };
      }),
    );
  };

  const allImagesGone = () => {
    return positions().every((pos) => pos.y < -30);
  };

  const animate = () => {
    updatePositions();
    drawImages();
    if (!allImagesGone()) {
      ani = requestAnimationFrame(animate);
    } else {
      console.log("All images have moved off the canvas. Animation stopped.");
      notify1();
    }
  };

  const notify1 = () => {
    cancelAnimationFrame(ani);
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
