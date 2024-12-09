import { defineConfig } from "@solidjs/start/config";
import deno from "@deno/vite-plugin";

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
    plugins: [deno()],
  },
});
