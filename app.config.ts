import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    server: {
        prerender: {
            routes: ["/", "/about"]
        },
        preset: "netlify-edge",
    }
});
