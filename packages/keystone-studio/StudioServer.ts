import { watch } from "node:fs";
import path from "node:path";

import { createRequestHandler } from "@react-router/express";
import type { Express, Response } from "express";
import express from "express";
import { exhaustiveMatchGuard } from "ts-jolt/isomorphic";

type StudioEnvVars = {
  KEYSTONE_CSS_STUDIO_PORT: number;
  KEYSTONE_CSS_STUDIO_IS_LOCAL: boolean;
  KEYSTONE_CSS_STUDIO_CONFIG_PATH: string;
  KEYSTONE_CSS_STUDIO_VERSION_DIR: string;
};

export type StudioServerOptions = {
  port?: number;
  configPath: string;
  versionsDir: string;
};

export class StudioServer {
  private _app: Express;
  private _sseClients = new Set<Response>();

  constructor(options: StudioServerOptions) {
    this._app = express();
    this._setEnvVars({
      KEYSTONE_CSS_STUDIO_CONFIG_PATH: options.configPath,
      KEYSTONE_CSS_STUDIO_VERSION_DIR: options.versionsDir,
      KEYSTONE_CSS_STUDIO_IS_LOCAL: true,
      KEYSTONE_CSS_STUDIO_PORT: options?.port ?? 5700
    });
    this._init();
  }

  /**
   * Set;s multiple environment vars at once
   */
  private _setEnvVars(envVars: Partial<StudioEnvVars>) {
    for (const [varName, varValue] of Object.entries(envVars)) {
      this._setEnvVar(varName as keyof StudioEnvVars, varValue);
    }
  }

  /**
   * Set's a value to the environment variable to be used later
   */
  private _setEnvVar<T extends keyof StudioEnvVars, K extends StudioEnvVars[T]>(
    envVar: T,
    value: K
  ) {
    process.env[envVar] = value.toString();
  }

  private _init() {
    const buildDir = path.resolve(import.meta.dirname, "./build");

    // Serve static files from the build/client directory
    const studioClientAssets = path.resolve(buildDir, "./client");
    this._app.use(express.static(studioClientAssets));

    // SSE endpoint — must be registered before the React Router catch-all
    this._app.get("/api/tokens-watch", (req, res) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      this._sseClients.add(res);
      req.on("close", () => this._sseClients.delete(res));
    });

    // Watch tokens.json and push change events to connected clients
    const tokensPath = this._getEnvVar("KEYSTONE_CSS_STUDIO_CONFIG_PATH");
    if (tokensPath) {
      watch(tokensPath, () => {
        for (const client of this._sseClients) {
          client.write("data: change\n\n");
        }
      });
    }

    // Middleware to handle React Router requests
    const studioServerEntry = path.resolve(buildDir, "./server/index.js");
    this._app.use(
      createRequestHandler({
        build: async () => import(studioServerEntry),
        mode: process.env.NODE_ENV
      })
    );
  }

  /**
   * Private method to resolve environment variables
   * with overrides provided either by internal variables
   * or variables from an external source
   */
  private _getEnvVar<T extends keyof StudioEnvVars, K extends StudioEnvVars[T]>(
    envVar: T,
    override?: K | undefined
  ): K {
    const value = override ?? (process.env[envVar] as K | undefined);

    switch (envVar) {
      case "KEYSTONE_CSS_STUDIO_PORT":
        return Number(value ?? 5700) as K;

      case "KEYSTONE_CSS_STUDIO_IS_LOCAL":
        return (value ?? false) as K;

      case "KEYSTONE_CSS_STUDIO_CONFIG_PATH":
      case "KEYSTONE_CSS_STUDIO_VERSION_DIR":
        return (value ?? "") as K;

      default:
        return exhaustiveMatchGuard(envVar);
    }
  }

  listen() {
    const port = this._getEnvVar("KEYSTONE_CSS_STUDIO_PORT");
    this._app.listen(port, () => {
      console.log(`🎨 The TokensStudio is running at http://localhost:${port}`);
    });
  }
}
