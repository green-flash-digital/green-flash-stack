---
title: Guides/Writing Docs/Section
---

# Writing Docs

Every page is a `.doc.md` (or `.doc.mdx`) file, discovered recursively anywhere under
`.documints/content/`. Where you put the file makes no difference to your site's
structure - only its frontmatter does. This page, for example, lives at
`guides/writing-docs.doc.md` on disk purely for your own organizational convenience; moving
it to the content root wouldn't change its route or its place in the nav at all.

## `title` - required

A slash-delimited path that determines both the page's nav placement and its URL:

```md
---
title: Guides/Writing Docs
---
```

Each segment becomes a nested nav section. The last segment is the page's display title,
and every segment gets slugified into the URL - this page is `/guides/writing-docs`.

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

## MDX

Anything that needs interactivity beyond Markdown can use `.doc.mdx` instead - it supports
embedding React components directly in the document.
