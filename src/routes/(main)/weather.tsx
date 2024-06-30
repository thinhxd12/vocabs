import { MetaProvider, Title as TitleName, Meta } from "@solidjs/meta";
import {
  Component,
  Index,
  Show,
  Suspense,
  createEffect,
  createResource,
  createSignal,
  onMount,
} from "solid-js";
import { Chart, Title, Tooltip, Legend, Colors, Filler } from "chart.js";
import { Line } from "solid-chartjs";
import {
  RainRenderer,
  Raindrops,
  createCanvas,
  loadImage,
} from "~/lib/weatherServices";
import {
  getCurrentWeatherData,
  getHourlyWeatherData,
  getMinutelyWeatherData,
  makePrediction,
} from "~/lib/api";
import styles from "./weather.module.scss";
import { getUser } from "~/lib";
import { createAsync } from "@solidjs/router";
import {
  FaSolidDroplet,
  FaSolidTemperatureLow,
  FaSolidWind,
} from "solid-icons/fa";
import { WEATHER_GEOS, WMOCODE } from "~/utils";
import { format } from "date-fns";

let canvas: HTMLCanvasElement;
let audio: HTMLAudioElement;
let refEl: HTMLDivElement;

const Weather: Component<{}> = (props) => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const [geo, setGeo] = createSignal<{ lat: number; lon: number }>({
    lat: WEATHER_GEOS[0].lat,
    lon: WEATHER_GEOS[0].lon,
  });
  const [geoTitle, setGeoTitle] = createSignal<string>(WEATHER_GEOS[0].name);
  const [chartData, setChartData] = createSignal<{
    labels: any[];
    datasets: any[];
  }>({ labels: [], datasets: [] });

  const [current, { refetch: refetchCurrent, mutate: mutateCurrent }] =
    createResource(geo, getCurrentWeatherData);

  const [hourly, { refetch: refetchHourly, mutate: mutateHourly }] =
    createResource(geo, getHourlyWeatherData);

  const [minutely, { refetch: refetchMinutely, mutate: mutateMinutely }] =
    createResource(geo, getMinutelyWeatherData);

  const [audioSrc, setAudioSrc] = createSignal<string>("");
  const [prediction, setPrediction] = createSignal<string>("");

  const handleRenderWeather = (num: string) => {
    setGeo({
      lat: WEATHER_GEOS[Number(num)].lat,
      lon: WEATHER_GEOS[Number(num)].lon,
    });
    setGeoTitle(WEATHER_GEOS[Number(num)].name);
    refetchCurrent();
    refetchMinutely();
  };

  onMount(async () => {
    Chart.register(Title, Tooltip, Legend, Colors, Filler);
    loadTextures();
    audio.volume = 0.5;
  });

  createEffect(async () => {
    current.state === "ready" && setupWeather();
  });

  createEffect(async () => {
    if (minutely()) {
      setPrediction(await makePrediction(minutely()));

      setChartData({
        labels: minutely()!.map((item) => item.diffTime),
        datasets: [
          {
            label: "",
            data: minutely()!.map((item) => item.intensity),
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
            data: minutely()!.map((item) => item.probability),
            borderColor: "#f90000",
            yAxisID: "y1",
            fill: false,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      });
    }
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    animation: {
      duration: 0,
    },
    stacked: false,
    plugins: {
      title: {
        display: false,
      },
      legend: { display: false },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
          tickLength: 1,
          tickWidth: 1,
          tickColor: "#818181",
        },
        ticks: {
          stepSize: 0.2,
          callback: function (value: any, index: any) {
            return value === 0 ? "Now" : value % 10 === 0 ? value + "m" : null;
          },
          font: {
            size: 8,
          },
          color: "white",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        min: 0,
        max: 1.5,
        border: { dash: [2, 2] },
        grid: {
          drawTicks: false,
          color: ["transparent", "#818181", "#818181"],
        },
        ticks: {
          stepSize: 0.5,
          callback: function (value: any, index: any) {
            switch (value) {
              case 0:
                return "";
              case 0.5:
                return "";
              case 1:
                return "";
              default:
                null;
            }
          },
          font: {
            size: 10,
            weight: "normal",
          },
          color: "white",
          padding: 3,
        },
      },
      y1: {
        min: 0,
        max: 1,
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          display: true,
          drawOnChartArea: false,
          tickLength: 3,
          tickWidth: 1,
        },
        ticks: {
          stepSize: 0.25,
          callback: function (value: any, index: any) {
            return null;
          },
          font: {
            size: 9,
          },
          color: "white",
        },
      },
    },
  };

  // -------------------------------CANVAS------------------
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

  let textureFg: HTMLCanvasElement;
  let textureBg: HTMLCanvasElement;

  const generateTextures = (fg: any, bg: any, alpha = 1) => {
    let textureFgCtx = textureFg.getContext("2d")!;
    let textureBgCtx = textureBg.getContext("2d")!;
    textureFgCtx.globalAlpha = alpha;
    textureFgCtx.drawImage(fg, 0, 0, textureFgSize.width, textureFgSize.height);

    textureBgCtx.globalAlpha = alpha;
    textureBgCtx.drawImage(bg, 0, 0, textureBgSize.width, textureBgSize.height);
  };

  const loadTextures = async () => {
    const dropAlpha = loadImage("/images/openmeteo/drop-alpha.png");
    const dropColor = loadImage("/images/openmeteo/drop-color.png");

    const textureDayRainFg = loadImage(
      "/images/openmeteo/weather/day-rain-fg.jpg"
    );
    const textureDayBg = loadImage("/images/openmeteo/weather/day-bg.webp");

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
    let canvasHeight = window.innerHeight - 34;

    canvas.width = Math.floor(canvasWidth * dpi);
    canvas.height = Math.floor(canvasHeight * dpi);
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";

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
      }
    );

    textureFg = createCanvas(textureFgSize.width, textureFgSize.height);
    textureBg = createCanvas(textureBgSize.width, textureBgSize.height);

    generateTextures(imagesData[2], imagesData[3]);

    renderer = new RainRenderer(
      canvas,
      raindrops.canvas!,
      textureFg,
      textureBg,
      null,
      {
        brightness: 1.04,
        alphaMultiply: 6,
        alphaSubtract: 3,
      }
    );
  };

  const setupWeather = async () => {
    if (!current()) return;
    const textureDayRainFg = loadImage(
      "/images/openmeteo/weather/day-rain-fg.jpg"
    );
    const textureDayRainBg = loadImage(
      "/images/openmeteo/weather/day-rain-bg.jpg"
    );

    const textureNightRainFg = loadImage(
      "/images/openmeteo/weather/night-rain-fg.jpg"
    );
    const textureNightRainBg = loadImage(
      "/images/openmeteo/weather/night-rain-bg.jpg"
    );

    const textureDayBg = loadImage("/images/openmeteo/weather/day-bg.webp");
    const textureNightBg = loadImage("/images/openmeteo/weather/night-bg.webp");

    const imagesData = await Promise.all([
      textureDayRainFg,
      textureDayRainBg,
      textureNightRainFg,
      textureNightRainBg,
      textureDayBg,
      textureNightBg,
    ]);

    let weatherType = "";

    switch (current()!.icon) {
      case 51:
      case 56:
      case 61:
      case 66:
      case 80:
        setAudioSrc("/sounds/weather/rain_light_2.m4a");
        weatherType = "drizzle";
        break;
      case 53:
      case 57:
      case 63:
      case 81:
        setAudioSrc("/sounds/weather/rain_light.m4a");
        weatherType = "rain";
        break;
      case 55:
      case 65:
      case 67:
      case 82:
      case 95:
      case 96:
      case 99:
        setAudioSrc("/sounds/weather/thunderstorm.m4a");
        weatherType = "storm";
        break;
      case 0:
      case 1:
        current()?.isDayTime
          ? setAudioSrc("/sounds/weather/forest.m4a")
          : setAudioSrc("/sounds/weather/night.m4a");
        weatherType = "sunny";
        break;
      case 71:
      case 73:
      case 75:
      case 77:
        setAudioSrc("/sounds/weather/snow.m4a");
        weatherType = "sunny";
        break;
      default:
        setAudioSrc("/sounds/weather/wind.m4a");
        weatherType = "sunny";
        break;
    }

    audio.play();

    raindrops.options = {
      ...defaultOptions,
      ...defaultRain,
      ...weatherTypes[weatherType as keyof typeof weatherTypes],
    };

    raindrops.clearDrops();

    if (weatherType !== "sunny") {
      if (current()!.isDayTime) {
        generateTextures(imagesData[0], imagesData[1]);
        renderer.updateTextures();
      } else {
        generateTextures(imagesData[2], imagesData[3]);
        renderer.updateTextures();
      }
    } else {
      if (current()!.isDayTime) {
        generateTextures(imagesData[0], imagesData[4]);
        renderer.updateTextures();
      } else {
        generateTextures(imagesData[2], imagesData[5]);
        renderer.updateTextures();
      }
    }
  };

  onMount(() => {
    if (refEl)
      refEl.addEventListener("wheel", (event) => {
        event.preventDefault();
        refEl.scrollBy({
          left: event.deltaY < 0 ? -60 : 60,
        });
      });
  });

  return (
    <MetaProvider>
      <TitleName>{geoTitle()} ⛅</TitleName>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio hidden src={audioSrc()} autoplay loop ref={audio}></audio>
      <div class={styles.weather}>
        <canvas ref={canvas} class={styles.weatherBackground} />

        <div class={styles.weatherContent}>
          <select
            class={styles.weatherSelect}
            onchange={(e) => handleRenderWeather(e.currentTarget.value)}
          >
            <Index each={WEATHER_GEOS}>
              {(item, index) => <option value={index}>{item().name}</option>}
            </Index>
          </select>

          <Show when={current()}>
            <p class={styles.weatherTemperature}>
              {Math.round(current()?.temperature || 0)}°
            </p>
            <div class={styles.weatherImgDiv}>
              <p>
                {
                  WMOCODE[String(current()!.icon) as keyof typeof WMOCODE][
                    current()!.isDayTime ? "day" : "night"
                  ].description
                }
              </p>
              <img
                class={styles.weatherImg}
                src={
                  WMOCODE[String(current()!.icon) as keyof typeof WMOCODE][
                    current()!.isDayTime ? "day" : "night"
                  ].image
                }
                width={30}
              />
            </div>
            <div class={styles.weatherInfoDiv}>
              <div class={styles.weatherInfo}>
                <FaSolidTemperatureLow size={9} />
                <span>{Math.round(current()?.apparentTemperature || 0)}°</span>
              </div>
              <div class={styles.weatherInfo}>
                <FaSolidDroplet size={9} />
                <span>
                  {current()?.humidity}
                  <small>%</small>
                </span>
              </div>
              <div class={styles.weatherInfo}>
                <FaSolidWind size={9} />
                <span>
                  {Math.round(current()?.windSpeed || 0)} <small>km/h</small>
                </span>
              </div>
              <div class={styles.weatherInfo}>
                <span>
                  <small>UV </small>
                  {current()?.uvIndex}
                </span>
              </div>
            </div>
          </Show>
        </div>

        <Suspense fallback={<div class={styles.weatherHourly}>...</div>}>
          <div class={styles.weatherHourly} ref={refEl}>
            <Index each={hourly()}>
              {(data, index) => {
                return (
                  <div class={styles.weatherHourlyItem}>
                    <p class={styles.weatherHourlyTime}>
                      {index === 0 ? "Now" : format(data().time, "K a")}
                    </p>
                    <Show
                      when={data()!.probability > 0}
                      fallback={<p class={styles.weatherHourlyProbHidden}></p>}
                    >
                      <p class={styles.weatherHourlyProb}>
                        {data()!.probability}%
                      </p>
                    </Show>
                    <img
                      class={styles.weatherHourlyIcon}
                      src={
                        WMOCODE[String(data()!.icon) as keyof typeof WMOCODE][
                          data()!.isDayTime ? "day" : "night"
                        ].image
                      }
                      height={36}
                    />
                    <p class={styles.weatherHourlyTemp}>
                      {Math.round(data()!.temperature)}°
                    </p>
                  </div>
                );
              }}
            </Index>
          </div>
        </Suspense>

        <Suspense fallback={<div class={styles.weatherChartLoading}>...</div>}>
          <div class={styles.weatherChart}>
            <div class={styles.weatherChartContent}>
              <Line data={chartData()} options={chartOptions} />
            </div>
            <p class={styles.weatherPredict}>{prediction()}</p>
          </div>
        </Suspense>
      </div>
    </MetaProvider>
  );
};

export default Weather;
