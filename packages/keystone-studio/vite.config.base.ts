import wyw from "@wyw-in-js/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  server: {
    warmup: {
      // Pre-bundle before the first request so middleware mode doesn't 504
      clientFiles: ["./app/root.tsx"]
    }
  },
  optimizeDeps: {
    // Scan only the app entry so dep discovery is deterministic across lockfile changes
    entries: ["./app/root.tsx"],
    // Explicit include list prevents mid-request discovery that causes 504s in middleware mode
    include: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/client",
      "react-router",
      "react-router/dom"
    ],
    exclude: ["globby"]
  },
  resolve: {
    tsconfigPaths: true
  },
  plugins: [
    wyw({
      // Scope to app source files only — the previous "/**/*" pattern matched all
      // TypeScript files on the filesystem including node_modules
      include: ["**/*.{ts,tsx}"],
      exclude: ["node_modules"]
    }),
    devtoolsJson()
  ]
});
