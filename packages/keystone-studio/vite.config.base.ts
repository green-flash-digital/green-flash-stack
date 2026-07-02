import wyw from "@wyw-in-js/vite";
import { defineConfig, mergeConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  optimizeDeps: {
    exclude: ["globby"]
  },
  plugins: [
    wyw({
      include: "/**/*.(ts|tsx)",
      babelOptions: {
        compact: false,
        presets: ["@babel/preset-typescript", "@babel/preset-react"]
      }
    }),
    tsconfigPaths()
  ]
});
