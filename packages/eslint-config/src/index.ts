import type { Linter } from "eslint";

import { greenFlashBase } from "./_base.js";

type GreenFlashTSOptions = {
  /**
   * The location of the tsconfigs that you wish to load in
   *
   * - `monorepo` Looks for the .tsconfig in all of the <root>/packages/<package>/tsconfig.json
   * - `basic` - For apps / libraries that are standalone. Looks for the .tsconfig at <root>/tsconfig.json
   */
  type: "monorepo" | "basic";
};

const projectMap: { [key in GreenFlashTSOptions["type"]]: string } = {
  monorepo: "packages/*/tsconfig.json",
  basic: "tsconfig.json",
};

/**
 * A function that returns an eslint config that will set
 * linting standards for any combination of a node and react
 * typescript project
 */
function ts(options: GreenFlashTSOptions): Linter.Config[] {
  return [
    ...greenFlashBase,
    {
      files: ["**/*.{ts,tsx}"],
      settings: {
        react: {
          version: "detect",
        },
        "import/resolver": {
          typescript: {
            // Use the TypeScript configuration file
            project: projectMap[options.type],
            alwaysTryTypes: true,
          },
          node: {
            // Allow resolving node modules
            extensions: [".js", ".jsx", ".ts", ".tsx"],
          },
        },
      },
    },
  ];
}

export default {
  configs: {
    ts,
  },
};
