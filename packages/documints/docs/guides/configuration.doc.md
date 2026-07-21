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

Only used at build time, to generate `sitemap.xml`, `robots.txt`, and `llms.txt` in the
build output - skipped entirely (with a warning) if omitted, since none of the three can be
built without knowing the site's real domain.

## `editUrl`

A base URL for editing a doc's source at its host, pointed at the directory containing
`.documints/` - for a GitHub repo, that's the `/edit/<branch>/<path-to-package>` form:

```ts
export default defineDocumintsConfig({
  editUrl: "https://github.com/your-org/your-repo/edit/main/packages/your-docs",
});
```

Every doc page gets an "Edit this page" link built from this plus its real, on-disk path -
this site's own `.documints/config.ts` uses its GitHub repo, so every page links straight to
its source file there. Omit `editUrl` to leave those links out entirely.

## Markdown routes and AI-agent discoverability

None of this needs configuring - it's on by default. Every `.doc.md`/`.doc.mdx`/`.doc.tsx`
page is simultaneously a website and a machine-readable document, generated from the same
frontmatter and route manifest - not a second, separate pipeline:

- **A raw-Markdown sibling route.** Every `.doc.md`/`.doc.mdx` page is also served at
  `<route>.md` - the doc's source, frontmatter stripped, `Content-Type: text/markdown`.
  `.doc.tsx` pages have no raw Markdown source, so they don't get one. Works the same in
  `documints dev` and in the built output. "View as Markdown" and "Copy as Markdown" buttons
  on every page (next to "Edit this page") link to and copy this directly.
- **"Open in ChatGPT" / "Open in Claude" buttons**, next to the two above - open a new chat
  prefilled with the page's absolute Markdown URL, computed client-side from
  `window.location.origin` (no `siteUrl` needed, and correct under any preview domain).
- **`<link rel="alternate" type="text/markdown">`** in every page's `<head>`, pointing at its
  `.md` sibling - lets a crawler or agent that already fetched the HTML discover the raw
  source without guessing the URL convention.
- **A structured `<route>.json` sibling for every route**, `.doc.tsx` included - `title`,
  `path`, `sourceType`, `description`, `related`/`prerequisites` (see
  [Writing Docs](/guides/writing/writing-docs)), the `.md` URL when one exists, and `headings`
  (the same table of contents the page itself renders, with the same `id`s as the rendered
  anchors). A `.doc.tsx` page still gets one, just with an empty `headings` array and no
  `markdown` field - it's honest about not having a raw-Markdown equivalent rather than
  skipping the file entirely.
- **`docs-manifest.json`**, at the build output's root - every route's `title`, `path`,
  `sourceType`, `description`, `related`/`prerequisites`, and its place in the hierarchy
  (`section`/`parent`/`children`, skipping past synthetic nav groupings like "Introduction"
  straight to the nearest real page). Lets an agent understand the whole site's structure in
  one request, without crawling nav HTML or parsing `llms.txt`.
- **`/.well-known/documints.json`** - a small, self-describing discovery document (points at
  `docs-manifest.json`, `llms.txt`/`llms-full.txt` when configured, and the URL conventions
  above) so an agent landing on an unfamiliar documints site knows where to look, without
  guessing.
- **`llms.txt`**, at the build output's root - the [llms.txt](https://llmstxt.org)
  convention: a single Markdown index of every page, linking to each one's raw-Markdown
  route, with its `description` appended when one is set. Requires `siteUrl` (see above),
  since the links are absolute.
- **`llms-full.txt`**, alongside it - every page's raw Markdown source concatenated into one
  file, so an agent can ingest the entire site in a single request instead of crawling page
  by page. Doesn't need `siteUrl`.

## Search

Also on by default, no configuration needed. Every `build()` indexes the prerendered HTML
with [Pagefind](https://pagefind.app) - a fully static search library, no external service,
account, or API key - and writes the resulting index to `pagefind/` in the build output.
A "Search" button in the header (`Cmd+K`/`Ctrl+K` also opens it) shows Pagefind's own default
search UI in a modal.

Because Pagefind indexes the *built* HTML, there's nothing to search against in
`documints dev` - the button still opens the same modal there (useful for checking styling),
it just won't return real results until you build the site.

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

`logo`, if set, takes the place of `title` in the header's top-left corner - point `src` at
an image in `.documints/public/` (see [Static Assets & Head](/guides/customization/static-assets)),
or any other reachable URL. `title` is still worth setting even then: it's used as the heading
in `llms.txt` (see [Markdown routes and AI-agent discoverability](/guides/configuration#markdown-routes-and-ai-agent-discoverability)
above) regardless of whether `logo` is set. Omit `logo` to show `title` as plain text instead.

`title` and any `social` links also surface a second time, automatically, in the site's
footer (a copyright line plus the same social icons) - there's no separate footer
configuration to keep in sync with the header.

Links are grouped into sections (an array of arrays) and rendered left to right - each inner
array becomes one visually-separated group, like the doc-links/social split in the example
above. Five link types are supported.

### `section`

Resolves against your doc hierarchy into a dropdown listing that section's pages, matched by
slugifying `title` against your top-level route segments:

```ts
{ type: "section", title: "Guides" }
```

The recommended way to surface a section in the header - the dropdown is generated from
whatever pages actually exist, so it can never drift out of sync with your content. Nested
groups (see [Routing](/guides/customization/routing) and `order`, below) are flattened
automatically: a group like "Introduction" that exists only to organize the sidebar has no
page of its own, so its real pages appear directly in the dropdown rather than the group
itself showing up as a dead link.

### `dropdown`

A labeled button opening a menu of manually-specified items - use this for links that
*aren't* part of your doc hierarchy: external resources, product links, a changelog, etc.

```ts
{
  type: "dropdown",
  text: "Resources",
  items: [
    { text: "Blog", href: "https://example.com/blog" },
    {
      text: "Changelog",
      href: "https://example.com/changelog",
      subText: "See what's new",
      iconSrc: "/icons/changelog.svg",
      iconAlt: "",
    },
  ],
}
```

Every item needs `text`/`href`; `subText`, `iconSrc`, and `iconAlt` are optional extras for a
richer-looking menu item.

### `social`

An icon-only link for `github` or `discord`:

```ts
{
  type: "social",
  provider: "github",
  href: "https://github.com/your-org/your-repo",
  label: "GitHub",
}
```

`label` is required even though only the icon renders - it's the accessible name a screen
reader announces. `social` links also surface a second time, automatically, in the site's
footer (see above) - no separate footer configuration to keep in sync.

### `internal`

A plain-text link to another route within the site, navigated client-side (no full page
reload) and aware of when it's the active route:

```ts
{ type: "internal", href: "/guides/introduction/getting-started", text: "Get Started" }
```

### `text`

A plain-text link to anywhere, internal or external - a bare `<a>` tag, without `internal`'s
client-side navigation or active-route awareness:

```ts
{ type: "text", href: "https://example.com", text: "External Site" }
```

Prefer `internal` for routes within your own site - it gets client-side navigation for free.
Reach for `text` only when `internal` doesn't fit, e.g. a link to something that isn't a real
route in this site at all.

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
