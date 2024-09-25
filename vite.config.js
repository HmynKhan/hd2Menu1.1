import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // exclude: ["worker.js"], // Exclude worker.js from the dep optimizer
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"], // Exclude problematic dependencies
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Configure any necessary output options here
      },
    },
  },
});
