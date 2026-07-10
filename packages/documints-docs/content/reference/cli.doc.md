---
title: Reference/CLI
---

# CLI Reference

Every command supports `--help`/`-h` for a generated usage summary.

## `documints init`

Bootstraps a new documints project in the current directory: `.documints/config.ts`, a
starter `welcome.doc.md` (with `home: true`), and a `.gitignore` for the Vite cache.

```sh
documints init
```

## `documints dev`

Starts the development server with hot module reloading.

| Option        | Alias | Type    | Default     | Description                             |
| ------------- | ----- | ------- | ----------- | ---------------------------------------- |
| `--port`      | `-p`  | number  | `3000`      | Port to run the dev server on            |
| `--host`      |       | string  | `localhost` | Host to bind the dev server to           |
| `--open`      | `-o`  | boolean | `false`     | Open the dev server in your browser      |
| `--auto-init` |       | boolean | `false`     | Bootstrap `.documints/` automatically if it's missing, instead of prompting |

```sh
documints dev --port 4000 --open
```

## `documints build`

Builds the site for production: a full static `dist/` directory, prerendered and ready to
deploy to any static host.

| Option        | Type    | Default | Description                                                                |
| ------------- | ------- | ------- | --------------------------------------------------------------------------- |
| `--auto-init` | boolean | `false` | Bootstrap `.documints/` automatically if it's missing, instead of prompting |

```sh
documints build
```
