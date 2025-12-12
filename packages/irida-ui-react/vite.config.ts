import path from "node:path";
import fs from "node:fs/promises";
import wyw from "@wyw-in-js/vite";

import { defineConfig } from "vite";

async function getDependencyKeys() {
  const packageJsonPath = path.resolve(import.meta.dirname, "./package.json");
  const packageJson = await fs.readFile(packageJsonPath, { encoding: "utf8" });
  const json = JSON.parse(packageJson);
  return Object.keys(json.dependencies);
}

async function getSrcEntryPoints() {
  const srcPath = path.resolve(import.meta.dirname, "./src");
  const dirents = await fs.readdir(srcPath, { withFileTypes: true });
  // Fixed: We want an array of promises. Use .map to generate promises for each directory (not files), then await. Filter to directories first.
  const indexTsPaths = await Promise.all(
    dirents
      .filter((dirent) => dirent.isDirectory())
      .map(async (dirent) => {
        const indexTsPath = path.resolve(srcPath, dirent.name, "index.ts");
        try {
          await fs.access(indexTsPath);
        } catch {
          throw new Error(`Missing an "index.ts" file in "${dirent.name}"`);
        }
        return indexTsPath;
      })
  );

  const paths = await Promise.all(indexTsPaths);
  return paths;
}

export default defineConfig(async () => {
  const dependencyKeys = await getDependencyKeys();
  const entry = await getSrcEntryPoints();

  return defineConfig({
    plugins: [
      // @ts-expect-error The types don't line up
      wyw({
        displayName: process.env.NODE_ENV === "production",
        include: ["**/*.{ts,tsx}"],
        babelOptions: {
          presets: ["@babel/preset-typescript", "@babel/preset-react"],
        },
      }),
    ],
    build: {
      lib: {
        entry,
        formats: ["es"],
        fileName: (_, entryName) => entryName.concat(".js"),
      },
      outDir: path.resolve(__dirname, "./dist"),
      rollupOptions: {
        output: {
          preserveModules: true,
        },
        external: dependencyKeys.concat(["@linaria/core", "react/jsx-runtime"]),
      },
    },
  });
});
