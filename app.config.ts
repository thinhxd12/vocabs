import { defineConfig } from "@solidjs/start/config";
import preload from "vite-plugin-preload";

export default defineConfig({
    vite: {
        plugins: [preload()],
    },
    server: {
        prerender: {
            crawlLinks: true
        },
        preset: "netlify-edge",
    }
});
