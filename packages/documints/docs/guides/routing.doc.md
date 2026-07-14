---
title: Guides/Customization/Routing
---

# Routing

There's no router config, no file-based routing convention, and no manual route list.
Every route is derived from one thing: the slash-delimited `title` in a page's
frontmatter. This page covers how that turns into a URL, a nav tree, and (optionally) a
header dropdown.

## From `title` to URL

Each segment of `title` becomes a nested nav section, and the whole path (slugified) becomes
the URL:

```md
---
title: Guides/Deployment
---
```

Routes to `/guides/deployment`, nested under a "Guides" section in the sidebar. A single
segment (`title: Guides`) has no parent - it routes to `/guides` and becomes that section's
index page.

`slug` overrides just the last URL segment without touching the displayed title (see
[Writing Docs](/guides/writing/writing-docs)), and `home: true` overrides all of this for exactly
one page, routing it to `/` and excluding it from the nav tree entirely.

## Section index pages

A page whose `title` is exactly one segment (`title: Guides`) becomes the index for every
other page whose `title` starts with that same segment (`title: Guides/Anything`). Visiting
`/guides` directly renders that index page; its children show up nested under it in the
sidebar. There's nothing more to configure - the relationship is inferred entirely from the
shared first segment.

## What happens with a collision

If two pages resolve to the same route (duplicate `title`+`slug` combination, or a genuine
typo), documints doesn't fail the build - it logs a warning naming both files and keeps
going, with whichever one was discovered last winning:

```txt
Multiple docs resolve to the route "/guides/deployment":
  - /guides/deploy-notes.doc.md
  - /guides/deployment.doc.md
The later one will win. Give one of them a distinct "title" or "slug".
```

Discovery order depends on your filesystem's own directory-listing order, so treat this as
a bug to fix, not a mechanism to rely on.

## The header can reference the same hierarchy

[Configuration](/guides/configuration)'s `header.links` supports a `section` link type that
points at a top-level section by its `title` (matched by slug, same as everywhere else) and
resolves - at build/dev time - into a dropdown listing that section's pages:

```ts
header: {
  links: [[{ type: "section", title: "Guides" }]];
}
```

This means the header and the sidebar are always in sync - there's no separate list to
maintain, and renaming a section's pages is automatically reflected in both places. If the
referenced title doesn't match any top-level section, the build fails immediately with a
clear error rather than silently rendering an empty dropdown.
