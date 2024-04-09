import { MetaProvider, Title as TitleName, Meta } from "@solidjs/meta";
import { Component, Index, Show, createEffect, on, onMount } from "solid-js";
import "/public/styles/weather.scss";
import { useAction, useSubmission } from "@solidjs/router";
import { getWeatherData } from "~/api/api";
import { FixMinutelyType } from "~/types";
import { PRECIP_NUMB } from "~/utils";
import { OcArrowup2 } from "solid-icons/oc";
import { Chart, Title, Tooltip, Legend, Colors, Filler } from "chart.js";
import { Line } from "solid-chartjs";
import { Motion } from "solid-motionone";
import { createStore } from "solid-js/store";
import RSS from "~/components/rss";

type WeatherGeoType = {
  name: string;
  geo: string;
};

const Weather: Component<{}> = (props) => {
  const WEATHER_GEOS: WeatherGeoType[] = [
    { name: "Thu Thua", geo: "10.6011534,106.4018563" },
    { name: "Tân An", geo: "10.5364717,106.4099039" },
    {
      name: "Roma",
      geo: "41.8933203,12.4829321",
    },
    {
      name: "Cần Thơ",
      geo: "10.0364216,105.7875219",
    },
    {
      name: "Pinhais",
      geo: "-25.4443488,-49.1900307",
    },
  ];

  const getWeatherDataAction = useAction(getWeatherData);
  const getWeatherDataResult = useSubmission(getWeatherData);
  const [chartData, setChartData] = createStore();

  onMount(() => {
    getWeatherDataAction(WEATHER_GEOS[0].geo);
    Chart.register(Title, Tooltip, Legend, Colors, Filler);
  });

  createEffect(
    on(
      () => getWeatherDataResult.result?.minuteData,
      () => {
        const minutelyData = getWeatherDataResult.result?.minuteData;
        if (minutelyData) {
          const labels = minutelyData.map((item) => item.diffTime);
          setChartData({
            labels,
            datasets: [
              {
                label: "",
                data: minutelyData.map((item) => item.intensity),
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
                data: minutelyData.map((item) => item.intensity),
                borderColor: "#f90000",
                yAxisID: "y1",
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                borderWidth: 1,
              },
            ],
          });
        }
      }
    )
  );

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
          backgroundImage: getWeatherDataResult.result
            ? `url(/images/darksky/backgrounds/${getWeatherDataResult.result?.currentData.icon}.jpg)`
            : "unset",
        }}
        transition={{ duration: 0.6 }}
      >
        <select
          class="weatherGeos"
          onchange={(e) => getWeatherDataAction(e.currentTarget.value)}
        >
          <Index each={WEATHER_GEOS}>
            {(item, index) => (
              <option value={item().geo}> {item().name}</option>
            )}
          </Index>
        </select>
        <Show when={getWeatherDataResult.result}>
          <div class="weatherContent">
            <img
              class="weatherImg"
              src={`/images/darksky/icons/${
                getWeatherDataResult.result!.currentData.icon
              }.svg`}
            />
            <div class="weatherContentText">
              <p class="weatherContentTemp">
                {Math.round(
                  getWeatherDataResult.result!.currentData.temperature
                )}
                °
              </p>
              <p class="weatherContentInfo">
                Feels{" "}
                {Math.round(
                  getWeatherDataResult.result!.currentData.apparentTemperature
                )}
                °C
              </p>
              <p class="weatherContentInfo">
                UV {getWeatherDataResult.result!.currentData.uvIndex}
              </p>
              <div class="weatherContentWind">
                <span>
                  Wind{" "}
                  {Math.round(
                    getWeatherDataResult.result!.currentData.windSpeed
                  )}
                  km/h
                </span>
                <OcArrowup2
                  size={12}
                  style={{
                    transform: `rotate(${
                      getWeatherDataResult.result!.currentData.windBearing
                    }deg)`,
                  }}
                />
              </div>
              <p class="weatherContentInfo">
                {getWeatherDataResult.result!.currentData.timeText}
                {" - "}
                {getWeatherDataResult.result!.currentData.summary}
              </p>
            </div>
          </div>
          <div class="weatherChart">
            <Line
              data={chartData}
              options={chartOptions}
              width={360}
              height={180}
            />
          </div>
          <p class="weatherPredict">
            {getWeatherDataResult.result!.prediction}
          </p>
          <RSS />
        </Show>
      </Motion.div>
    </MetaProvider>
  );
};

export default Weather;
