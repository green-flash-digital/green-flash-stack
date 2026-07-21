---
title: Guides/Writing/Writing Docs
---

# Writing Docs

Every page is a `.doc.md`, `.doc.mdx`, or `.doc.tsx` file, discovered recursively wherever
`config.docs` points (`.documints/content/` by default - see
[Configuration](/guides/configuration)). Where you put the file makes no difference to
your site's structure - only its frontmatter does. This page, for example, lives at
`guides/writing-docs.doc.md` on disk purely for your own organizational convenience; moving
it to the content root wouldn't change its route or its place in the nav at all.

## File naming

The `.doc.` suffix (`.doc.md`, `.doc.mdx`, `.doc.tsx`) is the one required convention -
it's how documints tells your actual content apart from anything else the glob might
otherwise match (a stray `.md` file, a component that isn't meant to be a page, etc).
Beyond that suffix, names and folders are free-form; only frontmatter drives routing.

## `title` - required

A slash-delimited path that determines both the page's nav placement and its URL:

```md
---
title: Guides/Writing Docs
---
```

Each segment becomes a nested nav section. The last segment is the page's display title,
and every segment gets slugified into the URL - this page is `/guides/writing/writing-docs`.

A file whose `title` is a prefix of others (e.g. `title: Guides` on its own) becomes that
section's index page, shown when a visitor navigates to `/guides` directly - see this
section's own [index page](/guides).

## `slug` - optional

Overrides just the auto-slugified last URL segment, without touching the displayed title:

```md
---
title: Reference/CLI
slug: cli-reference
---
```

Routes to `/reference/cli-reference`, but still displays as "CLI" in the nav.

## `home` - optional

Marks a page as the site's root, served at `/`:

```md
---
title: Welcome
home: true
---
```

There should be exactly one of these per site. It's excluded from the nav tree, matching
how most docs sites treat their landing page as separate from the sidebar.

## `description` - optional

A one-line summary of the page:

```md
---
title: Guides/Introduction/Deploy
description: Build and deploy a static documints site to Cloudflare, Netlify, Vercel, GitHub Pages, or AWS.
---
```

Not required, and nothing breaks without it - it's surfaced in `docs-manifest.json` and the
page's own `.json` sibling (see [Using Documints with AI](/guides/advanced/using-documints-with-ai)),
so an agent or external tool can tell what a page is about without fetching it first. One
field, no separate "AI description" to keep in sync.

## `related` / `prerequisites` - optional

Route paths of other docs worth knowing about, for anything the route graph can't already
derive on its own:

```md
---
title: Guides/Introduction/Deploy
prerequisites:
  - /guides/introduction/getting-started
---
```

```md
---
title: Guides/Introduction/Getting Started
related:
  - /guides/introduction/deploy
---
```

Both are validated at build time the same way internal links in your content are - a path
that doesn't resolve to a real route fails the build with the same "broken internal link"
error, not a silent typo. There's no `parent`/`previous`/`next` frontmatter to set alongside
these - that hierarchy already comes for free from your route graph and `order` (see below),
so only add `related`/`prerequisites` for connections that genuinely aren't structural.

## MDX

Anything that needs interactivity beyond Markdown can use `.doc.mdx` instead - it supports
embedding React components directly in the document.

## TSX pages

For a page that's real React from top to bottom - not Markdown with the occasional
component dropped in - use `.doc.tsx`. A literal `---` frontmatter block isn't valid TSX
syntax, so the same YAML instead lives inside a leading block comment:

```tsx
/**
---
title: Guides/Writing/Playground
---
*/
import { useState } from "react";

export default function Playground() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      Clicked {count} {count === 1 ? "time" : "times"}
    </button>
  );
}
```

The comment block is parsed as plain text to discover the route, the same way
`.doc.md`/`.doc.mdx` frontmatter is - documints never has to execute the file (and resolve
its real imports) just to figure out where it belongs. See the live
[Playground](/guides/writing/playground) page for the full source.
