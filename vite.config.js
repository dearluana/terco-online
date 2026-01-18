import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.js",
    css: true,
    globals: true,
    coverage: {
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["src/test/**", "src/**/__tests__/**"],
    },
  },
});
