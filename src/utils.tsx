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
};

export const PRECIPITATION_PROBABILITY = 0.65;
export const ACCUMULATION = 0.03;
export const DEVIATION_NUMB = 0;

export const REPETITION_PATTERN = [0, 400, 800, 200, 600, 1400, 1000, 1600, 1200, 1800];

export const WMOCODE: WeatherCodeData = {
  "0": {
    day: {
      description: "Sunny Day",
      image: "images/openmeteo/icons/01d.svg",
    },
    night: {
      description: "Clear Night",
      image: "images/openmeteo/icons/01n.svg",
    },
  },
  "1": {
    day: {
      description: "Mainly Sunny Day",
      image: "images/openmeteo/icons/02d.svg",
    },
    night: {
      description: "Mainly Clear Night",
      image: "images/openmeteo/icons/02n.svg",
    },
  },
  "2": {
    day: {
      description: "Partly Cloudy Day",
      image: "images/openmeteo/icons/03d.svg",
    },
    night: {
      description: "Partly Cloudy Night",
      image: "images/openmeteo/icons/03n.svg",
    },
  },
  "3": {
    day: {
      description: "Mostly Cloudy Day",
      image: "images/openmeteo/icons/04.svg",
    },
    night: {
      description: "Mostly Cloudy Night",
      image: "images/openmeteo/icons/04.svg",
    },
  },
  "45": {
    day: {
      description: "Foggy Day",
      image: "images/openmeteo/icons/15.svg",
    },
    night: {
      description: "Foggy Night",
      image: "images/openmeteo/icons/15.svg",
    },
  },
  "48": {
    day: {
      description: "Rime Fog",
      image: "images/openmeteo/icons/15.svg",
    },
    night: {
      description: "Rime Fog",
      image: "images/openmeteo/icons/15.svg",
    },
  },
  "51": {
    day: {
      description: "Light Drizzle Day",
      image: "images/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Drizzle Night",
      image: "images/openmeteo/icons/46.svg",
    },
  },
  "53": {
    day: {
      description: "Drizzle Day",
      image: "images/openmeteo/icons/46.svg",
    },
    night: {
      description: "Drizzle Night",
      image: "images/openmeteo/icons/46.svg",
    },
  },
  "55": {
    day: {
      description: "Heavy Drizzle Day",
      image: "images/openmeteo/icons/09.svg",
    },
    night: {
      description: "Heavy Drizzle Night",
      image: "images/openmeteo/icons/09.svg",
    },
  },
  "56": {
    day: {
      description: "Light Freezing Drizzle Day",
      image: "images/openmeteo/icons/47.svg",
    },
    night: {
      description: "Light Freezing Drizzle Night",
      image: "images/openmeteo/icons/47.svg",
    },
  },
  "57": {
    day: {
      description: "Freezing Drizzle",
      image: "images/openmeteo/icons/49.svg",
    },
    night: {
      description: "Freezing Drizzle",
      image: "images/openmeteo/icons/49.svg",
    },
  },
  "61": {
    day: {
      description: "Light Rain Day",
      image: "images/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Rain Night",
      image: "images/openmeteo/icons/46.svg",
    },
  },
  "63": {
    day: {
      description: "Rain Day",
      image: "images/openmeteo/icons/09.svg",
    },
    night: {
      description: "Rain Night",
      image: "images/openmeteo/icons/09.svg",
    },
  },
  "65": {
    day: {
      description: "Heavy Rain Day",
      image: "images/openmeteo/icons/10.svg",
    },
    night: {
      description: "Heavy Rain Night",
      image: "images/openmeteo/icons/10.svg",
    },
  },
  "66": {
    day: {
      description: "Light Freezing Rain Day",
      image: "images/openmeteo/icons/47.svg",
    },
    night: {
      description: "Light Freezing Rain Night",
      image: "images/openmeteo/icons/47.svg",
    },
  },
  "67": {
    day: {
      description: "Freezing Rain Day",
      image: "images/openmeteo/icons/12.svg",
    },
    night: {
      description: "Freezing Rain Night",
      image: "images/openmeteo/icons/12.svg",
    },
  },
  "71": {
    day: {
      description: "Light Snow",
      image: "images/openmeteo/icons/49.svg",
    },
    night: {
      description: "Light Snow",
      image: "images/openmeteo/icons/49.svg",
    },
  },
  "73": {
    day: {
      description: "Snow",
      image: "images/openmeteo/icons/13.svg",
    },
    night: {
      description: "Snow",
      image: "images/openmeteo/icons/13.svg",
    },
  },
  "75": {
    day: {
      description: "Heavy Snow",
      image: "images/openmeteo/icons/50.svg",
    },
    night: {
      description: "Heavy Snow",
      image: "images/openmeteo/icons/50.svg",
    },
  },
  "77": {
    day: {
      description: "Snow Grains",
      image: "images/openmeteo/icons/49.svg",
    },
    night: {
      description: "Snow Grains",
      image: "images/openmeteo/icons/49.svg",
    },
  },
  "80": {
    day: {
      description: "Light Showers Rain",
      image: "images/openmeteo/icons/46.svg",
    },
    night: {
      description: "Light Showers Rain",
      image: "images/openmeteo/icons/46.svg",
    },
  },
  "81": {
    day: {
      description: "Showers Rain",
      image: "images/openmeteo/icons/09.svg",
    },
    night: {
      description: "Showers Rain",
      image: "images/openmeteo/icons/09.svg",
    },
  },
  "82": {
    day: {
      description: "Heavy Showers Rain",
      image: "images/openmeteo/icons/10.svg",
    },
    night: {
      description: "Heavy Showers Rain",
      image: "images/openmeteo/icons/10.svg",
    },
  },
  "85": {
    day: {
      description: "Light Snow Showers",
      image: "images/openmeteo/icons/49.svg",
    },
    night: {
      description: "Light Snow Showers",
      image: "images/openmeteo/icons/49.svg",
    },
  },
  "86": {
    day: {
      description: "Snow Showers",
      image: "images/openmeteo/icons/13.svg",
    },
    night: {
      description: "Snow Showers",
      image: "images/openmeteo/icons/13.svg",
    },
  },
  "95": {
    day: {
      description: "Thunderstorm",
      image: "images/openmeteo/icons/11.svg",
    },
    night: {
      description: "Thunderstorm",
      image: "images/openmeteo/icons/11.svg",
    },
  },
  "96": {
    day: {
      description: "Light Thunderstorms With Hail",
      image: "images/openmeteo/icons/20d.svg",
    },
    night: {
      description: "Light Thunderstorms With Hail",
      image: "images/openmeteo/icons/20n.svg",
    },
  },
  "99": {
    day: {
      description: "Thunderstorm With Hail",
      image: "images/openmeteo/icons/27d.svg",
    },
    night: {
      description: "Thunderstorm With Hail",
      image: "images/openmeteo/icons/27n.svg",
    },
  },
};

import { onCleanup } from "solid-js";
import { WeatherCodeData } from "./types";

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
