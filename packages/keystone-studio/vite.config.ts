import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, mergeConfig } from "vite";

import baseConfig from "./vite.config.base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    clearScreen: false,
    plugins: [reactRouter()]
  })
);
