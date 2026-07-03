import path from "node:path";

import wyw from "@wyw-in-js/vite";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["globby"]
  },
  resolve: {
    tsconfigPaths: true,
    // SEE IF THERE IS A BETTER WAY TO DO THIS with the package.json
    alias: [
      {
        find: /^@keystone-css\/core$/,
        replacement: path.resolve(import.meta.dirname, "../keystone-core/dist/client.js")
      }
    ]
  },
  plugins: [
    wyw({
      include: "/**/*.(ts|tsx)"
    })
  ]
});
