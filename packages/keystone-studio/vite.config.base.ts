import wyw from "@wyw-in-js/vite";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["globby"]
  },
  resolve: {
    tsconfigPaths: true
  },
  plugins: [
    wyw({
      include: "/**/*.(ts|tsx)"
    })
  ]
});
