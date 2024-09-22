import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["worker.js"], // Exclude worker.js from the dep optimizer
  },
});

// export default {
//   optimizeDeps: {
//     exclude: ['worker.js'], // Exclude worker.js from the dep optimizer
//   },
// };
