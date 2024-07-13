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

export const URL_IMAGE_MAIN_PAGE =
  "https://www.getdailyart.com/en/21/paul-signac/the-red-buoy-saint-tropez";

export const DEFAULT_CORS_PROXY = "https://mywebapp.abcworker.workers.dev/";

export const mapTables = {
  vocabulary: "vocabulary",
  schedule: "schedule",
  history: "history",
  memories: "memories",
  bookmarks: "bookmarks",
};

export const PRECIPITATION_PROBABILITY = 0.65;
export const ACCUMULATION = 0.03;
export const DEVIATION_NUMB = 0;

export const WMOCODE: WeatherCodeData = {
  "0": {
    day: {
      description: "Sunny",
      image: "/images/openmeteo/icons/01d.svg",
    },
    night: {
      description: "Clear",
      image: "/images/openmeteo/icons/01n.svg",
    },
  },
  "1": {
    day: {
      description: "Mainly Sunny",
      image: "/images/openmeteo/icons/02d.svg",
    },
    night: {
      description: "Mainly Clear",
      image: "/images/openmeteo/icons/02n.svg",
    },
  },
  "2": {
    day: {
      description: "Partly Cloudy",
      image: "/images/openmeteo/icons/03d.svg",
    },
    night: {
      description: "Partly Cloudy",
      image: "/images/openmeteo/icons/03n.svg",
    },
  },
  "3": {
    day: {
      description: "Mostly Cloudy",
      image: "/images/openmeteo/icons/04.svg",
    },
    night: {
      description: "Mostly Cloudy",
      image: "/images/openmeteo/icons/04.svg",
    },
  },
  "45": {
    day: {
      description: "Foggy",
      image: "/images/openmeteo/icons/15.svg",
    },
    night: {
      description: "Foggy",
      image: "/images/openmeteo/icons/15.svg",
    },
  },
  "48": {
    day: {
      description: "Rime Fog",
      image: "/images/openmeteo/icons/15.svg",
    },
    night: {
      description: "Rime Fog",
      image: "/images/openmeteo/icons/15.svg",
    },
  },
  "51": {
    day: {
      description: "Light Drizzle",
      image: "/images/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Drizzle",
      image: "/images/openmeteo/icons/46.svg",
    },
  },
  "53": {
    day: {
      description: "Drizzle",
      image: "/images/openmeteo/icons/46.svg",
    },
    night: {
      description: "Drizzle",
      image: "/images/openmeteo/icons/46.svg",
    },
  },
  "55": {
    day: {
      description: "Heavy Drizzle",
      image: "/images/openmeteo/icons/09.svg",
    },
    night: {
      description: "Heavy Drizzle",
      image: "/images/openmeteo/icons/09.svg",
    },
  },
  "56": {
    day: {
      description: "Light Freezing Drizzle",
      image: "/images/openmeteo/icons/47.svg",
    },
    night: {
      description: "Light Freezing Drizzle",
      image: "/images/openmeteo/icons/47.svg",
    },
  },
  "57": {
    day: {
      description: "Freezing Drizzle",
      image: "/images/openmeteo/icons/49.svg",
    },
    night: {
      description: "Freezing Drizzle",
      image: "/images/openmeteo/icons/49.svg",
    },
  },
  "61": {
    day: {
      description: "Light Rain",
      image: "/images/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Rain",
      image: "/images/openmeteo/icons/46.svg",
    },
  },
  "63": {
    day: {
      description: "Rain",
      image: "/images/openmeteo/icons/09.svg",
    },
    night: {
      description: "Rain",
      image: "/images/openmeteo/icons/09.svg",
    },
  },
  "65": {
    day: {
      description: "Heavy Rain",
      image: "/images/openmeteo/icons/10.svg",
    },
    night: {
      description: "Heavy Rain",
      image: "/images/openmeteo/icons/10.svg",
    },
  },
  "66": {
    day: {
      description: "Light Freezing Rain",
      image: "/images/openmeteo/icons/47.svg",
    },
    night: {
      description: "Light Freezing Rain",
      image: "/images/openmeteo/icons/47.svg",
    },
  },
  "67": {
    day: {
      description: "Freezing Rain",
      image: "/images/openmeteo/icons/12.svg",
    },
    night: {
      description: "Freezing Rain",
      image: "/images/openmeteo/icons/12.svg",
    },
  },
  "71": {
    day: {
      description: "Light Snow",
      image: "/images/openmeteo/icons/49.svg",
    },
    night: {
      description: "Light Snow",
      image: "/images/openmeteo/icons/49.svg",
    },
  },
  "73": {
    day: {
      description: "Snow",
      image: "/images/openmeteo/icons/13.svg",
    },
    night: {
      description: "Snow",
      image: "/images/openmeteo/icons/13.svg",
    },
  },
  "75": {
    day: {
      description: "Heavy Snow",
      image: "/images/openmeteo/icons/50.svg",
    },
    night: {
      description: "Heavy Snow",
      image: "/images/openmeteo/icons/50.svg",
    },
  },
  "77": {
    day: {
      description: "Snow Grains",
      image: "/images/openmeteo/icons/49.svg",
    },
    night: {
      description: "Snow Grains",
      image: "/images/openmeteo/icons/49.svg",
    },
  },
  "80": {
    day: {
      description: "Light Showers",
      image: "/images/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Showers",
      image: "/images/openmeteo/icons/46.svg",
    },
  },
  "81": {
    day: {
      description: "Showers",
      image: "/images/openmeteo/icons/09.svg",
    },
    night: {
      description: "Showers",
      image: "/images/openmeteo/icons/09.svg",
    },
  },
  "82": {
    day: {
      description: "Heavy Showers",
      image: "/images/openmeteo/icons/10.svg",
    },
    night: {
      description: "Heavy Showers",
      image: "/images/openmeteo/icons/10.svg",
    },
  },
  "85": {
    day: {
      description: "Light Snow Showers",
      image: "/images/openmeteo/icons/49.svg",
    },
    night: {
      description: "Light Snow Showers",
      image: "/images/openmeteo/icons/49.svg",
    },
  },
  "86": {
    day: {
      description: "Snow Showers",
      image: "/images/openmeteo/icons/13.svg",
    },
    night: {
      description: "Snow Showers",
      image: "/images/openmeteo/icons/13.svg",
    },
  },
  "95": {
    day: {
      description: "Thunderstorm",
      image: "/images/openmeteo/icons/11.svg",
    },
    night: {
      description: "Thunderstorm",
      image: "/images/openmeteo/icons/11.svg",
    },
  },
  "96": {
    day: {
      description: "Light Thunderstorms With Hail",
      image: "/images/openmeteo/icons/20d.svg",
    },
    night: {
      description: "Light Thunderstorms With Hail",
      image: "/images/openmeteo/icons/20n.svg",
    },
  },
  "99": {
    day: {
      description: "Thunderstorm With Hail",
      image: "/images/openmeteo/icons/27d.svg",
    },
    night: {
      description: "Thunderstorm With Hail",
      image: "/images/openmeteo/icons/27n.svg",
    },
  },
};

export const WEATHER_GEOS: WeatherGeoType[] = [
  {
    name: "Thủ Thừa",
    lat: 10.588468,
    lon: 106.40065,
  },
  {
    name: "Cần Thơ",
    lat: 10.0364216,
    lon: 105.7875219,
  },
  {
    name: "Tokyo",
    lat: 35.652832,
    lon: 139.839478,
  },
];

import { onCleanup } from "solid-js";
import { WeatherCodeData, WeatherGeoType } from "./types";

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
