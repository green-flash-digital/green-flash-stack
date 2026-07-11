---
title: Reference/CLI
---

# CLI Reference

Every command supports `--help`/`-h` for a generated usage summary.

## `documints init`

Bootstraps a new documints project in the current directory: `.documints/config.ts`, a
starter `content/welcome.doc.md` (with `home: true`), and a `.gitignore` covering the Vite
cache, the temporary server-only prerender bundle, and the built static site.

```sh
documints init
```

`documints dev`/`documints build` also accept `--auto-init`, which runs this
automatically instead of prompting when `.documints/` is missing - useful in CI or scripted
setups.

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

Builds the site for production into `.documints/static/`: a complete, prerendered static
site (real `index.html` per route, plus JS/CSS assets) ready to deploy to any static host.

| Option        | Type    | Default | Description                                                                |
| ------------- | ------- | ------- | --------------------------------------------------------------------------- |
| `--auto-init` | boolean | `false` | Bootstrap `.documints/` automatically if it's missing, instead of prompting |

```sh
documints build
```

Internally this runs a client build, a server-only build (used purely to render each
route's HTML, then deleted), and a prerender pass - see
[How Documints Works](/reference/how-it-works) for the full pipeline.
