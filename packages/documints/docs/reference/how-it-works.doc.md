---
title: Reference/How Documints Works
slug: how-it-works
---

# How Documints Works

A tour of the actual machinery behind `documints dev`/`documints build`, for anyone
extending documints itself or just curious what's happening under the hood.

## One package, plus design tokens

`documints` - the CLI you install - owns the whole thing: the
[fizmoo](https://github.com/green-flash-digital/fizmoo)-defined commands (`dev`/`build`/`init`),
config resolution, doc discovery, the Vite pipeline, and the app shell (`Layout`, header, nav)
your docs render inside, all in one package.

That's deliberate, not an oversight: the shell and a specific project's own doc content have
to compile together, in the same Vite build, every single time `dev`/`build` runs. Splitting
that across a package boundary only adds indirection - a self-referencing import here, a
`tsconfig` `rootDir` to reason about there - without buying anything, since nothing outside
documints itself ever needs the shell on its own.

The one piece that *is* split out is design tokens (`@documints/tokens`) - genuinely useful
independent of the engine, so it's built and versioned separately with chamfer-css.

## The `Documints` class

Nearly everything documints does is reached through one class. Its shape mirrors what it
does:

- **Static methods handle finding and locating**, since they run *before* an instance
  exists: `Documints.findConfigFile()` walks up from `cwd` looking for
  `.documints/config.ts`; `Documints.loadConfig()` compiles that file in-process with
  esbuild and validates it against a Zod schema; `Documints.getDirectories()` resolves
  every path documints needs (content root, app root, output paths) from there.
  `Documints.create()` chains all three (offering to scaffold a project via
  `Documints.bootstrap()` if none is found) and returns a constructed instance - or `null`
  if the user declines.
- **Instance methods handle parsing and building**, since they operate on the resolved
  config/paths a specific instance holds: discovering docs into a route manifest,
  building the Vite config, generating virtual modules.
- **`dev()`/`build()`** tie it together - the only two methods a CLI command actually
  calls.

## Discovering routes

Given a resolved project, building a route manifest is a straight pipeline:

1. **Glob** for files matching `config.docs` (or the default), rooted at `.documints/`
   (not a fixed subfolder - this is what lets `docs` point anywhere reachable via a
   relative path).
2. **Parse frontmatter** out of each match. For `.doc.md`/`.doc.mdx` this is a direct
   read; for `.doc.tsx`, a leading `/** --- ... --- */` comment block is extracted and
   parsed as if it were the real thing - the file is never executed or transpiled just to
   discover its route, keeping discovery fast and side-effect-free.
3. **Derive a route path** from `title` (slash-delimited, slugified per segment;
   `slug` overrides the last segment; `home: true` short-circuits to `/`) - see
   [Routing](/guides/customization/routing).
4. **Detect collisions** (same route from two files) and warn, keeping the
   later-discovered entry.
5. **Apply `order`**, if configured - re-inserting entries in the desired sequence rather
   than discovery order.

The flat manifest (`route path → file info`) then gets turned into a **route graph** - the
same flat data, nested by route-path segment, which is what actually drives the sidebar and
the `section`-type header links. This is a pure, path-agnostic transform: it only reads
`routePath`, so it doesn't care *how* those paths were derived.

## Virtual modules

The route manifest and graph need to reach the actual React app, which happens through two
Vite virtual modules a plugin inside `Documints` generates on demand:

- **`virtual:routes`** - the route index, the full route graph, and a list of every doc
  page, each with an `importComponent()` that dynamically imports the real file.
- **`virtual:data`** - the resolved header config (with any `section` links already
  expanded into `dropdown` links against the route graph - the client never sees the raw
  `section` type at all).

In dev mode, the same plugin watches the docs directory: on any change, it rebuilds both
virtual modules, invalidates them in Vite's module graph, and forces a full client reload -
this is what makes adding, renaming, or editing a `.doc.*` file show up live without a
manual restart.

## The dev server

`Documints.dev()` runs an Express app with Vite attached in middleware mode - not Vite's
own standalone dev server. Every request loads the project's SSR entry via
`vite.ssrLoadModule()` and renders it through React's streaming SSR API
(`renderToPipeableStream`), piped back through the response once rendering completes.

One detail worth knowing if you're reading the source: Vite's HMR websocket needs a real
`http.Server` to attach to. `dev()` creates one explicitly and hands it to Vite via
`server.hmr.server` - without that, Vite spins up a second, disconnected websocket-only
server instead, and HMR silently never connects.

## The build

`Documints.build()` runs three passes:

1. A **client build** - the real, hashed JS/CSS bundle a browser loads.
2. A **server-only build** - a temporary SSR bundle that exists purely to render HTML;
   it's deleted once prerendering finishes and is never part of the deployed output.
3. A **prerender loop** - for every entry in the route manifest, render it through the
   server bundle to a real HTML string and write `index.html` to
   `.documints/static/<route>/`.

The result has no runtime dependency on Node, Vite, or documints itself - it's genuinely
static output, deployable anywhere.

## Design tokens and the app shell

The app shell (nav, header, breadcrumbs, TOC) is a real React application living inside
`documints` itself, styled with design tokens from `@documints/tokens`
([chamfer-css](https://github.com/green-flash-digital/green-flash-stack)-generated CSS custom
properties) - which is what makes [Plugins](/guides/advanced/plugins) and future theming both possible
without touching documints' own source: anything downstream can override a token by
redeclaring the corresponding `--documints-*` CSS variable.
