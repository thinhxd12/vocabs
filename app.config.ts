import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    prerender: {
      crawlLinks: true,
    },
    preset: "vercel",
    compatibilityDate: "2024-11-18",
  },
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
});
