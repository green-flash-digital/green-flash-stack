import { access, readFile, rm } from "node:fs/promises";
import path from "node:path";

import { input } from "@inquirer/prompts";
import { default as esbuild } from "esbuild";
import { Isoscribe } from "isoscribe";
import { tryHandle } from "@green-flash/ts-utils/isomorphic";
import { writeFileRecursive } from "@green-flash/ts-utils/node";

import type { FizmooUserConfig } from "./_fizmoo.types.js";

export const LOG = new Isoscribe({
  name: "fizmoo",
  logFormat: "string",
  logLevel: "debug"
});

/**
 * Walks up the directory tree from startDir (default: cwd) looking for
 * `.fizmoo/config.ts`. Returns the resolved paths on success, null if not found.
 */
export async function findFizmooConfigFile(startDir?: string): Promise<{
  configFile: string;
  dirPath: string;
} | null> {
  let dir = startDir ?? process.cwd();
  while (true) {
    const configFile = path.resolve(dir, ".fizmoo/config.ts");
    const res = await tryHandle(access)(configFile);
    if (res.success) {
      return { configFile, dirPath: path.resolve(dir, ".fizmoo") };
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Compiles `.fizmoo/config.ts` with esbuild in-process, imports the result,
 * and returns the resolved FizmooUserConfig from the default export.
 */
export async function loadFizmooConfig(configFile: string): Promise<FizmooUserConfig> {
  const tempFile = path.resolve(path.dirname(configFile), `_fizmoo_config_${Date.now()}.mjs`);
  try {
    await esbuild.build({
      entryPoints: [configFile],
      outfile: tempFile,
      bundle: true,
      format: "esm",
      platform: "node",
      packages: "external",
      logLevel: "silent"
    });
    const mod = await import(tempFile);
    if (!mod.default) {
      throw new Error(
        "config.ts must have a default export: `export default defineConfig({ ... })`"
      );
    }
    return mod.default as FizmooUserConfig;
  } finally {
    await rm(tempFile, { force: true }).catch(() => {});
  }
}

/**
 * Interactively scaffolds the required fizmoo directories and files.
 */
export async function bootstrap() {
  const rootDir = await input({
    message: `Where would you like to create your ".fizmoo/" directory?`,
    required: true,
    default: process.cwd()
  });

  const packageJsonPath = path.resolve(rootDir, "./package.json");
  const fizmooDir = path.resolve(rootDir, "./.fizmoo");
  const fizmooConfigPath = path.resolve(fizmooDir, "./config.ts");
  const commandsDir = path.resolve(fizmooDir, "./commands");

  let name = "";
  let description = "";

  const resPackageJson = await tryHandle(readFile)(packageJsonPath, "utf8");
  if (resPackageJson.success) {
    const json = JSON.parse(resPackageJson.data.toString());
    name = json.name ?? "";
    description = json.description ?? "";
  }

  name = await input({
    message: "What would you like the CLI name to be? (This will also be the binary name)",
    default: name || undefined
  });

  description = await input({
    message: "Please provide a short description of the CLI",
    default: description || undefined
  });

  const configContent = `import { defineConfig, command } from "fizmoo";

export default defineConfig({
  name: "${name}",
  description: "${description}",
  commands: [
    command("./commands/start-here.ts"),
  ],
});
`;

  const configRes = await tryHandle(writeFileRecursive)(fizmooConfigPath, configContent);
  if (configRes.success === false) throw configRes.error;

  const firstCommandPath = path.resolve(commandsDir, "./start-here.ts");
  const firstCommandContent = `import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "start-here",
  description: "My first fizmoo command",
  action: async () => {
    console.log("Hello from fizmoo!");
  },
});
`;

  const firstCommandRes = await tryHandle(writeFileRecursive)(
    firstCommandPath,
    firstCommandContent
  );
  if (firstCommandRes.success === false) throw firstCommandRes.error;

  return configRes.data;
}
