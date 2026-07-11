---
title: Guides/Configuration
---

# Configuration

`.documints/config.ts` is the single configuration file for a documints project, authored
with `defineDocumintsConfig`:

```ts
import { defineDocumintsConfig } from "documints";

export default defineDocumintsConfig({});
```

An empty config is entirely valid - everything below is optional.

## `docs`

A glob pattern for finding your `.doc.md`/`.doc.mdx`/`.doc.tsx` files, resolved relative to
`.documints/` itself - not a fixed "content" subfolder. The default,
`"./content/**/*.doc.{md,mdx,tsx}"`, matches a `.documints/content/` folder. If you'd
rather keep your docs somewhere else - a `docs/` folder at your project root, for example -
point `docs` there instead:

```ts
export default defineDocumintsConfig({
  docs: "../docs/**/*.doc.{md,mdx,tsx}",
});
```

This is exactly what this site's own `.documints/config.ts` does - its content lives in a
`docs/` folder at the project root, a sibling of `.documints/`, rather than nested inside
it.

## `header`

Controls the site's header: a title, an optional logo, and links.

```ts
export default defineDocumintsConfig({
  header: {
    title: "My Project",
    logo: { src: "/logo.svg", alt: "My Project" },
    links: [
      [{ type: "section", title: "Guides" }],
      [
        {
          type: "social",
          provider: "github",
          href: "https://github.com/your-org/your-repo",
          label: "GitHub",
        },
      ],
    ],
  },
});
```

Links are grouped into sections (an array of arrays) and rendered left to right. Five link
types are supported:

- **`section`** - `{ type: "section", title: "Guides" }`. Resolves against your doc
  hierarchy into a dropdown listing that section's pages - see
  [Routing](/guides/routing) for how the match works. The recommended way to surface a
  section in the header, since it can never drift out of sync with your actual content.
- **`dropdown`** - a labeled button opening a menu of manually-specified items
  (`text`/`href`, plus optional `subText`/`iconSrc`/`iconAlt`). Use this for links that
  *aren't* part of your doc hierarchy - external resources, product links, etc.
- **`social`** - an icon-only link for `github` or `discord`. `label` is required for
  accessibility even though only the icon renders.
- **`internal`** - a plain text link to another route within the site.
- **`text`** - a plain text link to anywhere, internal or external.

## `order`

By default, pages within a section appear in the order they're discovered. `order` lets
you pin an explicit sequence instead, keyed by section and leaf slug (not by file path -
consistent with everything else in documints, `order` doesn't care where files live on
disk):

```ts
export default defineDocumintsConfig({
  order: {
    guides: ["writing-docs", "configuration"],
  },
});
```

This is exactly what this site's own `.documints/config.ts` uses to keep this guide listed
before the configuration reference in the nav.

## `vitePlugins`

documints' dev server and build are both just Vite underneath, and `vitePlugins` is the
escape hatch into that: real Vite plugins, either your own or from anywhere on npm. See
[Plugins](/guides/plugins) for a full walkthrough, including documints' own built-in
plugins. A plain array works for plugins that need no project-specific paths:

```ts
import someVitePlugin from "some-vite-plugin";

export default defineDocumintsConfig({
  vitePlugins: [someVitePlugin()],
});
```

Or a function receiving `{ rootDir }` (the directory containing `.documints/`), for
plugins that need to resolve paths relative to your project:

```ts
export default defineDocumintsConfig({
  vitePlugins: ({ rootDir }) => [someVitePlugin({ root: rootDir })],
});
```
