import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginImport from "eslint-plugin-import";
import pluginHooks from "eslint-plugin-react-hooks";
import type { Linter } from "eslint";

export const greenFlashBase: Linter.Config[] = [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat["jsx-runtime"],
    settings: {
      react: {
        version: "detect", // or specify a version manually like '18.2'
      },
    },
  },
  pluginImport.flatConfigs.recommended,
  // Globally ignore some directories
  {
    ignores: [
      "**/.turbo/**",
      "**/.wrangler/**",
      "**/dist/**",
      "**/bin/**",
      "**/.store/**",
      "**/.react-router/**",
      "**/.vite-cache/**",
      "**/.yarn/**",
    ],
  },
  {
    plugins: { "react-hooks": pluginHooks },
    settings: {
      "import/resolver": {
        typescript: {
          // Use the TypeScript configuration file
          project: "./tsconfig.json",
          alwaysTryTypes: true,
        },
        node: {
          // Allow resolving node modules
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      ...pluginHooks.configs.recommended.rules,
      "react/prop-types": 0,
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "import/order": [
        1,
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "sibling",
            "parent",
            "index",
          ],
          "newlines-between": "always",
          pathGroups: [
            {
              group: "external",
              pattern: "react",
              position: "before",
            },
          ],
        },
      ],
      "import/no-unresolved": "error",
      "import/no-extraneous-dependencies": "error",
      "import/newline-after-import": "error",
    },
  },
];
