import path from "node:path";
import { cp, readdir, writeFile } from "node:fs/promises";

import { parseAndValidateOptions } from "@buttery/core/utils";
import { ensureFile } from "fs-extra";
import { build as viteBuild } from "vite";


import type { ButteryDocsBuildOptions } from "./_cli-scripts.utils.js";
import { butteryDocsBuildOptionsSchema } from "./_cli-scripts.utils.js";

import { getButteryDocsRouteManifest } from "../build/getButteryDocsRouteManifest.js";
import { getButteryDocsViteConfig } from "../build/getButteryDocsViteConfig.js";
import { getButteryDocsConfig } from "../config/getButteryDocsConfig.js";
import { LOG } from "../utils/util.logger.js";

process.env.NODE_ENV = "production";

export async function build(options?: ButteryDocsBuildOptions) {
  const parsedOptions = parseAndValidateOptions(
    butteryDocsBuildOptionsSchema,
    options,
    LOG
  );
  LOG.level = parsedOptions.logLevel;

  // Process and store configurations
  LOG.loadingStart("Building @buttery/docs");
  const rConfig = await getButteryDocsConfig({
    prompt: parsedOptions.prompt,
    logLevel: parsedOptions.logLevel,
  });

  const viteConfig = getButteryDocsViteConfig(rConfig);
  const butteryManifest = getButteryDocsRouteManifest(rConfig);

  try {
    LOG.debug("Building client bundle for production...");
    await viteBuild({
      logLevel: "silent",
      root: rConfig.dirs.app.root,
      ...viteConfig,
      build: {
        emptyOutDir: true,
        manifest: true,
        outDir: path.resolve(rConfig.dirs.output.bundleDir, "./client"),
        rollupOptions: {
          input: rConfig.dirs.app.appEntryClient,
        },
      },
    });
    LOG.debug("Building client bundle for production... done");

    LOG.debug("Building server bundle for production...");
    await viteBuild({
      logLevel: "silent",
      root: rConfig.dirs.app.root,
      ...viteConfig,
      build: {
        emptyOutDir: true,
        ssrManifest: true,
        ssr: rConfig.dirs.app.appEntryServer,
        outDir: path.resolve(rConfig.dirs.output.bundleDir, "./server"),
        rollupOptions: {
          output: {
            entryFileNames: "server.js",
          },
        },
      },
    });
    LOG.debug("Building server bundle for production... done");

    // create the buttery manifest
    try {
      const butteryManifestPath = path.resolve(
        rConfig.dirs.output.bundleDir,
        "./client/.buttery/buttery.manifest.json"
      );
      LOG.debug("Writing buttery manifest.json...");
      await ensureFile(butteryManifestPath);
      await writeFile(
        butteryManifestPath,
        JSON.stringify(butteryManifest, null, 2),
        { encoding: "utf8" }
      );
      LOG.debug("Writing buttery manifest.json... done.");
    } catch (error) {
      throw LOG.fatal(new Error(error as string));
    }

    switch (rConfig.config.buildTarget) {
      case "cloudflare-pages": {
        // move functions to local dist
        const functionsDir = path.resolve(rConfig.dirs.app.root, "./functions");

        await cp(
          functionsDir,
          path.resolve(rConfig.dirs.output.root, "./functions"),
          {
            recursive: true,
          }
        );
        break;
      }

      default:
        break;
    }
    LOG.loadingEnd("complete!");

    // Report the success
    const filesAndDirs = await readdir(rConfig.dirs.output.root, {
      recursive: true,
      withFileTypes: true,
    });

    const files = filesAndDirs.filter((dirent) => dirent.isFile());
    LOG.success(`Successfully built documentation app!

      Location: ${rConfig.dirs.output.root}
      Total Files: ${files.length}

    ${files.reduce(
      (accum, file) =>
        accum.concat(
          `    - ${path.relative(
            rConfig.dirs.output.root,
            `${file.parentPath}/${file.name}`
          )}\n`
        ),
      ""
    )}
    `);
  } catch (error) {
    throw LOG.fatal(new Error(error as string));
  }
}
