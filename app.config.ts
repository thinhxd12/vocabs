import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    server: {
        prerender: {
          crawlLinks: true,
        },
        preset: "vercel",
      },
      solid: {
        babel: {
          compact: true,
        },
      },
});
