# Options & Args

Commands receive input through two mechanisms: **options** (named flags) and **args** (positional values).

---

## Options

Options are named flags passed as `--key value`, `--key=value`, or `-alias value`.

```ts
export default defineCommand({
  options: {
    port: {
      type: "number",
      alias: "p",
      description: "Port to listen on",
      default: 3000
    },
    watch: {
      type: "boolean",
      alias: "w",
      description: "Rebuild on change"
    },
    env: {
      type: "string",
      alias: "e",
      description: "Target environment",
      required: true
    }
  },
  action: async ({ options }) => {
    options.port; // number
    options.watch; // boolean
    options.env; // string
  }
});
```

### Common fields

| Field         | Type                                | Description                                 |
| ------------- | ----------------------------------- | ------------------------------------------- |
| `type`        | `"boolean" \| "string" \| "number"` | Value type                                  |
| `description` | `string`                            | Shown in help menu                          |
| `alias`       | `string`                            | Short flag (e.g. `"p"` → `-p`)              |
| `required`    | `boolean`                           | If `true`, build will error if not provided |
| `default`     | `boolean \| string \| number`       | Value when not provided by user             |

### Boolean options

```ts
verbose: { type: "boolean", alias: "v", description: "Enable verbose output" }
```

Usage:

```bash
mycli build --verbose          # true
mycli build --verbose=true     # true
mycli build --verbose=false    # false
mycli build -v                 # true
```

A bare boolean flag (no value) defaults to `true`. If the option has a `default` set, that is used instead when the flag is absent.

### String options

```ts
output: {
  type: "string",
  alias: "o",
  description: "Output directory",
  default: "./dist",
  validate: (value) => value.startsWith("./"),
}
```

Usage:

```bash
mycli build --output ./build
mycli build --output=./build
mycli build -o ./build
```

### Number options

```ts
timeout: {
  type: "number",
  alias: "t",
  description: "Timeout in seconds",
  default: 30,
  validate: (value) => value > 0 && value <= 300,
}
```

### validate

`validate` is an optional function `(value) => boolean`. If it returns `false`, the runtime throws an error before the action runs. Use it for domain-specific constraints that go beyond the type system:

```ts
port: {
  type: "number",
  description: "Port number",
  validate: (value) => value >= 1024 && value <= 65535,
}
```

### Help flag

Every command automatically gets `--help` / `-h`. You do not need to declare it.

---

## Args

Args are positional values — they appear after the command name without a flag prefix, in declaration order.

```ts
export default defineCommand({
  name: "deploy",
  description: "Deploy to an environment",
  args: {
    environment: {
      name: "environment",
      type: "string",
      description: "Target environment",
      required: true,
      choices: ["prod", "staging", "dev"]
    },
    version: {
      name: "version",
      type: "string",
      description: "Version tag to deploy",
      default: "latest"
    }
  },
  action: async ({ args }) => {
    args.environment; // string
    args.version; // string
  }
});
```

Usage:

```bash
mycli deploy prod
mycli deploy prod v1.2.3
```

### Common fields

| Field         | Type                                | Description                         |
| ------------- | ----------------------------------- | ----------------------------------- |
| `name`        | `string`                            | Display name used in help output    |
| `type`        | `"boolean" \| "string" \| "number"` | Value type                          |
| `description` | `string`                            | Shown in help menu                  |
| `required`    | `boolean`                           | If `true`, errors when not provided |
| `default`     | matching type                       | Value when not provided             |

### String args

```ts
format: {
  name: "format",
  type: "string",
  description: "Output format",
  choices: ["json", "yaml", "toml"],
  length: { min: 2, max: 10 },
  validate: (value) => !value.includes(" "),
}
```

| Constraint   | Description                |
| ------------ | -------------------------- |
| `choices`    | Allowlist of valid values  |
| `length.min` | Minimum character length   |
| `length.max` | Maximum character length   |
| `validate`   | Custom validation function |

### Number args

```ts
count: {
  name: "count",
  type: "number",
  description: "Number of items",
  choices: [1, 5, 10, 50],
  range: { min: 1, max: 100 },
  validate: (value) => Number.isInteger(value),
}
```

| Constraint  | Description                |
| ----------- | -------------------------- |
| `choices`   | Allowlist of valid values  |
| `range.min` | Minimum value              |
| `range.max` | Maximum value              |
| `validate`  | Custom validation function |

### Boolean args

```ts
force: {
  name: "force",
  type: "boolean",
  description: "Skip confirmation",
  default: false,
}
```

Boolean args are matched by position. Pass `true`, `false`, or `1`/`0`:

```bash
mycli reset true
```

### Positional ordering

Args are matched to their definitions **by position**, in the order they are declared. The order of keys in the `args` object is the order the user must supply them:

```ts
args: {
  source: { ... },  // argv[0] after command
  target: { ... },  // argv[1] after command
}
```

```bash
mycli copy ./src ./dist
#          ^^^^  ^^^^^^
#          source target
```

### Options vs. args

Use **options** when:

- The value is optional
- The user might skip it or provide it in any order
- It's a mode toggle (e.g. `--watch`, `--verbose`)

Use **args** when:

- The value is a primary subject of the command (e.g. a filename, environment name)
- The order is meaningful and predictable
- You want a terser invocation (`mycli deploy prod` vs. `mycli deploy --env prod`)
