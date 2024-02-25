// import { defineConfig } from "@solidjs/start/config";
import preload from "vite-plugin-preload";

// export default defineConfig({
//     plugins: [preload()],
//     start: {
//         server: {
//             prerender: {
//                 crawlLinks: true
//             },
//             preset: "netlify-edge",
//         },
//     },
// });


import { defineConfig } from "@solidjs/start/config";
export default defineConfig({
    plugins: [preload()],
    start: {
        server: {
            prerender: {
                crawlLinks: true
            },
            preset: "cloudflare-pages",
            rollupConfig: {
                external: ["node:async_hooks"]
            }
        }
    }
});