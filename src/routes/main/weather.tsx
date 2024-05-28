import { MetaProvider, Title as TitleName, Meta } from "@solidjs/meta";
import { Component, Index, Show, createSignal, onMount } from "solid-js";
import { Chart, Title, Tooltip, Legend, Colors, Filler } from "chart.js";
import { Line } from "solid-chartjs";
import { FaSolidArrowUpLong } from "solid-icons/fa";
import {
  RainRenderer,
  Raindrops,
  createCanvas,
  loadImage,
} from "~/lib/weatherServices";
import { CurrentlyWeatherType } from "~/types";
import {
  getCurrentWeatherData,
  getMinutelyWeatherData,
  makePrediction,
} from "~/lib/api";
import { format } from "date-fns";
import styles from "./weather.module.scss";
import { createAsync, type RouteDefinition } from "@solidjs/router";
import { getUser } from "~/lib";

type WeatherGeoType = {
  name: string;
  geo: string;
};

let canvas: HTMLCanvasElement;
let audio: HTMLAudioElement;

let ref: HTMLDivElement;

// export const route = {
//   load: () => getUser(),
// } satisfies RouteDefinition;

const Weather: Component<{}> = (props) => {
  // ***************check login**************
  createAsync(() => getUser(), { deferStream: true });
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

  const [audioSrc, setAudioSrc] = createSignal<string>("");

  const [currentData, setCurrentData] = createSignal<
    CurrentlyWeatherType | undefined
  >();

  const [textPrediction, setTextPrediction] = createSignal<string>("");

  const handleGetWeatherData = async (geo: string) => {
    const curdata = await getCurrentWeatherData(geo);
    setCurrentData(curdata);

    switch (curdata.summary) {
      case "Light Rain":
      case "Light Showers":
        setAudioSrc("/sounds/weather/rain_light_2.m4a");
        setupWeather("drizzle", curdata.isDayTime);
        break;
      case "Moderate Rain":
      case "Showers":
        setAudioSrc("/sounds/weather/rain_light.m4a");
        setupWeather("rain", curdata.isDayTime);
        break;
      case "Heavy Rain":
      case "Heavy Showers":
        setAudioSrc("/sounds/weather/rain.m4a");
        setupWeather("storm", curdata.isDayTime);
        break;
      case "Thunderstorm":
      case "Light Thunderstorms With Hail":
        setAudioSrc("/sounds/weather/thunderstorm.m4a");
        setupWeather("storm", curdata.isDayTime);
        break;
      case "Partly Cloudy":
      case "Mostly Cloudy":
        setAudioSrc("/sounds/weather/wind.m4a");
        setupWeather("sunny", curdata.isDayTime);
        break;
      case "Sunny":
        setAudioSrc("/sounds/weather/forest.m4a");
        setupWeather("sunny", curdata.isDayTime);
        break;
      case "Clear":
        setAudioSrc("/sounds/weather/night.m4a");
        setupWeather("sunny", curdata.isDayTime);
        break;
      case "Light Snow":
      case "Snow":
      case "Heavy Snow":
        setAudioSrc("/sounds/weather/snow.m4a");
        setupWeather("sunny", curdata.isDayTime);
        break;
      case "Light Freezing Rain":
      case "Freezing Rain":
        setAudioSrc("/sounds/weather/rain_freezing.m4a");
        setupWeather("drizzle", curdata.isDayTime);
        break;
      default:
        setAudioSrc("/sounds/weather/forest.m4a");
        setupWeather("sunny", curdata.isDayTime);
        break;
    }

    const minutelydata = await getMinutelyWeatherData(geo);
    setChartData({
      labels: minutelydata.map((item) => item.diffTime),
      datasets: [
        {
          label: "",
          data: minutelydata.map((item) => item.intensity),
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
          data: minutelydata.map((item) => item.probability),
          borderColor: "#f90000",
          yAxisID: "y1",
          fill: false,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1.5,
        },
      ],
    });

    setTextPrediction(makePrediction());
  };

  onMount(async () => {
    loadTextures();
    Chart.register(Title, Tooltip, Legend, Colors, Filler);
    await handleGetWeatherData(WEATHER_GEOS[0].geo);
    audio.volume = 0.5;
  });

  const [chartData, setChartData] = createSignal({
    labels: [0],
    datasets: [{}],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
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

  const setupWeather = async (type: string, isDay: boolean) => {
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

    raindrops.options = {
      ...defaultOptions,
      ...weatherTypes[type as keyof typeof weatherTypes],
    };

    raindrops.clearDrops();

    if (isDay) {
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
        <Show when={currentData()}>
          <div class={styles.weatherMain}>
            <div
              class={
                currentData()!.isDayTime
                  ? styles.weatherContentDay
                  : styles.weatherContentNight
              }
            >
              <select
                class={styles.weatherGeos}
                onchange={(e) => handleGetWeatherData(e.currentTarget.value)}
              >
                <Index each={WEATHER_GEOS}>
                  {(item, index) => (
                    <option value={item().geo}> {item().name}</option>
                  )}
                </Index>
              </select>
              <div class={styles.weatherContentMain}>
                <img class={styles.weatherImg} src={currentData()!.icon} />
                <div class={styles.weatherContentText}>
                  <p class={styles.weatherContentTemp}>
                    {Math.round(currentData()!.temperature)}°
                  </p>
                  <p class={styles.weatherContentInfo}>
                    Feels {Math.round(currentData()!.apparentTemperature)}
                    °C
                  </p>
                  <p class={styles.weatherContentInfo}>
                    Humidity {currentData()!.humidity} %
                  </p>
                  <div class={styles.weatherContentWind}>
                    <p>
                      Wind {Math.round(currentData()!.windSpeed)}
                      km/h
                    </p>
                    <FaSolidArrowUpLong
                      size={12}
                      style={{
                        transform: `rotate(${currentData()!.windBearing}deg)`,
                      }}
                    />
                  </div>
                  <p class={styles.weatherContentInfo}>
                    {format(new Date(currentData()!.time), "h:mm a")}
                    {" - "}
                    {currentData()!.summary}
                  </p>
                </div>
              </div>
              <div class={styles.weatherChart}>
                <div>
                  <Line
                    data={chartData()}
                    options={chartOptions}
                    width={330}
                    height={150}
                  />
                </div>
                <p class={styles.weatherPredict}> {textPrediction()}</p>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
};

export default Weather;
