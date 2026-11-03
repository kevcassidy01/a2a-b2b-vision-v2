import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// The link between /buyer and /seller on two devices (src/a2a/link.tsx): each
// page's moves come in on the dev server's own socket and go out to every page.
const a2aLink: Plugin = {
  name: "a2a-link",
  configureServer(server) {
    server.ws.on("a2a:link", (data) => server.ws.send("a2a:link", data));
  },
};

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
    : {
        plugins: [react(), tailwindcss(), a2aLink],
        build: { rollupOptions: { input: ['index.html', 'demo/index.html'] } },
      },
);
