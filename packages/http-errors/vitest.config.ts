import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
  },
  resolve: {
    // Strip .js extensions so Vitest resolves NodeNext-style imports to .ts source files
    alias: [{ find: /^(.*?)\.js$/, replacement: "$1" }],
  },
});
