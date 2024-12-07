import {
  Component,
  createEffect,
  createSignal,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import { Motion } from "solid-motionone";
import FlipNumber from "~/components/FlipNumber";
import ImageLoader from "~/components/ImageLoader";
import TickStatic from "~/components/TickStatic";
import { Raindrops, RainRenderer } from "~/lib/weather";
import { Canvas, createCanvas, loadImage } from "canvas";

const Text: Component<{}> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let textureFg: Canvas;
  let textureFgCtx: any;
  let textureBg: Canvas;
  let textureBgCtx: any;

  const textureBgSize = {
    width: 900,
    height: 1900,
  };

  const textureFgSize = {
    width: 45,
    height: 95,
  };

  const defaultOptions = {
    minR: 10,
    maxR: 40,
    maxDrops: 900,
    rainChance: 0.3,
    rainLimit: 3,
    dropletsRate: 50,
    dropletsSize: [2, 4],
    dropletsCleaningRadiusMultiplier: 0.43,
    raining: true,
    globalTimeScale: 1,
    trailRate: 1,
    autoShrink: true,
    spawnArea: [-0.1, 0.95],
    trailScaleRange: [0.2, 0.5],
    collisionRadius: 0.65,
    collisionRadiusIncrease: 0.01,
    dropFallMultiplier: 1,
    collisionBoostMultiplier: 0.05,
    collisionBoost: 1,
  };

  const defaultRain = {
    raining: true,
    minR: 20,
    maxR: 50,
    rainChance: 0.35,
    rainLimit: 6,
    dropletsRate: 50,
    dropletsSize: [3, 5.5],
    trailRate: 1,
    trailScaleRange: [0.25, 0.35],
    collisionRadiusIncrease: 2e-4,
  };

  const weatherTypes = {
    rain: {
      rainChance: 0.35,
      dropletsRate: 50,
      raining: true,
    },
    storm: {
      maxR: 55,
      rainChance: 0.4,
      dropletsRate: 80,
      dropletsSize: [3, 5.5],
      trailRate: 2.5,
      trailScaleRange: [0.25, 0.4],
    },
    fallout: {
      minR: 30,
      maxR: 60,
      rainChance: 0.35,
      dropletsRate: 20,
      trailRate: 4,
      collisionRadiusIncrease: 0,
    },
    drizzle: {
      minR: 10,
      maxR: 40,
      rainChance: 0.15,
      rainLimit: 2,
      dropletsRate: 10,
      dropletsSize: [3.5, 6],
    },
    sunny: {
      rainChance: 0,
      rainLimit: 0,
      droplets: 0,
      raining: false,
    },
  };

  let raindrops: Raindrops;
  let renderer: RainRenderer;

  const dpi = 1;

  let canvasWidth = 360;
  // let canvasHeight = window.innerHeight - 34;
  let canvasHeight = 540;

  const generateTextures = (fg: any, bg: any, alpha = 1) => {
    textureFgCtx = textureFg.getContext("2d")!;
    textureBgCtx = textureBg.getContext("2d")!;
    textureFgCtx.globalAlpha = alpha;
    textureFgCtx.drawImage(fg, 0, 0, textureFgSize.width, textureFgSize.height);

    textureBgCtx.globalAlpha = alpha;
    textureBgCtx.drawImage(bg, 0, 0, textureBgSize.width, textureBgSize.height);
  };

  const loadTextures = async () => {
    const dropAlpha = loadImage("/assets/openmeteo/drop-alpha.png");
    const dropColor = loadImage("/assets/openmeteo/drop-color.png");

    const textureDayRainFg = loadImage(
      "/assets/openmeteo/weather/day-rain-fg.jpg",
    );
    const textureDayBg = loadImage("/assets/openmeteo/weather/day-bg.webp");

    const imagesData = await Promise.all([
      dropAlpha,
      dropColor,
      textureDayRainFg,
      textureDayBg,
    ]);

    // const dpi = window.devicePixelRatio;
    // fix for mobile
    const dpi = 1;

    let canvasWidth = 360;
    // let canvasHeight = window.innerHeight - 34;
    let canvasHeight = 540;

    canvasRef!.width = Math.floor(canvasWidth * dpi);
    canvasRef!.height = Math.floor(canvasHeight * dpi);
    canvasRef!.style.width = canvasWidth + "px";
    canvasRef!.style.height = canvasHeight + "px";

    raindrops = new Raindrops(
      canvasWidth,
      canvasHeight,
      dpi,
      imagesData[0],
      imagesData[1],
      {
        rainChance: 0,
        rainLimit: 0,
        droplets: 0,
        raining: false,
      },
    );

    textureFg = createCanvas(textureFgSize.width, textureFgSize.height);
    textureBg = createCanvas(textureBgSize.width, textureBgSize.height);

    generateTextures(imagesData[2], imagesData[3]);

    renderer = new RainRenderer(
      canvasRef!,
      raindrops.canvas!,
      textureFg,
      textureBg,
      null,
      {
        brightness: 1.04,
        alphaMultiply: 6,
        alphaSubtract: 3,
      },
    );
  };

  const setupWeather = async () => {
    const textureDayRainFg = loadImage(
      "/assets/openmeteo/weather/day-rain-fg.jpg",
    );
    const textureDayRainBg = loadImage(
      "/assets/openmeteo/weather/day-rain-bg.jpg",
    );

    const textureNightRainFg = loadImage(
      "/assets/openmeteo/weather/night-rain-fg.jpg",
    );
    const textureNightRainBg = loadImage(
      "/assets/openmeteo/weather/night-rain-bg.jpg",
    );

    const textureDayBg = loadImage("/assets/openmeteo/weather/day-bg.webp");
    const textureNightBg = loadImage("/assets/openmeteo/weather/night-bg.webp");

    const imagesData = await Promise.all([
      textureDayRainFg,
      textureDayRainBg,
      textureNightRainFg,
      textureNightRainBg,
      textureDayBg,
      textureNightBg,
    ]);

    let weatherType = "";

    raindrops.options = {
      ...defaultOptions,
      ...defaultRain,
      ...weatherTypes.rain,
    };

    raindrops.clearDrops();
    generateTextures(imagesData[0], imagesData[4]);
    renderer.updateTextures();
  };

  onMount(async () => {
    loadTextures();
    setupWeather();
  });

  return (
    <div>
      <canvas ref={canvasRef} />
      {/* <canvas ref={canvasRef} class="h-[450px] w-[300px]" /> */}
    </div>
  );
};

export default Text;
