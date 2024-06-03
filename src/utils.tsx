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

export const PRECIPITATION_PROBABILITY = 0.68;
export const ACCUMULATION = 0.03;
export const DEVIATION_NUMB = 0;

export const WMOCODE = {
  "0": {
    day: {
      description: "Sunny",
      image: "clear-day.svg",
    },
    night: {
      description: "Clear",
      image: "clear-night.svg",
    },
  },
  "1": {
    day: {
      description: "Mainly Sunny",
      image: "clear-day.svg",
    },
    night: {
      description: "Mainly Clear",
      image: "clear-night.svg",
    },
  },
  "2": {
    day: {
      description: "Partly Cloudy",
      image: "partly-cloudy-day.svg",
    },
    night: {
      description: "Partly Cloudy",
      image: "partly-cloudy-night.svg",
    },
  },
  "3": {
    day: {
      description: "Mostly Cloudy",
      image: "overcast-day.svg",
    },
    night: {
      description: "Mostly Cloudy",
      image: "overcast-night.svg",
    },
  },
  "45": {
    day: {
      description: "Foggy",
      image: "fog-day.svg",
    },
    night: {
      description: "Foggy",
      image: "fog-night.svg",
    },
  },
  "48": {
    day: {
      description: "Rime Fog",
      image: "fog-day.svg",
    },
    night: {
      description: "Rime Fog",
      image: "fog-night.svg",
    },
  },
  "51": {
    day: {
      description: "Light Drizzle",
      image: "partly-cloudy-day-drizzle.svg",
    },
    night: {
      description: "Light Drizzle",
      image: "partly-cloudy-night-drizzle.svg",
    },
  },
  "53": {
    day: {
      description: "Drizzle",
      image: "drizzle.svg",
    },
    night: {
      description: "Drizzle",
      image: "drizzle.svg",
    },
  },
  "55": {
    day: {
      description: "Heavy Drizzle",
      image: "overcast-drizzle.svg",
    },
    night: {
      description: "Heavy Drizzle",
      image: "overcast-drizzle.svg",
    },
  },
  "56": {
    day: {
      description: "Light Freezing Drizzle",
      image: "partly-cloudy-day-sleet.svg",
    },
    night: {
      description: "Light Freezing Drizzle",
      image: "partly-cloudy-night-sleet.svg",
    },
  },
  "57": {
    day: {
      description: "Freezing Drizzle",
      image: "sleet.svg",
    },
    night: {
      description: "Freezing Drizzle",
      image: "sleet.svg",
    },
  },
  "61": {
    day: {
      description: "Light Rain",
      image: "partly-cloudy-day-rain.svg",
    },
    night: {
      description: "Light Rain",
      image: "partly-cloudy-night-rain.svg",
    },
  },
  "63": {
    day: {
      description: "Moderate Rain",
      image: "rain.svg",
    },
    night: {
      description: "Moderate Rain",
      image: "rain.svg",
    },
  },
  "65": {
    day: {
      description: "Heavy Rain",
      image: "overcast-rain.svg",
    },
    night: {
      description: "Heavy Rain",
      image: "overcast-rain.svg",
    },
  },
  "66": {
    day: {
      description: "Light Freezing Rain",
      image: "partly-cloudy-day-sleet.svg",
    },
    night: {
      description: "Light Freezing Rain",
      image: "partly-cloudy-night-sleet.svg",
    },
  },
  "67": {
    day: {
      description: "Freezing Rain",
      image: "sleet.svg",
    },
    night: {
      description: "Freezing Rain",
      image: "sleet.svg",
    },
  },
  "71": {
    day: {
      description: "Light Snow",
      image: "partly-cloudy-day-snow.svg",
    },
    night: {
      description: "Light Snow",
      image: "partly-cloudy-night-snow.svg",
    },
  },
  "73": {
    day: {
      description: "Snow",
      image: "snow.svg",
    },
    night: {
      description: "Snow",
      image: "snow.svg",
    },
  },
  "75": {
    day: {
      description: "Heavy Snow",
      image: "overcast-snow.svg",
    },
    night: {
      description: "Heavy Snow",
      image: "overcast-snow.svg",
    },
  },
  "77": {
    day: {
      description: "Snow Grains",
      image: "snow.svg",
    },
    night: {
      description: "Snow Grains",
      image: "snow.svg",
    },
  },
  "80": {
    day: {
      description: "Light Showers",
      image: "partly-cloudy-day-drizzle.svg",
    },
    night: {
      description: "Light Showers",
      image: "partly-cloudy-night-drizzle.svg",
    },
  },
  "81": {
    day: {
      description: "Showers",
      image: "drizzle.svg",
    },
    night: {
      description: "Showers",
      image: "drizzle.svg",
    },
  },
  "82": {
    day: {
      description: "Heavy Showers",
      image: "overcast-drizzle.svg",
    },
    night: {
      description: "Heavy Showers",
      image: "overcast-drizzle.svg",
    },
  },
  "85": {
    day: {
      description: "Light Snow Showers",
      image: "partly-cloudy-day-sleet.svg",
    },
    night: {
      description: "Light Snow Showers",
      image: "partly-cloudy-night-sleet.svg",
    },
  },
  "86": {
    day: {
      description: "Snow Showers",
      image: "sleet.svg",
    },
    night: {
      description: "Snow Showers",
      image: "sleet.svg",
    },
  },
  "95": {
    day: {
      description: "Thunderstorm",
      image: "thunderstorms-day-rain.svg",
    },
    night: {
      description: "Thunderstorm",
      image: "thunderstorms-night-rain.svg",
    },
  },
  "96": {
    day: {
      description: "Light Thunderstorms With Hail",
      image: "thunderstorms-day-extreme-rain.svg",
    },
    night: {
      description: "Light Thunderstorms With Hail",
      image: "thunderstorms-night-extreme-rain.svg",
    },
  },
  "99": {
    day: {
      description: "Thunderstorm With Hail",
      image: "thunderstorms-day-extreme-rain.svg",
    },
    night: {
      description: "Thunderstorm With Hail",
      image: "thunderstorms-night-extreme-rain.svg",
    },
  },
};

import { Accessor, Signal, onCleanup } from "solid-js";

export function clickOutside(element: HTMLDivElement, accessor: any) {
  const onClick = (event: Event) => {
    if (!element.contains(event.target as HTMLInputElement)) {
      accessor()();
    }
  };

  document.addEventListener("click", onClick);
  onCleanup(() => document.removeEventListener("click", onClick));
}
