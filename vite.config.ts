import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `--mode share` (npm run build:share): the A2A prototype alone, inlined into
// one HTML file (scripts, styles, fonts, images, sounds) in dist-share/, to
// send round and open from a double-click.
export default defineConfig(({ mode }) =>
  mode === "share"
    ? {
        plugins: [react(), tailwindcss(), viteSingleFile()],
        // public/ is the earlier demos'; everything the prototype shows is imported.
        publicDir: false,
        build: { outDir: "dist-share", rollupOptions: { input: "share.html" } },
      }
    : { plugins: [react(), tailwindcss()] },
);
