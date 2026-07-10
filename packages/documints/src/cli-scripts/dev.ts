import { parseAndValidateOptions } from "@buttery/core/utils";
import express from "express";
import open from "open";
import { createServer } from "vite";

import type { ButteryDocsDevOptions } from "./_cli-scripts.utils.js";
import { butteryDocsDevOptionsSchema } from "./_cli-scripts.utils.js";

import { getButteryDocsViteConfig } from "../build/getButteryDocsViteConfig.js";
import { getButteryDocsConfig } from "../config/getButteryDocsConfig.js";
import { handleRequestDev } from "../lib/server.dev/handleRequest.dev.js";
import { LOG } from "../utils/util.logger.js";

process.env.NODE_ENV = "development";

export async function dev(options?: Partial<ButteryDocsDevOptions>) {
  const parsedOptions = parseAndValidateOptions(
    butteryDocsDevOptionsSchema,
    options,
    LOG
  );
  LOG.level = parsedOptions.logLevel;

  LOG.info("Starting @buttery/docs DevServer...");

  // Process and store configurations
  const rConfig = await getButteryDocsConfig({
    prompt: parsedOptions.prompt,
    logLevel: parsedOptions.logLevel,
  });
  const viteConfig = getButteryDocsViteConfig(rConfig);

  // Set some constants
  const PORT = parsedOptions.port;
  const HOSTNAME = `http://${parsedOptions.host}`;
  const HOSTNAME_AND_PORT = `${HOSTNAME}:${PORT}`;

  // create an express app
  const app = express();

  // create the vite middleware
  LOG.debug("Creating vite server & running in middleware mode.");
  const vite = await createServer({
    ...viteConfig,
    root: rConfig.dirs.app.root, // Root directory for the Vite project
    appType: "custom", // Avoid Vite's default HTML handling,
    clearScreen: false,
    server: {
      middlewareMode: true, // Enable SSR middleware mode
      hmr: {
        port: 3005,
      },
    },
  });

  // Add vite as middleware
  app.use(vite.middlewares);

  // Serve the HTML upon every request for a full page reload
  // This will only happen on full refresh and then the client
  // will be hydrated and any subsequent applications will be managed
  // by the react router
  app.use("*", async (req, res) => {
    // Load the server-entry file as a module using vite
    LOG.debug(
      `Loading the server entry file "${rConfig.dirs.app.appEntryServer}"`
    );
    const ssrEntryModule = await vite.ssrLoadModule(
      rConfig.dirs.app.appEntryServer
    );

    // Run the dev handler which is a combination of node and express
    await handleRequestDev(ssrEntryModule.render, {
      req,
      res,
      dirs: rConfig.dirs,
      vite,
    });
  });

  app.listen(PORT, () => {
    LOG.watch(`@buttery/docs DevServer running on ${HOSTNAME_AND_PORT}`);

    // Open the DevServer if it has been configured to do so
    if (!parsedOptions.open) return;
    open(HOSTNAME_AND_PORT);
  });
}
