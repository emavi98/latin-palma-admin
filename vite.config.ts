import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import path from "path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), viteReact()],
  resolve: {
    alias: {
      utils: path.resolve(__dirname, "./src/utils"),
      components: path.resolve(__dirname, "./src/components"),
    },
  },
});
