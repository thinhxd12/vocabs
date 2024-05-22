import { MetaProvider, Title as TitleName, Meta } from "@solidjs/meta";
import { Component, Index, Show, createSignal, onMount } from "solid-js";
import "/public/styles/weather.scss";
import { getWeatherData } from "~/api/api";
import { WeatherDataType } from "~/types";
import { Chart, Title, Tooltip, Legend, Colors, Filler } from "chart.js";
import { Line } from "solid-chartjs";
import RSS from "~/components/rss";
import { FaSolidArrowUpLong } from "solid-icons/fa";
import {
  RainRenderer,
  Raindrops,
  activeTextureGL,
  chance,
  createCanvas,
  createProgramGL,
  createTextureGL,
  createUniformGL,
  getContextGL,
  getShader,
  loadImage,
  random,
  setRectangleGL,
  times,
  updateTextureGL,
} from "~/api/weatherServices";

type WeatherGeoType = {
  name: string;
  geo: string;
};

let canvas: HTMLCanvasElement;

const Weather: Component<{}> = (props) => {
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

  const mockWeatherData: WeatherDataType = {
    currentData: {
      timeText: "",
      icon: "",
      summary: "",
      humidity: 0,
      temperature: 0,
      apparentTemperature: 0,
      uvIndex: 0,
      windSpeed: 0,
      windBearing: 0,
      isDayTime: true,
    },
    minuteData: [],
    prediction: "",
  };

  const [audioSrc, setAudioSrc] = createSignal<string>("");

  const [weatherData, setweatherData] =
    createSignal<WeatherDataType>(mockWeatherData);

  const handleGetWeatherData = async (geo: string) => {
    const data = await getWeatherData(geo);

    if (data) {
      setweatherData(data);
      setChartData({
        labels: data.minuteData.map((item) => item.diffTime),
        datasets: [
          {
            label: "",
            data: data.minuteData.map((item) => item.intensity),
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
            data: data.minuteData.map((item) => item.probability),
            borderColor: "#f90000",
            yAxisID: "y1",
            fill: false,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      });

      switch (data.currentData.summary) {
        case "Light rain":
        case "Light Freezing Rain":
        case "Light Showers":
          setAudioSrc("/sounds/weather/rain_light_2.m4a");
          setupWeather("drizzle", data.currentData.isDayTime);
          break;
        case "Moderate rain":
        case "Freezing Rain":
        case "Showers":
          setAudioSrc("/sounds/weather/rain_light.m4a");
          setupWeather("rain", data.currentData.isDayTime);
          break;
        case "Heavy rain":
        case "Heavy Showers":
          setAudioSrc("/sounds/weather/rain.m4a");
          setupWeather("storm", data.currentData.isDayTime);
          break;
        case "Thunderstorm":
        case "Light Thunderstorms With Hail":
          setAudioSrc("/sounds/weather/thunderstorm.m4a");
          setupWeather("storm", data.currentData.isDayTime);
          break;
        case "Partly Cloudy":
        case "Mostly Cloudy":
          setAudioSrc("/sounds/weather/wind.m4a");
          setupWeather("sunny", data.currentData.isDayTime);
          break;
        case "Sunny":
          setAudioSrc("/sounds/weather/forest.m4a");
          setupWeather("sunny", data.currentData.isDayTime);
          break;
        case "Clear":
          setAudioSrc("/sounds/weather/night.m4a");
          setupWeather("sunny", data.currentData.isDayTime);
          break;
        case "Light Snow":
        case "Snow":
        case "Heavy Snow":
          setAudioSrc("/sounds/weather/snow.m4a");
          setupWeather("sunny", data.currentData.isDayTime);
          break;
        case "Light Freezing Rain":
        case "Freezing Rain":
          setAudioSrc("/sounds/weather/rain_freezing.m4a");
          setupWeather("sunny", data.currentData.isDayTime);
          break;
        default:
          setAudioSrc("/sounds/weather/forest.m4a");
          setupWeather("sunny", data.currentData.isDayTime);
          break;
      }
    }
  };

  onMount(async () => {
    handleGetWeatherData(WEATHER_GEOS[0].geo);
    Chart.register(Title, Tooltip, Legend, Colors, Filler);
    loadTextures();
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

    let dpi = window.devicePixelRatio;
    let canvasWidth = 360 * dpi;
    let canvasHeight = (window.innerHeight - 34) * dpi;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

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
    const weatherTypes = {
      rain: {
        rainLimit: 2,
        trailRate: 1,
        trailScaleRange: [0.2, 0.45],
        collisionRadius: 0.45,
        dropletsCleaningRadiusMultiplier: 0.28,
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

    if (isDay) {
      generateTextures(imagesData[0], imagesData[1]);
      renderer.updateTextures();
    } else {
      generateTextures(imagesData[2], imagesData[3]);
      renderer.updateTextures();
    }

    raindrops.options = Object.assign(
      raindrops.options,
      weatherTypes[type as keyof typeof weatherTypes]
    );

    raindrops.clearDrops();
  };

  return (
    <MetaProvider>
      <TitleName>weather</TitleName>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio hidden src={audioSrc()} autoplay loop></audio>
      <div class="weather">
        <canvas ref={canvas} class="weatherBackground" />
        <div class="weatherMain">
          <div
            class={
              weatherData().currentData.isDayTime
                ? "weatherContentDay"
                : "weatherContentNight"
            }
          >
            <select
              class="weatherGeos"
              onchange={(e) => handleGetWeatherData(e.currentTarget.value)}
            >
              <Index each={WEATHER_GEOS}>
                {(item, index) => (
                  <option value={item().geo}> {item().name}</option>
                )}
              </Index>
            </select>
            <Show when={weatherData().minuteData.length > 0}>
              <div class="weatherContentMain">
                <img class="weatherImg" src={weatherData().currentData.icon} />
                <div class="weatherContentText">
                  <p class="weatherContentTemp">
                    {Math.round(weatherData().currentData.temperature)}°
                  </p>
                  <p class="weatherContentInfo">
                    Feels{" "}
                    {Math.round(weatherData().currentData.apparentTemperature)}
                    °C
                  </p>
                  <p class="weatherContentInfo">
                    Humidity {weatherData().currentData.humidity} %
                  </p>
                  <Show when={weatherData().currentData.uvIndex > 0}>
                    <p class="weatherContentInfo">
                      UV {weatherData().currentData.uvIndex}
                    </p>
                  </Show>
                  <div class="weatherContentWind">
                    <p>
                      Wind {Math.round(weatherData().currentData.windSpeed)}
                      km/h
                    </p>
                    <FaSolidArrowUpLong
                      size={12}
                      style={{
                        transform: `rotate(${
                          weatherData().currentData.windBearing
                        }deg)`,
                      }}
                    />
                  </div>
                  <p class="weatherContentInfo">
                    {weatherData().currentData.timeText}
                    {" - "}
                    {weatherData().currentData.summary}
                  </p>
                </div>
              </div>
            </Show>
            <div class="weatherChart">
              <div>
                <Line
                  data={chartData()}
                  options={chartOptions}
                  width={300}
                  height={150}
                />
              </div>
              <p class="weatherPredict">{weatherData().prediction}</p>
            </div>
            <RSS />
          </div>
        </div>
      </div>
    </MetaProvider>
  );
};

export default Weather;
