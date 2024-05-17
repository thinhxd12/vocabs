import { MetaProvider, Title as TitleName, Meta } from "@solidjs/meta";
import { Component, Index, JSX, createSignal, onMount } from "solid-js";
import "/public/styles/weather.scss";
import { getWeatherData } from "~/api/api";
import { FixCurrentlyType, WeatherDataType } from "~/types";
import { Chart, Title, Tooltip, Legend, Colors, Filler } from "chart.js";
import { Line } from "solid-chartjs";
import { Motion } from "solid-motionone";
import RSS from "~/components/rss";
import { FaSolidArrowUpLong } from "solid-icons/fa";

type WeatherGeoType = {
  name: string;
  geo: string;
};

let weatherContent: HTMLDivElement;

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
      name: "GardenGrove",
      geo: "33.7746292,-117.9463717",
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
  const weatherCode = {
    "0d": "/sounds/weather/forest.m4a",
    "0n": "/sounds/weather/night.m4a",
    "1d": "/sounds/weather/forest.m4a",
    "1n": "/sounds/weather/night.m4a",
    "2d": "/sounds/weather/wind.m4a",
    "2n": "/sounds/weather/wind.m4a",
    "3d": "/sounds/weather/wind.m4a",
    "3n": "/sounds/weather/wind.m4a",
    "4d": "/sounds/weather/wind.m4a",
    "4n": "/sounds/weather/wind.m4a",
    "95d": "/sounds/weather/thunderstorm.m4a",
    "95n": "/sounds/weather/thunderstorm.m4a",
    "61d": "/sounds/weather/rain_light_2.m4a",
    "61n": "/sounds/weather/rain_light_2.m4a",
    "63d": "/sounds/weather/rain_light.m4a",
    "63n": "/sounds/weather/rain_light.m4a",
    "65d": "/sounds/weather/rain.m4a",
    "65n": "/sounds/weather/rain.m4a",
    "71d": "/sounds/weather/snow.m4a",
    "71n": "/sounds/weather/snow.m4a",
    "73d": "/sounds/weather/snow.m4a",
    "73n": "/sounds/weather/snow.m4a",
    "75d": "/sounds/weather/snow.m4a",
    "75n": "/sounds/weather/snow.m4a",
    "66d": "/sounds/weather/rain_freezing.m4a",
    "66n": "/sounds/weather/rain_freezing.m4a",
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
      setAudioSrc(
        weatherCode[data.currentData.icon as keyof typeof weatherCode]
      );
    }
  };

  onMount(async () => {
    handleGetWeatherData(WEATHER_GEOS[0].geo);
    Chart.register(Title, Tooltip, Legend, Colors, Filler);
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
            return value == 0 ? "" : value % 10 === 0 ? value + "min" : null;
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
                return "LIGHT";
              case 0.5:
                return "MED";
              case 1:
                return "HEAVY";
              default:
                null;
            }
          },
          font: {
            size: 9,
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
          stepSize: 0.2,
          callback: function (value: any, index: any) {
            return value == 0 ? "0" : value * 100 + "%";
          },
          font: {
            size: 9,
          },
          color: "black",
        },
      },
    },
  };

  return (
    <MetaProvider>
      <TitleName>weather</TitleName>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio hidden src={audioSrc()} autoplay loop></audio>
      <Motion.div
        class="weather"
        animate={{
          opacity: [0, 1],
          backgroundImage: weatherData().currentData.isDayTime
            ? `url(/images/openmeteo/depth/2/image.jpg)`
            : `url(/images/openmeteo/depth/6/image.jpg)`,
        }}
        transition={{ duration: 0.6 }}
      >
        <div
          class={
            weatherData().currentData.isDayTime
              ? "weatherContentDay"
              : "weatherContentNight"
          }
          ref={weatherContent}
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
          <div class="weatherContentMain">
            <img
              class="weatherImg"
              src={`/images/openmeteo/icons/${
                weatherData().currentData.icon
              }.svg`}
            />
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
              <p class="weatherContentInfo">
                UV {weatherData().currentData.uvIndex}
              </p>
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
          <div class="weatherChart">
            <Line
              data={chartData()}
              options={chartOptions}
              width={360}
              height={180}
            />
          </div>
          <p class="weatherPredict">{weatherData().prediction}</p>
        </div>
        <RSS />
      </Motion.div>
    </MetaProvider>
  );
};

export default Weather;
