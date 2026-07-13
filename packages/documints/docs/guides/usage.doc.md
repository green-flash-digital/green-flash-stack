---
title: Guides/Introduction/Usage
---

# Usage

The day-to-day loop, once a project is bootstrapped (see
[Getting Started](/guides/introduction/getting-started)):

## Write

Add a `.doc.md`/`.doc.mdx`/`.doc.tsx` file wherever it makes sense - the filesystem
location is purely organizational (see [Writing Docs](/guides/writing/writing-docs)). Give it a
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
See [Deploy](/guides/introduction/deploy) for platform-specific steps.

## Where things live

```txt
.documints/
├── .vite-cache/     # Vite's dev-server cache - safe to delete, gitignored
├── .server-build/   # Temporary SSR bundle, only during `documints build`, then deleted
├── .generated/      # Auto-generated types (e.g. defineDocumintsOrdering), gitignored
├── static/          # Build output - the deployable site, gitignored
├── content/         # Default location for .doc.* files (configurable via `docs`)
├── public/          # Static assets served as-is at the site root
├── head.html        # Optional raw HTML injected into <head>
└── config.ts        # Your project's configuration
```

See [Configuration](/guides/configuration) for `config.ts`, and
[Static Assets & Head](/guides/customization/static-assets) for `public/` and `head.html`.
`documints init` sets up the `.gitignore` for the generated/build directories automatically.

Fast refresh test line.
