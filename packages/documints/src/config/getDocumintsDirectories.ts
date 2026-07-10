import { readFileSync } from "node:fs";
import path from "node:path";

import type { DocumintsConfig } from "./_config.utils.js";

/**
 * Resolves documints' own installed package root (the directory containing
 * `app/` and `dist/`) by walking up from wherever this module is actually
 * running. This can't assume a fixed depth relative to `import.meta.dirname`:
 * when imported directly it's `dist/`, but fizmoo's esbuild bundling inlines
 * this whole module into each compiled `bin/commands/*.js`, so at CLI
 * runtime `import.meta.dirname` is `bin/commands/` instead. Matching on the
 * package.json's `name` handles both without hardcoding either depth.
 */
function getDocumintsPackageRoot(): string {
  let dir = import.meta.dirname;
  while (true) {
    try {
      const packageJson = JSON.parse(readFileSync(path.resolve(dir, "./package.json"), "utf8"));
      if (packageJson.name === "documints") return dir;
    } catch {
      // no readable/parsable package.json here - keep walking up
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not locate the documints package root.");
    }
    dir = parent;
  }
}

/**
 * Returns absolute path directories for referencing where a documints
 * project's content lives, where documints' own app shell lives, and where
 * build output should go. `dotDirPath` is the resolved `.documints/`
 * directory found in the consuming project.
 */
export function getDocumintsDirectories(_config: DocumintsConfig, dotDirPath: string) {
  const rootDir = path.dirname(dotDirPath);
  const packageRoot = getDocumintsPackageRoot();
  const appRoot = path.resolve(packageRoot, "./app");

  const serverEntryFileName =
    process.env.NODE_ENV === "production" ? "entry.server.static.tsx" : "entry.server.tsx";

  return {
    /**
     * The anchor that the `docs` glob, each doc's `aliasPath`, and the
     * `@docs` vite alias are all resolved relative to - the `.documints/`
     * directory itself, not a fixed "content" subfolder. This is what lets
     * `config.docs` point anywhere reachable via a relative path, including
     * outside `.documints/` entirely (e.g. a sibling `content/` folder at
     * the project root, one level up).
     */
    srcDocs: {
      root: dotDirPath,
      public: path.resolve(dotDirPath, "./_public")
    },
    app: {
      root: appRoot,
      viteCacheDir: path.resolve(dotDirPath, "./.vite-cache"),
      appEntryServer: path.resolve(appRoot, serverEntryFileName),
      appEntryClient: path.resolve(appRoot, "./entry.client.tsx"),
      css: {
        docsUI: path.resolve(packageRoot, "./dist/lib/documints.css")
      }
    },
    output: {
      /** The final, deployable static site - plain HTML/CSS/JS, servable anywhere. */
      root: path.resolve(rootDir, "./dist"),
      /**
       * Where the SSR bundle used to prerender each route gets built.
       * Internal-only: never part of the deployed static output, and
       * removed once the build finishes.
       */
      serverBundleDir: path.resolve(dotDirPath, "./.server-build")
    }
  };
}

export type DocumintsDirs = ReturnType<typeof getDocumintsDirectories>;
