import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: [
      // Resolve workspace packages to their TypeScript source so tests don't need a built dist
      {
        find: "@green-flash/ts-utils/isomorphic",
        replacement: path.resolve(__dirname, "../ts-utils/src/isomorphic/index.ts"),
      },
      {
        find: "@greenflash/http-errors",
        replacement: path.resolve(__dirname, "../http-errors/src/index.ts"),
      },
      // Strip .js extensions so Vitest resolves NodeNext-style imports to .ts source files
      { find: /^(.*?)\.js$/, replacement: "$1" },
    ],
  },
});
