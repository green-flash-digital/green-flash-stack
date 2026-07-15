import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import wyw from "@wyw-in-js/vite";
import { defineConfig } from "vite";

import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  build: {
    outDir: path.resolve(import.meta.dirname, "./dist"),
    lib: {
      entry: path.resolve(import.meta.dirname, "./src/index.ts"),
      fileName(_format, entryName) {
        return `${entryName}.js`;
      },
      formats: ["es"]
    },
    rollupOptions: {
      output: {
        preserveModules: true
      },
      external: Object.keys(packageJson.dependencies)
        .concat(Object.keys(packageJson.peerDependencies ?? {}))
        .concat("react/jsx-runtime", "@green-flash/ts-utils/isomorphic")
    }
  },
  resolve: {
    alias: {
      "#": path.resolve(import.meta.dirname, "./src")
    }
  },
  plugins: [
    react(),
    wyw({
      include: "/**/*.(ts|tsx)",
      babelOptions: {
        compact: false,
        presets: ["@babel/preset-typescript", "@babel/preset-react"]
      }
    })
  ]
});
