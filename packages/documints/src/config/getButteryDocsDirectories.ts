import path from "node:path";

import type { ButteryConfigPaths } from "@buttery/core/config";
import { findDirectoryUpwards } from "@buttery/utils/node";
import type { ButteryLogLevel } from "@buttery/logs";
import { getNodeModulesButteryOutputDir } from "@buttery/core/utils";

import type { ButteryDocsConfig } from "./_config.utils.js";

import { LOG } from "../utils/util.logger.js";

/**
 * Returns some absolute path directories for easily referencing directories
 * that we should be pulling files from or serving content.
 */
export async function getButteryDocsDirectories(
  config: ButteryDocsConfig,
  paths: ButteryConfigPaths,
  { logLevel }: { logLevel: ButteryLogLevel }
) {
  LOG.checkpointStart("resolve docs dir");

  const nodeModulesDocsDir = await getNodeModulesButteryOutputDir(
    paths.butteryDir,
    "docs",
    { logLevel }
  );

  const userCreatedDocsDir = path.resolve(paths.butteryDir, "./docs");

  const templatesRootDir = path.resolve(
    nodeModulesDocsDir.target,
    "./templates"
  );

  const appRootDir = path.resolve(nodeModulesDocsDir.target, "./app");
  const serverEntryFileName =
    process.env.NODE_ENV === "production"
      ? `entry.server.${config.buildTarget}.tsx`
      : "entry.server.tsx";
  const appEntryServer = path.join(appRootDir, serverEntryFileName);

  // output dirs
  const outputRootDir = path.resolve(userCreatedDocsDir, "./dist");
  const outputBundleDir = path.resolve(outputRootDir, "./build");

  // initial css
  const docsUiCSS = path.resolve(
    findDirectoryUpwards("node_modules", "@buttery", {
      startingDirectory: import.meta.dirname,
    }) as string,
    "./docs/dist/lib/style.css"
  );

  LOG.checkpointEnd("resolve docs dir");

  return {
    /**
     * The docs that are created and stored by the user. This is where
     * they create their markdown|mdx files to then be created into
     * the app
     */
    srcDocs: {
      root: userCreatedDocsDir,
      public: path.resolve(userCreatedDocsDir, "./_public"),
    },
    app: {
      root: appRootDir,
      viteCacheDir: path.resolve(paths.storeDir, "./docs/.vite-cache"),
      appEntryServer,
      appEntryClient: path.resolve(appRootDir, "./entry.client.tsx"),
      css: {
        docsUI: docsUiCSS,
      },
    },
    templates: {
      root: templatesRootDir,
      manifest: path.resolve(templatesRootDir, "./template-manifest.json"),
    },
    output: {
      root: outputRootDir,
      bundleDir: outputBundleDir,
    },
  };
}
