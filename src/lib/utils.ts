import { onCleanup } from "solid-js";
import { WeatherCodeData } from "~/types";

export function getElText(doc: any, query: string, defaultText: string) {
  const el = doc.querySelector(query);
  return (
    (el?.textContent &&
      el.textContent.replace(/[\n\r]+|\s{2,}/g, " ").trim()) ||
    defaultText
  );
}

export function getElAttribute(doc: any, query: string, attr: string) {
  const el = doc.querySelector(query);
  return (el && el.getAttribute(attr)) || "";
}

export const chunk = (array: any[], size: number) =>
  array.reduce((acc, _, i) => {
    if (i % size === 0) acc.push(array.slice(i, i + size));
    return acc;
  }, []);

export const URL_IMAGE_MAIN_PAGE =
  "https://www.getdailyart.com/en/21/paul-signac/the-red-buoy-saint-tropez";

export const DEFAULT_CORS_PROXY = "https://mywebapp.abcworker.workers.dev/";

export const mapTables = {
  vocabulary: "vocabulary",
  schedule: "schedule",
  history: "history",
  memories: "memories",
  bookmarks: "bookmarks",
  weather: "weather",
  progress: "progress",
};

export const PRECIPITATION_PROBABILITY = 0.65;
export const ACCUMULATION = 0.03;
export const DEVIATION_NUMB = 0;

export const REPETITION_PATTERN = [
  0, 400, 800, 200, 600, 1400, 1000, 1600, 1200, 1800,
];

export const WMOCODE: WeatherCodeData = {
  "0": {
    day: {
      description: "Sunny Day",
      image: "/assets/openmeteo/icons/01d.svg",
    },
    night: {
      description: "Clear",
      image: "/assets/openmeteo/icons/01n.svg",
    },
    textdescription: "day sky",
  },
  "1": {
    day: {
      description: "Mainly Sunny",
      image: "/assets/openmeteo/icons/02d.svg",
    },
    night: {
      description: "Mainly Clear",
      image: "/assets/openmeteo/icons/02n.svg",
    },
    textdescription: "day sky",
  },
  "2": {
    day: {
      description: "Partly Cloudy",
      image: "/assets/openmeteo/icons/03d.svg",
    },
    night: {
      description: "Partly Cloudy",
      image: "/assets/openmeteo/icons/03n.svg",
    },
    textdescription: "landscapes",
  },
  "3": {
    day: {
      description: "Mostly Cloudy",
      image: "/assets/openmeteo/icons/04.svg",
    },
    night: {
      description: "Mostly Cloudy",
      image: "/assets/openmeteo/icons/04.svg",
    },
    textdescription: "cloudy",
  },
  "45": {
    day: {
      description: "Foggy",
      image: "/assets/openmeteo/icons/15.svg",
    },
    night: {
      description: "Foggy",
      image: "/assets/openmeteo/icons/15.svg",
    },
    textdescription: "foggy forest road",
  },
  "48": {
    day: {
      description: "Rime Fog",
      image: "/assets/openmeteo/icons/15.svg",
    },
    night: {
      description: "Rime Fog",
      image: "/assets/openmeteo/icons/15.svg",
    },
    textdescription: "foggy forest road",
  },
  "51": {
    day: {
      description: "Light Drizzle",
      image: "/assets/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Drizzle",
      image: "/assets/openmeteo/icons/46.svg",
    },
    textdescription: "rain",
  },
  "53": {
    day: {
      description: "Drizzle",
      image: "/assets/openmeteo/icons/46.svg",
    },
    night: {
      description: "Drizzle",
      image: "/assets/openmeteo/icons/46.svg",
    },
    textdescription: "rain",
  },
  "55": {
    day: {
      description: "Heavy Drizzle",
      image: "/assets/openmeteo/icons/09.svg",
    },
    night: {
      description: "Heavy Drizzle",
      image: "/assets/openmeteo/icons/09.svg",
    },
    textdescription: "rain",
  },
  "56": {
    day: {
      description: "Light Freezing Drizzle",
      image: "/assets/openmeteo/icons/47.svg",
    },
    night: {
      description: "Light Freezing Drizzle",
      image: "/assets/openmeteo/icons/47.svg",
    },
    textdescription: "rain",
  },
  "57": {
    day: {
      description: "Freezing Drizzle",
      image: "/assets/openmeteo/icons/49.svg",
    },
    night: {
      description: "Freezing Drizzle",
      image: "/assets/openmeteo/icons/49.svg",
    },
    textdescription: "rain",
  },
  "61": {
    day: {
      description: "Light Rain",
      image: "/assets/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Rain",
      image: "/assets/openmeteo/icons/46.svg",
    },
    textdescription: "rain",
  },
  "63": {
    day: {
      description: "Rain",
      image: "/assets/openmeteo/icons/09.svg",
    },
    night: {
      description: "Rain",
      image: "/assets/openmeteo/icons/09.svg",
    },
    textdescription: "rain",
  },
  "65": {
    day: {
      description: "Heavy Rain",
      image: "/assets/openmeteo/icons/10.svg",
    },
    night: {
      description: "Heavy Rain",
      image: "/assets/openmeteo/icons/10.svg",
    },
    textdescription: "rain",
  },
  "66": {
    day: {
      description: "Light Freezing Rain",
      image: "/assets/openmeteo/icons/47.svg",
    },
    night: {
      description: "Light Freezing Rain",
      image: "/assets/openmeteo/icons/47.svg",
    },
    textdescription: "rain",
  },
  "67": {
    day: {
      description: "Freezing Rain",
      image: "/assets/openmeteo/icons/12.svg",
    },
    night: {
      description: "Freezing Rain",
      image: "/assets/openmeteo/icons/12.svg",
    },
    textdescription: "rain",
  },
  "71": {
    day: {
      description: "Light Snow",
      image: "/assets/openmeteo/icons/49.svg",
    },
    night: {
      description: "Light Snow",
      image: "/assets/openmeteo/icons/49.svg",
    },
    textdescription: "snow falling",
  },
  "73": {
    day: {
      description: "Snow",
      image: "/assets/openmeteo/icons/13.svg",
    },
    night: {
      description: "Snow",
      image: "/assets/openmeteo/icons/13.svg",
    },
    textdescription: "snow falling",
  },
  "75": {
    day: {
      description: "Heavy Snow",
      image: "/assets/openmeteo/icons/50.svg",
    },
    night: {
      description: "Heavy Snow",
      image: "/assets/openmeteo/icons/50.svg",
    },
    textdescription: "snow falling",
  },
  "77": {
    day: {
      description: "Snow Grains",
      image: "/assets/openmeteo/icons/49.svg",
    },
    night: {
      description: "Snow Grains",
      image: "/assets/openmeteo/icons/49.svg",
    },
    textdescription: "snow falling",
  },
  "80": {
    day: {
      description: "Light Showers",
      image: "/assets/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Showers",
      image: "/assets/openmeteo/icons/46.svg",
    },
    textdescription: "rain",
  },
  "81": {
    day: {
      description: "Showers",
      image: "/assets/openmeteo/icons/09.svg",
    },
    night: {
      description: "Showers",
      image: "/assets/openmeteo/icons/09.svg",
    },
    textdescription: "rain",
  },
  "82": {
    day: {
      description: "Heavy Showers",
      image: "/assets/openmeteo/icons/10.svg",
    },
    night: {
      description: "Heavy Showers",
      image: "/assets/openmeteo/icons/10.svg",
    },
    textdescription: "rain",
  },
  "85": {
    day: {
      description: "Light Snow Showers",
      image: "/assets/openmeteo/icons/49.svg",
    },
    night: {
      description: "Light Snow Showers",
      image: "/assets/openmeteo/icons/49.svg",
    },
    textdescription: "snow falling",
  },
  "86": {
    day: {
      description: "Snow Showers",
      image: "/assets/openmeteo/icons/13.svg",
    },
    night: {
      description: "Snow Showers",
      image: "/assets/openmeteo/icons/13.svg",
    },
    textdescription: "snow falling",
  },
  "95": {
    day: {
      description: "Thunderstorm",
      image: "/assets/openmeteo/icons/11.svg",
    },
    night: {
      description: "Thunderstorm",
      image: "/assets/openmeteo/icons/11.svg",
    },
    textdescription: "thunderstorm",
  },
  "96": {
    day: {
      description: "Light Thunderstorms With Hail",
      image: "/assets/openmeteo/icons/20d.svg",
    },
    night: {
      description: "Light Thunderstorms With Hail",
      image: "/assets/openmeteo/icons/20n.svg",
    },
    textdescription: "thunderstorm",
  },
  "99": {
    day: {
      description: "Thunderstorm With Hail",
      image: "/assets/openmeteo/icons/27d.svg",
    },
    night: {
      description: "Thunderstorm With Hail",
      image: "/assets/openmeteo/icons/27n.svg",
    },
    textdescription: "thunderstorm",
  },
};

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
    }
  }
}

export function clickOutside(element: HTMLDivElement, accessor: any) {
  const onClick = (event: Event) => {
    if (!element.contains(event.target as HTMLInputElement)) {
      accessor()();
    }
  };

  document.addEventListener("click", onClick);
  onCleanup(() => document.removeEventListener("click", onClick));
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      stopKeydown: null;
    }
  }
}

export const stopKeydown = (element: HTMLDivElement): void => {
  element.addEventListener("keydown", (e) => {
    e.stopPropagation();
  });
};

export const chartOptions = {
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
          size: 9,
          family: "SF Pro Display",
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
