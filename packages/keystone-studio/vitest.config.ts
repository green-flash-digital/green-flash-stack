import path from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

export default defineConfig({
  test: {
    environment: "node",
    include: ["app/**/__tests__/**/*.test.ts", "app/**/__tests__/**/*.test-d.ts"]
  },
  resolve: {
    alias: [
      {
        find: "@green-flash/ts-utils/isomorphic",
        replacement: path.resolve(root, "packages/ts-utils/src/isomorphic/index.ts")
      },
      {
        find: "@keystone-css/studio-tokens",
        replacement: path.resolve(root, "packages/keystone-studio-tokens/.keystone/index.ts")
      },
      {
        find: "@keystone-css/core/schemas",
        replacement: path.resolve(root, "packages/keystone-core/src/schemas/index.ts")
      },
      {
        find: "@keystone-css/core/utils",
        replacement: path.resolve(root, "packages/keystone-core/src/utils/index.ts")
      },
      // Strip .js extensions for NodeNext-style imports
      { find: /^(.*?)\.js$/, replacement: "$1" }
    ]
  }
});
