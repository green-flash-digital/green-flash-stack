import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    typecheck: {
      enabled: true,
      only: true,
      include: ["src/__tests__/**/*.test-d.ts"],
      // tsc type-checks the whole program, not just the include-matched
      // files — without this, unrelated pre-existing errors elsewhere in
      // the package (e.g. scripts/) would fail this run too.
      ignoreSourceErrors: true
    },
    // No runtime tests today — this project only needs type-level regression
    // coverage (see src/__tests__). Keep `include` empty so a plain
    // `vitest run` doesn't fail with "no tests found".
    include: []
  },
  resolve: {
    // Strip .js extensions so Vitest resolves NodeNext-style imports to .ts source files
    alias: [{ find: /^(.*?)\.js$/, replacement: "$1" }]
  }
});
