import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    start: {
        // middleware: "./src/api/middleware.ts",
        server: {
            // pre-render all of our pages
            prerender: {
                crawlLinks: true
            },
            preset: "netlify-edge"
        }
    }
});
