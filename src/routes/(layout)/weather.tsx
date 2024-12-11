import { Meta, MetaProvider, Title as MetaTitle } from "@solidjs/meta";
import {
  Component,
  createSignal,
  Index,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import {
  FaSolidDroplet,
  FaSolidLocationArrow,
  FaSolidTemperatureLow,
} from "solid-icons/fa";
import { chartOptions, WMOCODE } from "~/lib/utils";
import { Chart, Title, Tooltip, Legend, Colors, Filler } from "chart.js";
import { Line } from "solid-chartjs";
import {
  CurrentlyWeatherType,
  HourlyWeatherType,
  WeatherGeoType,
} from "~/types";
import { navStore } from "~/lib/store";
import {
  getCurrentWeatherData,
  getHourlyWeatherData,
  getMinutelyWeatherData,
  makePrediction,
} from "~/lib/server";
import { format } from "date-fns";
import {
  createCanvas,
  loadImage,
  Raindrops,
  RainRenderer,
} from "~/lib/weather";
import { createAsync } from "@solidjs/router";
import { getUser } from "~/lib/login";

const Weather: Component<{}> = (props) => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************
  let audioRef: HTMLAudioElement | undefined;
  let hourlyRef: HTMLDivElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let textureFg: HTMLCanvasElement;
  let textureFgCtx: any;
  let textureBg: HTMLCanvasElement;
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

  const [audioSrc, setAudioSrc] = createSignal<string>(
    "/assets/assets/sounds/mp3_Ding.mp3",
  );

  const [chartData, setChartData] = createSignal<{
    labels: any[];
    datasets: any[];
  }>({ labels: [], datasets: [] });

  const [currentLocation, setCurrentLocation] = createSignal<WeatherGeoType>(
    navStore.defaultLocation,
  );
  const [current, setCurrent] = createSignal<CurrentlyWeatherType>();
  // const [minutely, setMinutely] = createSignal<FixMinutelyTWeatherType[]>();
  const [hourly, setHourly] = createSignal<HourlyWeatherType[]>();
  const [prediction, setPrediction] = createSignal<string>("");

  const handleRenderWeather = async (num: string) => {
    setCurrentLocation(navStore.locationList[Number(num)]);
    const geo = { lat: currentLocation().lat, lon: currentLocation().lon };
    const data = await Promise.all([
      getCurrentWeatherData(geo),
      getHourlyWeatherData(geo),
      getMinutelyWeatherData(geo),
    ]);
    setupWeather(data[0]!.icon, data[0]!.isDayTime);

    setCurrent(data[0]);
    setHourly(data[1]);
    setPrediction(await makePrediction(data[2]));
    setChartData({
      labels: data[2].map((item) => item.diffTime),
      datasets: [
        {
          label: "",
          data: data[2].map((item) => item.intensity),
          borderColor: "#009bff",
          backgroundColor: "#52a0c1bf",
          yAxisID: "y",
          fill: true,
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: "",
          data: data[2].map((item) => item.probability),
          borderColor: "#f90000",
          yAxisID: "y1",
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1.5,
        },
      ],
    });
  };

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

    const dpi = 1;
    let canvasWidth = 360;
    let canvasHeight = window.innerHeight - 36;

    if (canvasRef) {
      canvasRef.width = Math.floor(canvasWidth * dpi);
      canvasRef.height = Math.floor(canvasHeight * dpi);
      canvasRef.style.width = canvasWidth + "px";
      canvasRef.style.height = canvasHeight + "px";
    }

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

  const setupWeather = async (icon: number, isDay: boolean) => {
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

    switch (icon) {
      case 51:
      case 56:
      case 61:
      case 66:
      case 80:
        setAudioSrc("/assets/sounds/weather/rain_light_2.m4a");
        weatherType = "drizzle";
        break;
      case 53:
      case 57:
      case 63:
      case 81:
        setAudioSrc("/assets/sounds/weather/rain_light.m4a");
        weatherType = "rain";
        break;
      case 55:
      case 65:
      case 67:
      case 82:
      case 95:
      case 96:
      case 99:
        setAudioSrc("/assets/sounds/weather/thunderstorm.m4a");
        weatherType = "storm";
        break;
      case 0:
      case 1:
        current()?.isDayTime
          ? setAudioSrc("/assets/sounds/weather/forest.m4a")
          : setAudioSrc("/assets/sounds/weather/night.m4a");
        weatherType = "sunny";
        break;
      case 71:
      case 73:
      case 75:
      case 77:
        setAudioSrc("/assets/sounds/weather/snow.m4a");
        weatherType = "sunny";
        break;
      default:
        setAudioSrc("/assets/sounds/weather/wind.m4a");
        weatherType = "sunny";
        break;
    }

    if (audioRef) {
      audioRef.load();
      audioRef.addEventListener("canplaythrough", () => {
        audioRef.play();
      });
    }

    raindrops.options = {
      ...defaultOptions,
      ...defaultRain,
      ...weatherTypes[weatherType as keyof typeof weatherTypes],
    };

    raindrops.clearDrops();

    if (weatherType !== "sunny") {
      if (isDay) {
        generateTextures(imagesData[0], imagesData[1]);
        renderer.updateTextures();
      } else {
        generateTextures(imagesData[2], imagesData[3]);
        renderer.updateTextures();
      }
    } else {
      if (isDay) {
        generateTextures(imagesData[0], imagesData[4]);
        renderer.updateTextures();
      } else {
        generateTextures(imagesData[2], imagesData[5]);
        renderer.updateTextures();
      }
    }
  };

  onMount(() => {
    Chart.register(Title, Tooltip, Legend, Colors, Filler);
    loadTextures();
    handleRenderWeather("0");
    if (hourlyRef)
      hourlyRef.addEventListener("wheel", (event) => {
        event.preventDefault();
        hourlyRef.scrollBy({
          left: event.deltaY < 0 ? -60 : 60,
        });
      });
  });

  onCleanup(() => {
    audioRef?.pause();
  });

  return (
    <MetaProvider>
      <MetaTitle>⛅</MetaTitle>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <main class="w-ful relative h-full">
        <audio ref={audioRef} hidden src={audioSrc()} />
        <canvas ref={canvasRef} class="absolute h-full w-full object-cover" />

        <div class="relative z-50 h-full w-full p-2">
          <select
            class="mx-auto block min-h-[29px] w-1/3 cursor-pointer rounded-lg bg-transparent p-1.5 text-center font-sfpro text-7 font-400 leading-7 text-white outline-none"
            style={{ appearance: "none" }}
            onchange={(e) => handleRenderWeather(e.currentTarget.value)}
          >
            <Index each={navStore.locationList}>
              {(item, index) => (
                <option
                  value={index}
                  selected={item().default ? true : false}
                  class="font-sfpro text-4 font-400 leading-4 text-black"
                >
                  {item().name}
                </option>
              )}
            </Index>
          </select>

          <Show
            when={current()}
            fallback={
              <div class="flex h-[141px] w-full items-center justify-center">
                <img src="/assets/svg/loader.svg" width={30} height={7} />
              </div>
            }
          >
            <h1 class="pl-9 text-center font-sfpro text-[99px] font-100 leading-[99px] text-white">
              {Math.round(current()?.temperature || 0)}°
            </h1>

            <div class="flex w-full items-center justify-center pr-1">
              <span class="font-sfpro text-5.5 font-400 leading-6 text-white">
                {current()!.isDayTime
                  ? WMOCODE[current()!.icon].day.description
                  : WMOCODE[current()!.icon].night.description}
              </span>
              <img
                src={
                  current()!.isDayTime
                    ? WMOCODE[current()!.icon].day.image
                    : WMOCODE[current()!.icon].night.image
                }
                width={30}
                class="ml-1"
                style={{
                  filter: "drop-shadow(0 1px 3px black)",
                }}
              />
            </div>

            <div class="flex w-full items-center justify-center pr-1">
              <div class="mx-1.5 flex items-center justify-center text-white">
                <FaSolidTemperatureLow size={10} />
                <span class="ml-1 font-sfpro text-4 font-400 leading-4">
                  {Math.round(current()?.apparentTemperature || 0)}°
                </span>
              </div>
              <div class="mx-1.5 flex items-center justify-center text-white">
                <FaSolidDroplet size={10} />
                <span class="ml-1 font-sfpro text-4 font-400 leading-4">
                  {current()?.humidity}%
                </span>
              </div>
              <div class="mx-1.5 flex items-end justify-center text-white">
                <FaSolidLocationArrow
                  size={10}
                  class={`!rotate-[${current()!.windDirection - 45}] overflow-hidden rounded-full`}
                />
                <span class="ml-1 font-sfpro text-4 font-400 leading-4">
                  {Math.round(current()?.windSpeed || 0)}
                  <small class="pt-0.5 leading-3">km/h</small>
                </span>
              </div>
              <div class="mx-1.5 flex items-center justify-center text-white">
                <span class="ml-1 font-sfpro text-4 font-400 leading-4">
                  <small class="pt-0.5 leading-3">UV</small>{" "}
                  {current()?.uvIndex}
                </span>
              </div>
            </div>
          </Show>

          <div
            ref={hourlyRef}
            class="no-scrollbar relative mx-auto mt-3 flex w-[340px] snap-x snap-mandatory overflow-y-hidden overflow-x-scroll border-b border-t border-gray-50/20"
          >
            <Show
              when={hourly()}
              fallback={
                <div class="flex h-[96px] w-full items-center justify-center">
                  <img src="/assets/svg/loader.svg" width={30} height={7} />
                </div>
              }
            >
              <Index each={hourly()}>
                {(data, index) => {
                  return (
                    <div class="flex h-full min-w-[58px] snap-start flex-col items-center">
                      <p class="font-sfpro text-4 font-400 leading-7 text-white">
                        {index === 0 ? "Now" : format(data().time, "K a")}
                      </p>
                      <Show
                        when={data()!.probability > 0}
                        fallback={<div class="h-5 w-5"></div>}
                      >
                        <p class="font-sfpro text-4 font-400 leading-5 text-[#0062bf]">
                          {data()!.probability}%
                        </p>
                      </Show>
                      <img
                        height={36}
                        width={36}
                        style={{
                          filter: "drop-shadow(0 1px 3px black)",
                        }}
                        src={
                          data()!.isDayTime
                            ? WMOCODE[data()!.icon].day.image
                            : WMOCODE[data()!.icon].night.image
                        }
                      />
                      <p class="font-sfpro text-[13px] font-400 leading-8 text-white">
                        {Math.round(data()!.temperature)}°
                      </p>
                    </div>
                  );
                }}
              </Index>
            </Show>
          </div>

          <div class="mt-3 px-10">
            <Show
              when={chartData().labels.length}
              fallback={
                <div class="flex h-[150px] w-full items-center justify-center">
                  <img src="/assets/svg/loader.svg" width={30} height={7} />
                </div>
              }
            >
              <Line
                data={chartData()}
                options={chartOptions}
                width={240}
                height={150}
              />
            </Show>
          </div>
          <p class="text-center font-sfpro text-4 font-400 leading-6 text-white">
            {prediction()}
          </p>
        </div>
      </main>
    </MetaProvider>
  );
};

export default Weather;
