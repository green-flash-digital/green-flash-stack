# @green-flash/eslint-config

A shareable ESLint flat configuration for TypeScript projects using React and Node.js. This configuration provides opinionated best practices for code quality, consistency, and maintainability.

## Features

- ✅ **ESLint Flat Config** - Uses the modern ESLint flat config format (ESLint 9+)
- ✅ **TypeScript Support** - Full TypeScript linting with `typescript-eslint`
- ✅ **React Support** - React and React Hooks linting with JSX runtime support
- ✅ **Import Management** - Enforces consistent import order and resolves TypeScript paths
- ✅ **Monorepo Ready** - Supports both monorepo and standalone project structures
- ✅ **Smart Defaults** - Configured with recommended rules from ESLint, TypeScript, React, and Import plugins
- ✅ **Build Directory Ignoring** - Automatically ignores common build and cache directories

## Installation

Install the package and its peer dependencies:

```sh
yarn add --dev eslint @green-flash/eslint-config
```

Or with npm:

```sh
npm install --save-dev eslint @green-flash/eslint-config
```

## Usage

### Basic Setup (Standalone Project)

For standalone applications or libraries, use the `basic` type:

```js
// eslint.config.js
import greenFlashEslint from "@green-flash/eslint-config";

export default greenFlashEslint.configs.ts({ type: "basic" });
```

This configuration will look for your TypeScript configuration at `<root>/tsconfig.json`.

### Monorepo Setup

For monorepo projects (e.g., Yarn workspaces, npm workspaces), use the `monorepo` type:

```js
// eslint.config.js
import greenFlashEslint from "@green-flash/eslint-config";

export default greenFlashEslint.configs.ts({ type: "monorepo" });
```

This configuration will look for TypeScript configurations in all `<root>/packages/*/tsconfig.json` files.

### Extending the Configuration

You can extend the base configuration with additional rules or overrides:

```js
// eslint.config.js
import greenFlashEslint from "@green-flash/eslint-config";

export default [
  ...greenFlashEslint.configs.ts({ type: "monorepo" }),
  {
    files: ["**/*.test.{js,ts,jsx,tsx}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.config.{js,ts}"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
```

## Configuration Options

The `configs.ts()` function accepts an options object:

```typescript
{
  type: "monorepo" | "basic";
}
```

- **`type: "monorepo"`** - For monorepo projects. Looks for TypeScript configs in `packages/*/tsconfig.json`
- **`type: "basic"`** - For standalone projects. Looks for TypeScript config at `tsconfig.json`

## What's Included

This configuration includes:

- **ESLint Recommended Rules** - Core JavaScript best practices
- **TypeScript ESLint** - TypeScript-specific linting rules
- **React Plugin** - React and JSX linting (with JSX runtime support)
- **React Hooks Plugin** - React Hooks linting rules
- **Import Plugin** - Import/export validation and ordering
- **TypeScript Import Resolver** - Resolves TypeScript path mappings
- **Custom Rules**:
  - Consistent type imports (`@typescript-eslint/consistent-type-imports`)
  - Unused variables detection (with `_` prefix ignore pattern)
  - Import ordering and grouping
  - Import resolution validation

## Ignored Directories

The following directories are automatically ignored:

- `**/.turbo/**`
- `**/.wrangler/**`
- `**/dist/**`
- `**/bin/**`
- `**/.store/**`
- `**/.react-router/**`
- `**/.vite-cache/**`
- `**/.yarn/**`

## Requirements

- ESLint 9.21.0 or higher
- Node.js 18+ (for ES modules support)
- TypeScript 5.8.2 or higher (if using TypeScript)

## License

MIT License

## Contributing

Issues and pull requests are welcome! Please see the [repository](https://github.com/green-flash-digital/green-flash-stack) for more information.
