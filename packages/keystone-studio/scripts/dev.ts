import { watch } from "node:fs";
import path from "node:path";

import { createRequestHandler } from "@react-router/express";
import type { Response } from "express";
import type { ServerBuild } from "react-router";
import express from "express";
import { createServer } from "vite";

const tokensPath = path.resolve(import.meta.dirname, "../.keystone/tokens.json");
const versionsDir = path.resolve(import.meta.dirname, "../.keystone/_versions");

const app = express();
const sseClients = new Set<Response>();

const viteServer = await createServer({
  server: { middlewareMode: true },
});

app.use(viteServer.middlewares);

app.get("/api/tokens-watch", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  sseClients.add(res);
  req.on("close", () => sseClients.delete(res));
});

watch(tokensPath, () => {
  for (const client of sseClients) {
    client.write("data: change\n\n");
  }
});

app.use(
  createRequestHandler({
    build: () => viteServer.ssrLoadModule("virtual:react-router/server-build") as Promise<ServerBuild>,
    getLoadContext: () => ({
      tokensPath,
      versionsDir,
      isLocal: true,
    }),
  })
);

const port = 5700;
app.listen(port, () => {
  console.log(`🎨 Studio dev server running at http://localhost:${port}`);
});
