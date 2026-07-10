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

A glob pattern for finding your `.doc.md`/`.doc.mdx` files, resolved relative to
`.documints/` itself - not a fixed "content" subfolder. The default,
`"./content/**/*.doc.{md,mdx}"`, matches a `.documints/content/` folder. If you'd rather
keep your docs somewhere else - a `content/` folder at your project root, for example -
point `docs` there instead:

```ts
export default defineDocumintsConfig({
  docs: "../content/**/*.doc.md",
});
```

This is exactly what this site's own `.documints/config.ts` does - its content lives in a
`content/` folder at the project root, a sibling of `.documints/`, rather than nested
inside it.

## `header`

Controls the site's header: a title, an optional logo, and links.

```ts
export default defineDocumintsConfig({
  header: {
    title: "My Project",
    links: [
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

Links are grouped into sections (an array of arrays) and rendered left to right. Supported
link types: `text`, `internal`, `social` (`github` or `discord`), and `dropdown` (a labeled
button that opens a small menu of sub-links).

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
