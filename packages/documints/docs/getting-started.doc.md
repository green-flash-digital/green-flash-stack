---
title: Guides/Introduction/Getting Started
description: Install, bootstrap, and run your first documints site.
related:
  - /guides/introduction/deploy
---

# Getting Started

## Install

```sh
yarn add --dev documints
```

`documints` is a dev dependency - it's a build tool, not a runtime library. The static
site it produces has no dependency on documints at runtime.

## Bootstrap a project

```sh
yarn documints init
```

This scaffolds:

```tsx
your-project/
└── .documints/
    ├── config.ts
    └── content/
        └── welcome.doc.md
```

`welcome.doc.md` is created with `home: true` in its frontmatter, so it's immediately
servable as your site's root page.

## Develop

```sh
yarn documints dev
```

Starts a dev server with hot module reloading. Edit any `.doc.md` file and see the change
immediately - no restart needed.

## Build

```sh
yarn documints build
```

Produces `.documints/static/`: real, prerendered `index.html` files for every route, plus
the JS/CSS assets they reference. Deploy that directory to any static host - there's no
server process to run. It's gitignored by default (`documints init` sets that up for you),
same as the Vite cache.

## Next steps

- [Guides/Introduction/Usage](/guides/introduction/usage) - the day-to-day write/preview/build/deploy loop.
- [Guides/Introduction/Deploy](/guides/introduction/deploy) - the top 5 static hosts, step by step.
- [Guides/Writing/Writing Docs](/guides/writing/writing-docs) - the frontmatter contract in detail.
- [Guides/Customization/Routing](/guides/customization/routing) - how hierarchy, the nav, and the header connect.
- [Guides/Configuration](/guides/configuration) - `.documints/config.ts` options.
- [Guides/Advanced/Plugins](/guides/advanced/plugins) - built-in and third-party Vite plugins.
- [Reference/CLI](/reference/cli) - every command and flag.
- [Reference/How Documints Works](/reference/how-it-works) - the architecture, end to end.
