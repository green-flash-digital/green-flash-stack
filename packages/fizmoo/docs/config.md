# Config & Command Tree

`.fizmoo/config.ts` is the single entry point fizmoo reads at build time. It declares your CLI's identity and registers every command.

---

## defineConfig

```ts
import { defineConfig, command } from "fizmoo";

export default defineConfig({
  name: "mycli",
  description: "My CLI tool",
  version: "1.0.0",
  commands: [
    command("./commands/build.ts"),
    command("./commands/deploy.ts"),
  ],
});
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes | CLI name and binary name |
| `description` | `string` | yes | Shown in root help menu |
| `version` | `string` | no | Shown in `--version` output |
| `hooks` | `FizmooHooks` | no | Lifecycle hooks (see [Hooks](./hooks.md)) |
| `commands` | `FizmooCommandEntry[]` | yes | Registered command files |

---

## command()

`command(file, children?)` registers a command file. The path is relative to `config.ts`.

```ts
command("./commands/build.ts")
```

The first argument is the source file path. The optional second argument is an array of child `command()` calls, which establishes parent/child relationships in the command tree.

---

## Nested sub-commands

Nesting a `command()` inside another makes it a sub-command. The user runs it as `mycli deploy prod`:

```ts
export default defineConfig({
  name: "mycli",
  description: "My CLI",
  commands: [
    command("./commands/build.ts"),
    command("./commands/deploy.ts", [
      command("./commands/deploy-prod.ts"),
      command("./commands/deploy-staging.ts"),
    ]),
  ],
});
```

```
mycli build          → runs build.ts action
mycli deploy         → shows deploy.ts help (parent command)
mycli deploy prod    → runs deploy-prod.ts action
mycli deploy staging → runs deploy-staging.ts action
```

The `name` field in each command file's `defineCommand` call determines the token the user types. The nesting in `command()` determines parent/child relationships. These two things are independent — you can put files anywhere and nest them however makes sense.

---

## Deep nesting

You can nest commands to any depth:

```ts
commands: [
  command("./commands/cloud.ts", [
    command("./commands/cloud-aws.ts", [
      command("./commands/cloud-aws-deploy.ts"),
      command("./commands/cloud-aws-destroy.ts"),
    ]),
    command("./commands/cloud-gcp.ts"),
  ]),
]
```

```
mycli cloud               → help
mycli cloud aws           → help
mycli cloud aws deploy    → runs action
mycli cloud aws destroy   → runs action
mycli cloud gcp           → runs action
```

---

## File layout

Command files can live anywhere — they don't have to be in `.fizmoo/commands/`. The path in `command()` is just a relative file reference:

```ts
commands: [
  command("../../src/commands/build.ts"),   // outside .fizmoo/
  command("./commands/dev.ts"),              // inside .fizmoo/
]
```

The conventional location is `.fizmoo/commands/` but there is no requirement.

---

## Build output

Each command file compiles to `bin/commands/<relative-path>.js`. For example:

| Source | Output |
|---|---|
| `.fizmoo/commands/build.ts` | `bin/commands/build.js` |
| `.fizmoo/commands/deploy-prod.ts` | `bin/commands/deploy-prod.js` |

The `bin/fizmoo.manifest.json` is the runtime contract that maps command IDs to their compiled file locations, options, args, and help text. It is generated at build time and read at runtime by `FizmooRuntime`.

---

## Root help

When the user runs `mycli` with no arguments (or `mycli --help`), fizmoo shows a help menu derived from `defineConfig.name`, `defineConfig.description`, and the list of top-level commands:

```
Usage:
  mycli <subcommand>

Description:
  My CLI tool

Sub-commands:
  build   Compile the project
  deploy  Deployment commands
```
