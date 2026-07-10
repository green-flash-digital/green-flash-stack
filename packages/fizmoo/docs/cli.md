# CLI Reference

The `fizmoo` CLI has two commands: `build` and `dev`.

---

## fizmoo build

Compiles your CLI to a standalone binary in `bin/`.

```bash
npx fizmoo build
```

### What it does

1. Walks up from the current directory to find `.fizmoo/config.ts`
2. Compiles and imports `config.ts` to read your `defineConfig` export
3. Runs esbuild on every command file declared in the `commands` array
4. For each compiled command, imports it to read `name`, `description`, `options`, and `args`
5. Builds the manifest (`bin/fizmoo.manifest.json`) with all command metadata and help text
6. Writes `bin/index.js` — the entry point that boots `FizmooRuntime`

### Output

```
bin/
├── index.js              ← entry point
├── fizmoo.manifest.json  ← runtime manifest
└── commands/
    └── *.js              ← one compiled file per command
```

### Options

| Flag         | Alias | Type    | Default | Description                       |
| ------------ | ----- | ------- | ------- | --------------------------------- |
| `--debug`    | `-d`  | boolean | `false` | Enable verbose build logging      |
| `--autoInit` | `-ai` | boolean | `true`  | Bootstrap `.fizmoo/` if not found |

### autoInit

If `--autoInit` is `true` (the default) and no `.fizmoo/config.ts` is found, fizmoo will prompt you to create one interactively. Set `--autoInit=false` to skip the prompt and fail immediately instead.

---

## fizmoo dev

Starts a file watcher. Whenever a command file changes, fizmoo rebuilds and logs the result.

```bash
npx fizmoo dev
```

### What it does

Everything `fizmoo build` does, plus sets up an esbuild watch context. Any change to a file in the command tree triggers a rebuild.

### Options

Same as `fizmoo build`:

| Flag         | Alias | Type    | Default | Description                       |
| ------------ | ----- | ------- | ------- | --------------------------------- |
| `--debug`    | `-d`  | boolean | `false` | Enable verbose logging            |
| `--autoInit` | `-ai` | boolean | `true`  | Bootstrap `.fizmoo/` if not found |

### Typical workflow

```bash
# terminal 1 — watch mode
npx fizmoo dev

# terminal 2 — run the CLI
node bin/index.js <command>
```

---

## Running without global install

If `fizmoo` is a project dev dependency, use `npx`:

```bash
npx fizmoo build
npx fizmoo dev
```

Or add scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "fizmoo build",
    "dev": "fizmoo dev"
  }
}
```

---

## Log levels

Set `FIZMOO_LOG_LEVEL` to override the log level at runtime:

```bash
FIZMOO_LOG_LEVEL=debug npx fizmoo build
```

Values: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.

---

## Exit behavior

`fizmoo build` exits `0` on success and non-zero on any error (invalid command file, missing action, manifest validation failure). CI pipelines can rely on the exit code.
