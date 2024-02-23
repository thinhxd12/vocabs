import { defineConfig } from "@solidjs/start/config";
import preload from "vite-plugin-preload";

export default defineConfig({
    plugins: [preload()],
    start: {
        server: {
            prerender: {
                crawlLinks: true
            },
            preset: "netlify",
        },
    },
});
