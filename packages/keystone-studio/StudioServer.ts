import { watch } from "node:fs";
import path from "node:path";

import { createRequestHandler } from "@react-router/express";
import type { Express, Response } from "express";
import express from "express";

export type StudioServerOptions = {
  port?: number;
  configPath: string;
  versionsDir: string;
};

export class StudioServer {
  #app: Express;
  #options: StudioServerOptions;
  #sseClients = new Set<Response>();

  constructor(options: StudioServerOptions) {
    this.#options = options;
    this.#app = express();
    this.#init();
  }

  #init() {
    const buildDir = path.resolve(import.meta.dirname, "./build");

    const studioClientAssets = path.resolve(buildDir, "./client");
    this.#app.use(express.static(studioClientAssets));

    // SSE endpoint — must be registered before the React Router catch-all
    this.#app.get("/api/tokens-watch", (req, res) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      this.#sseClients.add(res);
      req.on("close", () => this.#sseClients.delete(res));
    });

    watch(this.#options.configPath, () => {
      for (const client of this.#sseClients) {
        client.write("data: change\n\n");
      }
    });

    const studioServerEntry = path.resolve(buildDir, "./server/index.js");
    this.#app.use(
      createRequestHandler({
        build: async () => import(studioServerEntry),
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({
          tokensPath: this.#options.configPath,
          versionsDir: this.#options.versionsDir,
          isLocal: true,
        }),
      })
    );
  }

  listen() {
    const port = this.#options.port ?? 5700;
    this.#app.listen(port, () => {
      console.log(`🎨 The TokensStudio is running at http://localhost:${port}`);
    });
  }
}
