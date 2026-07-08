import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, mergeConfig } from "vite";

import baseConfig from "./vite.config.root";

// Deliberately diverges from the `vite.config.ts` default-filename convention —
// that name is reserved for the SaaS build (what Cloudflare's own tooling
// expects to find with no --config flag). This file builds/serves the local
// CLI experience (Express + FileSystemAdapter): no Cloudflare Vite plugin, since
// there's no workerd runtime involved here. Used explicitly via
// `--config vite-local.config.ts` (react-router build) or `configFile` (scripts/dev.ts).
// Output directory (build-local/, vs. build/ for SaaS) is controlled by
// react-router.config.ts reading STUDIO_IS_LOCAL — set that before invoking this
// config (build:local's package.json script does).
export default mergeConfig(
  baseConfig,
  defineConfig({
    clearScreen: false,
    plugins: [reactRouter()]
  })
);
