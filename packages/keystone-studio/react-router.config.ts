import type { Config } from "@react-router/dev/config";

// Local (CLI) and SaaS (Cloudflare) builds must never clobber each other's
// output — build:local sets STUDIO_IS_LOCAL=true before invoking this.
const isLocalBuild = process.env.STUDIO_IS_LOCAL === "true";

export default {
  ssr: true,
  buildDirectory: isLocalBuild ? "build-local" : "build"
} satisfies Config;
