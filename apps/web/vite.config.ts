import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: "ssr" },
      // miniflare: {
      // 	inspectorPort: 9229
      // }
    }),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  server: {
    port: 3001,
    strictPort: true,
    host: true,
  },
});
