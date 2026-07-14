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

## `siteUrl`

Your site's canonical, absolute base URL, no trailing slash:

```ts
export default defineDocumintsConfig({
  siteUrl: "https://your-docs-site.com",
});
```

Only used at build time, to generate `sitemap.xml` and `robots.txt` in the build output -
skipped entirely (with a warning) if omitted, since a sitemap can't be built without knowing
the site's real domain.

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
  [Routing](/guides/customization/routing) for how the match works. The recommended way to surface a
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
you pin an explicit sequence instead, keyed by section and leaf **filename** - the real
on-disk name, minus `.doc.md`/`.doc.mdx`/`.doc.tsx`, not the URL slug a `title` or `slug`
override might produce. Filenames are what you actually see browsing the docs folder, so
they're the more discoverable thing to write here:

```ts
export default defineDocumintsConfig({
  order: {
    guides: ["writing-docs", "configuration"],
  },
});
```

A group - a `title` segment with no doc of its own, like "Introduction" in
"Guides/Introduction/Getting Started" (see [Routing](/guides/customization/routing)) - has no file, so
it's ordered by its URL segment instead, by nesting an object instead of a plain string.
Its own children go back to being ordered by filename:

```ts
export default defineDocumintsConfig({
  order: {
    guides: [
      { introduction: ["getting-started", "why-documints"] },
      "writing-docs",
      "configuration",
    ],
  },
});
```

`defineDocumintsOrdering`, generated into `.documints/.generated/order.ts` alongside every
`dev`/`build` run, gives autocomplete and a compile error for a typo'd or stale filename -
import it instead of writing `order` as a plain object:

```ts
import { defineDocumintsOrdering } from "./.generated/order.js";

export default defineDocumintsConfig({
  order: defineDocumintsOrdering({
    guides: [
      { introduction: ["getting-started", "why-documints"] },
      "writing-docs",
      "configuration",
    ],
  }),
});
```

Since it's generated from whatever docs currently exist, it's only as fresh as the last
`dev`/`build` run - add a new section, group, or leaf and restart `documints dev` to see it
show up in the autocomplete. Editing `order` itself in `config.ts` while `dev` is running
takes effect immediately - no restart needed.

This is exactly what this site's own `.documints/config.ts` uses to keep this guide listed
before the configuration reference in the nav.

## `vitePlugins`

documints' dev server and build are both just Vite underneath, and `vitePlugins` is the
escape hatch into that: real Vite plugins, either your own or from anywhere on npm. See
[Plugins](/guides/advanced/plugins) for a full walkthrough, including documints' own built-in
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
