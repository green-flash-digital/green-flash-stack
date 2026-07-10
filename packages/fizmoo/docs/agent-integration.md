# Agent Integration

fizmoo CLIs are natively parseable by AI agents and other programmatic consumers. Every command exposes a `--help=json` flag that returns a machine-readable JSON description of the command — its options, args, and sub-commands — in a stable, predictable shape.

---

## --help=json

Pass `--help=json` to any command (including the root command) to get structured output instead of the human-readable help menu.

```bash
mycli --help=json
mycli build --help=json
mycli deploy prod --help=json
```

The output is a single JSON object printed to stdout. Exit code is always `0`.

---

## Output shape

```ts
{
  command: string;           // full invocation path, e.g. "mycli build"
  description: string;       // command description from defineCommand
  options: {                 // user-defined options (--help excluded)
    [optionName: string]: {
      type: "boolean" | "string" | "number";
      description: string;
      alias?: string;        // short flag, e.g. "d" for -d
      required?: boolean;
      default?: boolean | string | number;
    };
  };
  args: {                    // positional arguments in declaration order
    [argName: string]: {
      name: string;
      type: "boolean" | "string" | "number";
      description: string;
      required?: boolean;
      default?: boolean | string | number;
    };
  };
  subCommands: Array<{       // direct children only
    id: string;              // dot-notation ID, e.g. "deploy.prod"
    name: string;
    description: string;
  }>;
}
```

The implicit `--help` / `-h` flag is **excluded** from `options` — it is always available but you don't need to model it.

---

## Example: root command

```bash
$ mycli --help=json
```

```json
{
  "command": "mycli",
  "description": "My CLI tool",
  "options": {},
  "args": {},
  "subCommands": [
    {
      "id": "deploy",
      "name": "deploy",
      "description": "Deploy to an environment"
    },
    {
      "id": "logs",
      "name": "logs",
      "description": "Stream logs from a deployment"
    }
  ]
}
```

---

## Example: leaf command with options and args

```bash
$ mycli deploy --help=json
```

```json
{
  "command": "mycli deploy",
  "description": "Deploy to an environment",
  "options": {
    "dry-run": {
      "type": "boolean",
      "alias": "n",
      "description": "Preview changes without applying them",
      "default": false
    }
  },
  "args": {
    "environment": {
      "name": "environment",
      "type": "string",
      "description": "Target environment",
      "required": true
    }
  },
  "subCommands": []
}
```

---

## Agent usage pattern

An agent can fully discover and invoke a fizmoo CLI by walking the command tree:

1. Call `<cli> --help=json` to get the root description and top-level sub-commands.
2. For each sub-command in `subCommands`, call `<cli> <subcommand> --help=json` to get its full description.
3. Repeat recursively until `subCommands` is empty (leaf command reached).
4. Invoke the leaf command by name, passing resolved options and args.

Because `options` and `args` include types, descriptions, defaults, and required flags, an agent has everything it needs to populate values correctly without any out-of-band documentation.

---

## Combining with human-readable help

`--help=json` and `--help` (human-readable) are independent. Passing `--help` without a value, or any bare `--help`, returns the formatted text menu. Only the explicit `=json` suffix triggers JSON mode.

```bash
mycli build --help        # formatted text menu
mycli build --help=json   # machine-readable JSON
```

---

## Sub-command IDs

The `id` field in `subCommands` uses dot-notation and corresponds directly to the command path:

| ID               | Invocation             |
| ---------------- | ---------------------- |
| `deploy`         | `mycli deploy`         |
| `deploy.prod`    | `mycli deploy prod`    |
| `deploy.staging` | `mycli deploy staging` |

Agents can use the `id` to reconstruct the invocation by replacing `.` with spaces and prepending the CLI name.
