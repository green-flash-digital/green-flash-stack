import path from "node:path";

import react from "@vitejs/plugin-react";
import wyw from "@wyw-in-js/vite";
import { defineConfig, build as viteBuild } from "vite";


import packageJson from "../package.json" with { type: "json" };
import { LOG } from "../src/utils/util.logger.js";

/**
 * Builds the library that the app uses for client and server components
 * as well as the components needed to render the shell of the app.
 *
 * This is done here since the components need to be built outside of the app.
 * the `wyw` plugin ignores any vite resolved IDs from node modules so we can't built
 * these styles when they're being sourced from node_modules. So we build them
 * using Vite here and then just import them much like we to the ButteryDocsServer
 * and ButteryDocsClient apps
 */
async function buildLibrary() {
  LOG.debug(
    "Building the @buttery/docs library for consumption in the SSR app..."
  );
  const libBasePath = path.resolve(import.meta.dirname, "../src/lib/");

  const entry = [
    "client",
    "app",
    "server",
    "server.dev",
    "server.cloudflare-pages",
    "plugin-interactive-preview/vite",
    "plugin-interactive-preview/ui",
  ].reduce((accum, entryName) => {
    const entryPath = path.resolve(libBasePath, `${entryName}/index.ts`);
    return Object.assign(accum, { [entryName]: entryPath });
  }, {});

  try {
    const config = defineConfig({
      logLevel: "silent",
      build: {
        lib: {
          formats: ["es"],
          entry: {
            index: path.resolve(libBasePath, "./index.ts"),
            ...entry,
          },
          fileName(_format, entryName) {
            return `${entryName}/index.js`;
          },
        },
        rollupOptions: {
          external: [
            ...Object.keys(packageJson.dependencies),
            "@buttery/tokens",
            "@buttery/meta/react",
            "@buttery/docs/css",
            "@buttery/docs/app",
            "@buttery/docs/server",
            "@buttery/docs/client",
            "@buttery/docs/plugin-interactive-preview/vite",
            "@buttery/docs/plugin-interactive-preview/ui",
            "@buttery/core",
            "@buttery/core/utils/isomorphic",
            "@buttery/logs",
            "react/jsx-runtime",
            "react-dom/server",
            "virtual:data",
            "virtual:routes",
            "node:stream",
            "node:fs",
            "node:path",
            /node_modules/,
          ],
          output: {
            dir: path.resolve(import.meta.dirname, "../dist/lib"),
            // preserveModules: true,
          },
        },
      },
      plugins: [
        react(),
        // @ts-expect-error This actually does have type signatures
        wyw({
          include: ["**/*.{ts,tsx}"],
          babelOptions: {
            presets: ["@babel/preset-typescript", "@babel/preset-react"],
          },
        }),
      ],
    });

    await viteBuild(config);

    LOG.debug(
      "Building the @buttery/docs library for consumption in the SSR app... done."
    );
  } catch (error) {
    throw LOG.fatal(
      new Error(`Error when building the @buttery/docs library: ${error}`)
    );
  }
}

buildLibrary();
