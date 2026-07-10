import path from "node:path";

import { LOG } from "@documints/core";
import react from "@vitejs/plugin-react";
import wyw from "@wyw-in-js/vite";
import { defineConfig, build as viteBuild } from "vite";

import packageJson from "../package.json" with { type: "json" };

/**
 * Builds the library that the app uses for client and server components
 * as well as the components needed to render the shell of the app.
 *
 * This is done here since the components need to be built outside of the app.
 * the `wyw` plugin ignores any vite resolved IDs from node modules so we can't built
 * these styles when they're being sourced from node_modules. So we build them
 * using Vite here and then just import them much like we to the DocumintServer
 * and DocumintClient apps
 */
async function buildLibrary() {
  LOG.debug("Building the documints library for consumption in the SSR app...");
  const packageRoot = path.resolve(import.meta.dirname, "..");

  const entry = {
    app: path.resolve(packageRoot, "app/index.ts"),
    server: path.resolve(packageRoot, "src/server/index.ts"),
    "server.dev": path.resolve(packageRoot, "src/server.dev/index.ts"),
    "server.static": path.resolve(packageRoot, "src/server.static/index.ts"),
    "plugin-interactive-preview/vite": path.resolve(
      packageRoot,
      "src/plugin-interactive-preview/vite/index.ts"
    ),
    "plugin-interactive-preview/ui": path.resolve(
      packageRoot,
      "src/plugin-interactive-preview/ui/index.ts"
    )
  };

  try {
    const config = defineConfig({
      logLevel: "silent",
      build: {
        lib: {
          formats: ["es"],
          entry,
          fileName(_format, entryName) {
            return `${entryName}/index.js`;
          }
        },
        rollupOptions: {
          external: [
            ...Object.keys(packageJson.dependencies),
            "@documints/core/css",
            "@documints/core/app",
            "@documints/core/server",
            "@documints/core/plugin-interactive-preview/vite",
            "@documints/core/plugin-interactive-preview/ui",
            "react/jsx-runtime",
            "react-dom/server",
            "virtual:data",
            "virtual:routes",
            "node:stream",
            "node:fs",
            "node:path",
            /node_modules/
          ],
          output: {
            dir: path.resolve(import.meta.dirname, "../dist/lib"),
            // Pin this explicitly rather than letting Rollup infer it from
            // the package name - `getDirectories()`'s `app.css.docsUI` (in
            // Documints.ts) hardcodes this exact filename.
            assetFileNames: (assetInfo) =>
              assetInfo.names?.some((name) => name.endsWith(".css"))
                ? "documints.css"
                : "[name][extname]"
            // preserveModules: true,
          }
        }
      },
      plugins: [
        react(),
        // @ts-expect-error This actually does have type signatures
        wyw({
          include: ["**/*.{ts,tsx}"],
          babelOptions: {
            presets: ["@babel/preset-typescript", "@babel/preset-react"]
          }
        })
      ]
    });

    await viteBuild(config);

    LOG.debug("Building the documints library for consumption in the SSR app... done.");
  } catch (error) {
    throw LOG.fatal(new Error(`Error when building the documints library: ${error}`));
  }
}

buildLibrary();
