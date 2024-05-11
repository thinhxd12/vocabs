import { MetaProvider, Title as TitleName, Meta } from "@solidjs/meta";
import { Component, Index, Show, createSignal, onMount } from "solid-js";
import "/public/styles/weather.scss";
import { getWeatherData } from "~/api/api";
import { WeatherDataType } from "~/types";
import { Chart, Title, Tooltip, Legend, Colors, Filler } from "chart.js";
import { Line } from "solid-chartjs";
import { Motion } from "solid-motionone";
import RSS from "~/components/rss";
import { FaSolidArrowUpLong } from "solid-icons/fa";

type WeatherGeoType = {
  name: string;
  geo: string;
};

const Weather: Component<{}> = (props) => {
  const WEATHER_GEOS: WeatherGeoType[] = [
    { name: "Thu Thua", geo: "10.588468,106.400650" },
    {
      name: "Roma",
      geo: "41.8933203,12.4829321",
    },
    {
      name: "Cần Thơ",
      geo: "10.0364216,105.7875219",
    },
    {
      name: "Tokyo",
      geo: "35.6821936,139.762221",
    },
    {
      name: "Garden Grove",
      geo: "33.7746292,-117.9463717",
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
      <TitleName>Cealus</TitleName>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />

      <Motion.div
        class="weather"
        animate={{
          opacity: [0, 1],
          backgroundImage: `url(/images/darksky/backgrounds/${
            weatherData().currentData.icon
          }.jpg)`,
        }}
        transition={{ duration: 0.6 }}
      >
        <select
          class={
            weatherData().currentData.isDayTime
              ? "weatherGeos"
              : "weatherGeos weatherGeosNight"
          }
          onchange={(e) => handleGetWeatherData(e.currentTarget.value)}
        >
          <Index each={WEATHER_GEOS}>
            {(item, index) => (
              <option value={item().geo}> {item().name}</option>
            )}
          </Index>
        </select>
        <Show when={weatherData().prediction}>
          <div
            class={
              weatherData().currentData.isDayTime
                ? "weatherContent"
                : "weatherContent weatherContentNight"
            }
          >
            <img
              class="weatherImg"
              src={`/images/darksky/icons/${
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
          <p
            class={
              weatherData().currentData.isDayTime
                ? "weatherPredict"
                : "weatherPredictNight"
            }
          >
            {weatherData().prediction}
          </p>
          <RSS />
        </Show>
      </Motion.div>
    </MetaProvider>
  );
};

export default Weather;
