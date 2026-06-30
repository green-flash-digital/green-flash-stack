# fizmoo

A TypeScript-first framework for building type-safe, self-documenting Node.js CLIs.

You declare commands in a single config file. fizmoo compiles them into a standalone binary with a generated help system, argument validation, and option parsing — all fully inferred from your TypeScript types.

---

## Packages

| Package | Description |
|---|---|
| [`@fizmoo/core`](./core) | Library: types, `defineCommand`, `defineConfig`, runtime, build pipeline |
| [`fizmoo`](./fizmoo) | CLI tool: `fizmoo build` and `fizmoo dev` — itself built with fizmoo |

---

## Quick start

```bash
npm install --save-dev fizmoo
```

Create `.fizmoo/config.ts` in your project root:

```ts
import { defineConfig, command } from "fizmoo";

export default defineConfig({
  name: "mycli",
  description: "My CLI tool",
  commands: [
    command("./commands/greet.ts"),
  ],
});
```

Create `.fizmoo/commands/greet.ts`:

```ts
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "greet",
  description: "Greet someone",
  options: {
    name: {
      type: "string",
      alias: "n",
      description: "Who to greet",
      default: "world",
    },
  },
  action: async ({ options }) => {
    console.log(`Hello, ${options.name}!`);
  },
});
```

Build and run:

```bash
npx fizmoo build
yarn sandbox greet
yarn sandbox greet --name Alice
yarn sandbox greet -n Alice
```

---

## Documentation

- [Getting Started](./docs/getting-started.md) — from zero to working CLI
- [Defining Commands](./docs/commands.md) — the `defineCommand` API
- [Config & Command Tree](./docs/config.md) — `defineConfig`, `command()`, nesting
- [Options & Args](./docs/options-and-args.md) — types, validation, defaults
- [Lifecycle Hooks](./docs/hooks.md) — `onBeforeAction`, `onAfterAction`, `onError`
- [CLI Reference](./docs/cli.md) — `fizmoo build` and `fizmoo dev`
