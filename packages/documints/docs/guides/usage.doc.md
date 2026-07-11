---
title: Guides/Usage
---

# Usage

The day-to-day loop, once a project is bootstrapped (see
[Getting Started](/getting-started)):

## Write

Add a `.doc.md`/`.doc.mdx`/`.doc.tsx` file wherever it makes sense - the filesystem
location is purely organizational (see [Writing Docs](/guides/writing-docs)). Give it a
`title`, and it's live.

## Preview

```sh
yarn documints dev
```

Edit content while the dev server runs and see it reflected immediately - no restart.
Adding, renaming, or removing a `.doc.*` file also picks up live, since the route manifest
is rebuilt on any change under the docs directory.

## Build

```sh
yarn documints build
```

Prerenders every route to `.documints/static/` - real `index.html` files, not a
client-only shell. Nothing in that output depends on Node, Vite, or documints itself at
runtime.

## Deploy

`.documints/static/` is a plain static site - hand it to any static host (GitHub Pages,
Netlify, Cloudflare Pages, S3, whatever you already use) exactly like you would a
hand-written HTML/CSS/JS bundle. There's no server process to configure or keep running.

## Where things live

| Path                       | What it is                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `.documints/config.ts`     | Your project's configuration - see [Configuration](/guides/configuration) |
| `.documints/content/`      | Default location for `.doc.*` files (configurable via `docs`) |
| `.documints/public/`       | Static assets served as-is at the site root - see [Static Assets & Head](/guides/static-assets) |
| `.documints/head.html`     | Optional raw HTML injected into `<head>` - see [Static Assets & Head](/guides/static-assets) |
| `.documints/.vite-cache/`  | Vite's dev-server cache - safe to delete, gitignored          |
| `.documints/.server-build/`| Temporary SSR bundle used only during `documints build` to prerender routes, then deleted |
| `.documints/static/`       | Build output - the deployable site, gitignored                |

`documints init` sets up the `.gitignore` for the last three automatically.
