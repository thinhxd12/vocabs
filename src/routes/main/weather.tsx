import { MetaProvider, Title as TitleName, Meta } from "@solidjs/meta";
import {
  Component,
  Index,
  Suspense,
  createEffect,
  createResource,
  createSignal,
  onMount,
} from "solid-js";
import { Chart, Title, Tooltip, Legend, Colors, Filler } from "chart.js";
import { Line } from "solid-chartjs";
import { FaSolidArrowUpLong } from "solid-icons/fa";
import {
  RainRenderer,
  Raindrops,
  createCanvas,
  loadImage,
} from "~/lib/weatherServices";
import { WeatherGeoType } from "~/types";
import {
  getCurrentWeatherData,
  getMinutelyWeatherData,
  makePrediction,
} from "~/lib/api";
import { format } from "date-fns";
import styles from "./weather.module.scss";
import { getUser } from "~/lib";
import { createAsync } from "@solidjs/router";

let canvas: HTMLCanvasElement;
let audio: HTMLAudioElement;

const Weather: Component<{}> = (props) => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const WEATHER_GEOS: WeatherGeoType[] = [
    {
      name: "ThuThua",
      geo: "10.588468,106.400650",
    },
    {
      name: "Roma",
      geo: "41.8933203,12.4829321",
    },
    {
      name: "CanTho",
      geo: "10.0364216,105.7875219",
    },
    {
      name: "Tokyo",
      geo: "35.6821936,139.762221",
    },
    {
      name: "Heliskiing",
      geo: "59.4373017,-136.2290385",
    },
  ];

  const [geo, setGeo] = createSignal<string>(WEATHER_GEOS[0].geo);
  const [current, { refetch: refetchCurrent, mutate: mutateCurrent }] =
    createResource(geo, getCurrentWeatherData);

  const [minutely, { refetch: refetchMinutely, mutate: mutateMinutely }] =
    createResource(geo, getMinutelyWeatherData);

  const [audioSrc, setAudioSrc] = createSignal<string>("");
  const [prediction, setPrediction] = createSignal<string>("");

  const handleRenderWeather = (num: string) => {
    setGeo(WEATHER_GEOS[Number(num)].geo);
    refetchCurrent();
    refetchMinutely();
  };

  onMount(async () => {
    Chart.register(Title, Tooltip, Legend, Colors, Filler);
    loadTextures();
    audio.volume = 0.5;
  });

  createEffect(async () => {
    current() && setupWeather();
  });

  createEffect(async () => {
    setPrediction(await makePrediction(minutely()));
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
          tickLength: 2,
          tickWidth: 1,
          tickColor: "black",
        },
        ticks: {
          stepSize: 0.2,
          callback: function (value: any, index: any) {
            return value == 0 ? "" : value % 10 === 0 ? value + "m" : null;
          },
          font: {
            size: 9,
          },
          color: "black",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        min: 0,
        max: 1.5,
        border: { dash: [1, 1] },
        grid: {
          drawTicks: false,
          color: ["black", "#ae0000", "#ae0000"],
        },
        ticks: {
          stepSize: 0.5,
          callback: function (value: any, index: any) {
            switch (value) {
              case 0:
                return "LIGT";
              case 0.5:
                return "MED";
              case 1:
                return "HVY";
              default:
                null;
            }
          },
          font: {
            size: 9,
            weight: "normal",
          },
          color: "black",
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
            return value == 0 ? "0 (%)" : value * 100;
          },
          font: {
            size: 9,
          },
          color: "black",
        },
      },
    },
  };

  // -------------------------------CANVAS------------------
  const textureBgSize = {
    width: 384,
    height: 256,
  };

  const textureFgSize = {
    width: 96,
    height: 64,
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

    const textureDayFg = loadImage("/images/openmeteo/weather/day-fg.jpg");
    const textureDayBg = loadImage("/images/openmeteo/weather/day-bg.jpg");

    const textureNightFg = loadImage("/images/openmeteo/weather/night-fg.jpg");
    const textureNightBg = loadImage("/images/openmeteo/weather/night-bg.jpg");

    const imagesData = await Promise.all([
      dropAlpha,
      dropColor,
      textureDayFg,
      textureDayBg,
      textureNightFg,
      textureNightBg,
    ]);

    const dpi = window.devicePixelRatio;

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
    const textureDayFg = loadImage("/images/openmeteo/weather/day-fg.jpg");
    const textureDayBg = loadImage("/images/openmeteo/weather/day-bg.jpg");

    const textureNightFg = loadImage("/images/openmeteo/weather/night-fg.jpg");
    const textureNightBg = loadImage("/images/openmeteo/weather/night-bg.jpg");

    const imagesData = await Promise.all([
      textureDayFg,
      textureDayBg,
      textureNightFg,
      textureNightBg,
    ]);

    let weatherType = "";

    switch (current()!.summary) {
      case "Light Rain":
      case "Light Showers":
      case "Light Drizzle":
        setAudioSrc("/sounds/weather/rain_light_2.m4a");
        weatherType = "drizzle";
        break;
      case "Moderate Rain":
      case "Showers":
      case "Drizzle":
        setAudioSrc("/sounds/weather/rain_light.m4a");
        weatherType = "rain";
        break;
      case "Heavy Rain":
      case "Heavy Showers":
      case "Heavy Drizzle":
        setAudioSrc("/sounds/weather/rain.m4a");
        weatherType = "storm";
        break;
      case "Thunderstorm":
      case "Light Thunderstorms With Hail":
        setAudioSrc("/sounds/weather/thunderstorm.m4a");
        weatherType = "storm";
        break;
      case "Partly Cloudy":
      case "Mostly Cloudy":
        setAudioSrc("/sounds/weather/wind.m4a");
        weatherType = "sunny";
        break;
      case "Sunny":
        setAudioSrc("/sounds/weather/forest.m4a");
        weatherType = "sunny";
        break;
      case "Clear":
        setAudioSrc("/sounds/weather/night.m4a");
        weatherType = "sunny";
        break;
      case "Light Snow":
      case "Snow":
      case "Heavy Snow":
        setAudioSrc("/sounds/weather/snow.m4a");
        weatherType = "sunny";
        break;
      case "Light Freezing Rain":
      case "Freezing Rain":
        setAudioSrc("/sounds/weather/rain_freezing.m4a");
        weatherType = "drizzle";
        break;
      default:
        setAudioSrc("/sounds/weather/forest.m4a");
        weatherType = "sunny";
        break;
    }

    raindrops.options = {
      ...defaultOptions,
      ...defaultRain,
      ...weatherTypes[weatherType as keyof typeof weatherTypes],
    };

    raindrops.clearDrops();

    if (current()!.isDayTime) {
      generateTextures(imagesData[0], imagesData[1]);
      renderer.updateTextures();
    } else {
      generateTextures(imagesData[2], imagesData[3]);
      renderer.updateTextures();
    }
  };

  return (
    <MetaProvider>
      <TitleName>weather</TitleName>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio hidden src={audioSrc()} autoplay loop ref={audio}></audio>
      <div class={styles.weather}>
        <canvas ref={canvas} class={styles.weatherBackground} />
        <div class={styles.weatherMain}>
          <Suspense fallback={<div class={styles.weatherContentLoading}></div>}>
            <div
              class={
                current()?.isDayTime
                  ? styles.weatherContentDay
                  : styles.weatherContentNight
              }
            >
              <select
                class={styles.weatherGeos}
                onchange={(e) => handleRenderWeather(e.currentTarget.value)}
              >
                <Index each={WEATHER_GEOS}>
                  {(item, index) => (
                    <option value={index}> {item().name}</option>
                  )}
                </Index>
              </select>
              <div class={styles.weatherContentMain}>
                <img class={styles.weatherImg} src={current()?.icon} />
                <div class={styles.weatherContentText}>
                  <p class={styles.weatherContentTemp}>
                    {Math.round(current()?.temperature || 0)}°
                  </p>
                  <p class={styles.weatherContentInfo}>
                    Feels {Math.round(current()?.apparentTemperature || 0)}
                    °C
                  </p>
                  <p class={styles.weatherContentInfo}>
                    Humidity {current()?.humidity} %
                  </p>
                  <div class={styles.weatherContentWind}>
                    <p>
                      Wind {Math.round(current()?.windSpeed || 0)}
                      km/h
                    </p>
                    <FaSolidArrowUpLong
                      size={12}
                      style={{
                        transform: `rotate(${current()?.windBearing}deg)`,
                      }}
                    />
                  </div>
                  <p class={styles.weatherContentInfo}>
                    {format(new Date(current()?.time || 0), "h:mm a")}
                    {" - "}
                    {current()?.summary}
                  </p>
                </div>
              </div>
            </div>
          </Suspense>
          <Suspense fallback={<div class={styles.weatherChartLoading}></div>}>
            <div class={styles.weatherChart}>
              <div class={styles.weatherChartContent}>
                <Line
                  data={{
                    labels: minutely()?.map((item) => item.diffTime),
                    datasets: [
                      {
                        label: "",
                        data: minutely()?.map((item) => item.intensity),
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
                        data: minutely()?.map((item) => item.probability),
                        borderColor: "#f90000",
                        yAxisID: "y1",
                        fill: false,
                        tension: 0.3,
                        pointRadius: 0,
                        borderWidth: 1.5,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              </div>
              <p class={styles.weatherPredict}>{prediction()}</p>
            </div>
          </Suspense>
        </div>
      </div>
    </MetaProvider>
  );
};

export default Weather;
