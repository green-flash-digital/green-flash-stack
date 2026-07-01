# Getting Started

This guide walks you from a blank project to a working CLI binary.

---

## 1. Install

```bash
npm install --save-dev fizmoo
# or
yarn add --dev fizmoo
```

`fizmoo` is a dev dependency — it's a build tool, not a runtime library. The compiled binary has no dependency on fizmoo at runtime.

---

## 2. Create the config file

Create a `.fizmoo/` directory in your project root and add `config.ts`:

```
myproject/
└── .fizmoo/
    └── config.ts
```

```ts
// .fizmoo/config.ts
import { defineConfig, command } from "fizmoo";

export default defineConfig({
  name: "mycli",
  description: "My CLI tool",
  commands: [command("./commands/hello.ts")]
});
```

The `name` field becomes the binary name. The `commands` array is where you register every command file.

---

## 3. Create your first command

```
myproject/
└── .fizmoo/
    ├── config.ts
    └── commands/
        └── hello.ts
```

```ts
// .fizmoo/commands/hello.ts
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "hello",
  description: "Say hello",
  options: {
    name: {
      type: "string",
      alias: "n",
      description: "Who to greet",
      default: "world"
    }
  },
  action: async ({ options }) => {
    console.log(`Hello, ${options.name}!`);
  }
});
```

Every command file must have a **default export** from `defineCommand`.

---

## 4. Build

```bash
npx fizmoo build
```

This produces a `bin/` directory:

```
myproject/
└── bin/
    ├── index.js              ← entry point
    ├── fizmoo.manifest.json  ← runtime manifest
    └── commands/
        └── hello.js          ← compiled command
```

---

## 5. Run it

```bash
node bin/index.js           # shows root help
node bin/index.js hello     # Hello, world!
node bin/index.js hello -n Alice   # Hello, Alice!
node bin/index.js hello --help
```

---

## 6. Wire up the binary (optional)

To make your CLI executable as `mycli` instead of `node bin/index.js`, fizmoo automatically adds a `bin` entry to your `package.json` during the build. To install it globally or link it locally:

```bash
npm link         # makes `mycli` available in your shell
# or publish to npm, then:
npm install -g mycli
```

---

## 7. Dev mode (watch)

During development, run:

```bash
npx fizmoo dev
```

This starts a file watcher. Whenever you change a command file or the config, fizmoo rebuilds automatically. Your changes are live immediately — just re-run the binary.

---

## Auto-bootstrap

If you run `fizmoo build` in a directory that has no `.fizmoo/config.ts`, fizmoo will prompt you to bootstrap the project automatically. You can also set `autoInit: false` in your build script to skip the prompt and fail loudly instead.

---

## Next steps

- [Defining Commands](./commands.md) — options, args, nested sub-commands
- [Config & Command Tree](./config.md) — organizing a large CLI
- [Options & Args](./options-and-args.md) — validation, choices, defaults
- [Lifecycle Hooks](./hooks.md) — auth, logging, error handling
