import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Chunking: Splits code into smaller files so the site loads faster
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          react: ["react", "react-dom"],
          drei: ["@react-three/drei"],
          postprocessing: ["@react-three/postprocessing"],
        },
      },
    },
    // 2. Asset Handling: Ensures large files don't break the build
    chunkSizeWarningLimit: 1000,
  },
});
