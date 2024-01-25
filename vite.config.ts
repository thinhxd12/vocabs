import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    start: {
        server: {
            // pre-render all of our pages
            prerender: {
                crawlLinks: true
            },
            preset: "netlify"
        }
    }
});
