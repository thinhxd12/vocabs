import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    prerender: {
      crawlLinks: true,
    },
    preset: "vercel",
    compatibilityDate: "2024-11-18",
  },
  solid: {
    babel: {
      compact: true,
    },
  },
  vite: {
    resolve: {
      extensions: [
        ".mjs",
        ".js",
        ".mts",
        ".css",
        ".ts",
        ".jsx",
        ".tsx",
        ".json",
      ],
    },
  },
});
