import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    start: {
        server: {
            prerender: {
                crawlLinks: true
            },
            preset: "netlify-edge",
        },
    },
});

