import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, mergeConfig } from "vite";

import baseConfig from "./vite.config.root";

// This is the SaaS build/dev config — kept at the conventional `vite.config.ts`
// filename since Cloudflare's own tooling (the Vite plugin, `wrangler`) expects
// to find it here with no --config flag. The local CLI build/dev path is
// `vite-local.config.ts` instead (deliberately non-default, passed explicitly).
export default mergeConfig(
  baseConfig,
  defineConfig({
    clearScreen: false,
    plugins: [cloudflare({ viteEnvironment: { name: "ssr" } }), reactRouter()]
  })
);
