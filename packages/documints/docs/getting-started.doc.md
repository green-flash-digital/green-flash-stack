---
title: Getting Started
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

```
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

Produces a `dist/` directory containing your complete static site: real, prerendered
`index.html` files for every route, plus the JS/CSS assets they reference. Deploy `dist/`
to any static host - there's no server process to run.

## Next steps

- [Guides/Writing Docs](/guides/writing-docs) - the frontmatter contract in detail.
- [Guides/Configuration](/guides/configuration) - `.documints/config.ts` options.
- [Reference/CLI](/reference/cli) - every command and flag.
