# Defining Commands

Every command is a TypeScript file with a single default export from `defineCommand`.

---

## Basic structure

```ts
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "build",
  description: "Compile the project",
  action: async () => {
    console.log("Building...");
  }
});
```

| Field         | Type       | Required | Description                                        |
| ------------- | ---------- | -------- | -------------------------------------------------- |
| `name`        | `string`   | yes      | The token the user types (e.g. `mycli build`)      |
| `description` | `string`   | yes      | Shown in help menus                                |
| `options`     | `Options`  | no       | Key/value flags (e.g. `--watch`, `--port 3000`)    |
| `args`        | `Args`     | no       | Positional arguments (e.g. `mycli deploy prod`)    |
| `action`      | `function` | yes\*    | The function that runs when the command is invoked |

\*Parent commands (those with sub-commands declared in config) don't need an `action` — they show a help menu automatically.

---

## Type inference

`defineCommand` infers the `action` parameter types from your `options` and `args` definitions. You never need to add type annotations manually:

```ts
export default defineCommand({
  options: {
    port: { type: "number", description: "Port to listen on", default: 3000 },
    watch: { type: "boolean", description: "Enable watch mode" },
    env: { type: "string", description: "Target environment", default: "development" }
  },
  action: async ({ options }) => {
    // options.port  → number
    // options.watch → boolean
    // options.env   → string
  }
});
```

---

## Leaf commands vs. parent commands

A **leaf command** has no sub-commands declared in the config tree. It must have an `action`. Running it executes the action.

A **parent command** has sub-commands registered under it in `defineConfig`. Its `action` is optional — if omitted, fizmoo shows the help menu when the user runs it. If provided, the action is never called directly (sub-commands take precedence based on argv).

```ts
// parent command — no action needed
export default defineCommand({
  name: "deploy",
  description: "Deployment commands"
});
```

```ts
// leaf command — action is required
export default defineCommand({
  name: "prod",
  description: "Deploy to production",
  action: async () => {
    /* ... */
  }
});
```

---

## Help menu

Every command gets a `--help` / `-h` flag automatically. Running `mycli build --help` prints:

```
Usage:
  mycli build [--options]

Description:
  Compile the project

Options:
  --help, -h   Display the help menu [boolean] (optional)
  --watch, -w  Rebuild on file changes [boolean] (optional)
```

You do not need to write this — it's generated from the command definition.

---

## One default export per file

Each command file must export exactly one `defineCommand` call as the default export. Named exports are ignored by the build pipeline.

```ts
// correct
export default defineCommand({ ... });

// wrong — named export, will be ignored
export const myCommand = defineCommand({ ... });
```

---

## Command naming

The `name` field in `defineCommand` is what the user types. It must:

- Not match the CLI name itself
- Be unique within its level of the command tree

The file name does not matter for routing — only the `name` field inside `defineCommand` determines how the command is addressed.

---

## Next: Options & Args

See [Options & Args](./options-and-args.md) for all option types, validation, defaults, and choices.
