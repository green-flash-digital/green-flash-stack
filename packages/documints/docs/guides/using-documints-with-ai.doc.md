---
title: Guides/Advanced/Using Documints with AI
description: How an AI agent or external tool can discover and consume a documints site's machine-readable formats.
related:
  - /guides/introduction/why-documints
---

# Using Documints with AI

Every documints site is simultaneously a website and a machine-readable documentation
corpus, generated from the same document graph - not a website with an "AI mode" bolted on
afterward. This page is the reference for the second half of that: what's available, in what
shape, and in what order an agent should reach for it. See
[Writing Docs](/guides/writing/writing-docs) for the frontmatter (`description`, `related`,
`prerequisites`) that feeds all of it.

## Fetching a single page

Every route is available in up to three forms, all at predictable, guessable URLs:

```text
/guides/introduction/deploy       - rendered HTML
/guides/introduction/deploy.md    - raw Markdown source, frontmatter stripped
/guides/introduction/deploy.json  - structured metadata
```

The `.md` form is the fastest way to get a page's actual prose with none of the HTML around
it. The `.json` form adds what the Markdown alone doesn't carry - `description`,
`related`/`prerequisites`, and `headings` (the same table of contents the page itself
renders, with the same `id`s as its heading anchors):

```json
{
  "schemaVersion": "1",
  "title": "Deploy",
  "path": "/guides/introduction/deploy",
  "sourceType": "md",
  "markdown": "/guides/introduction/deploy.md",
  "description": "Build and deploy a static documints site to Cloudflare, Netlify, Vercel, GitHub Pages, or AWS.",
  "prerequisites": ["/guides/introduction/getting-started"],
  "headings": [{ "id": "deploy", "text": "Deploy", "level": 1 }]
}
```

A `.doc.tsx` page (no raw Markdown source) still has a `.json` - just with an empty
`headings` array and no `markdown` field, rather than no file at all.

These URLs are discoverable without already knowing the convention, too: every page's
`<head>` includes `<link rel="alternate" type="text/markdown">` pointing at its `.md`
sibling, for a crawler or agent that fetched the HTML first. And it's not only for a
background agent - "View as Markdown," "Copy as Markdown," "Open in ChatGPT," and "Open in
Claude" buttons on every page put the same URLs one click away for a person reading it.

## Discovering a whole site

Two endpoints exist for understanding a site's structure without fetching every page:

```text
/.well-known/documints.json  - what this site exposes, and where
/docs-manifest.json          - every document: title, path, hierarchy, description
```

`/.well-known/documints.json` (the [RFC 8615](https://www.rfc-editor.org/rfc/rfc8615)
convention) is the entry point for an agent that's never seen this particular site before -
it only ever advertises formats that actually exist in this build:

```json
{
  "schemaVersion": "1",
  "generator": "documints",
  "version": "0.1.0",
  "manifest": "/docs-manifest.json",
  "llms": "/llms.txt",
  "llmsFull": "/llms-full.txt",
  "formats": { "html": "{path}", "markdown": "{path}.md", "json": "{path}.json" }
}
```

`/docs-manifest.json` is the corpus itself, indexed: every document's `title`, `path`,
`sourceType`, `description`, and where it sits in the hierarchy (`section`/`parent`/
`children`, already resolved past any purely-organizational nav groupings - a manifest
`parent`/`child` reference always points at a real, fetchable document).

## Ingesting everything at once

```text
/llms.txt       - a Markdown index of every page, with descriptions
/llms-full.txt  - every page's raw Markdown, concatenated into one file
```

The [llms.txt](https://llmstxt.org) convention. Use `llms-full.txt` when ingesting the whole
site in one request is appropriate for the task at hand - a small-to-medium docs site fits
comfortably in a single fetch this way. For anything larger, or when only part of the site is
relevant, prefer the manifest plus targeted `.md` fetches instead.

## Search

The one representation in this whole system that isn't a plain static file an agent can
fetch directly: every build indexes the prerendered HTML with
[Pagefind](https://pagefind.app) - a fully static search library, no external service,
account, or API key - and writes the result to `pagefind/` in the build output. It's built
primarily for a person (a "Search" button in the header, `Cmd+K`/`Ctrl+K` also opens it,
showing Pagefind's own default UI in a modal), not for an agent to query over HTTP - for
machine consumption, `docs-manifest.json` and `llms.txt`/`llms-full.txt` are the better fit.

Because Pagefind indexes the *built* HTML, there's nothing to search against in
`documints dev` - the button still opens the same modal there (useful for checking styling),
it just won't return real results until the site is built.

## Recommended workflow

1. Fetch `/.well-known/documints.json` to confirm this is a documints site and see what it
   exposes.
2. Fetch `/docs-manifest.json` to get every document's title, description, and place in the
   hierarchy.
3. Use titles/descriptions (and `related`/`prerequisites`, where set) to identify which
   documents are actually relevant - without fetching any of them yet.
4. Fetch the `.md` of each relevant document for its actual content.
5. Fetch a document's `.json` instead of (or alongside) its `.md` when you specifically need
   `headings` or its structured metadata, not just prose.
6. Reach for `llms-full.txt` only when the task genuinely calls for the whole corpus at once
   - a targeted `.md` fetch is cheaper whenever you already know which page you need.

## Using this with a specific tool

The mechanism above is plain HTTP and static JSON/Markdown - nothing here is specific to any
one agent or client. A few notes on wiring it into what you're already using:

- **Claude Code, Cursor, or anything reading a repo-level instructions file** (`CLAUDE.md`,
  `.cursor/rules`, `AGENTS.md`): point it at this site's `/.well-known/documints.json` in a
  couple of sentences, the same way you'd document any other internal API. Documints doesn't
  generate that file for you - it's your project's own instructions file, and this is one
  more thing worth telling it about.
- **Codex, or any agent you're driving via a prompt rather than a config file**: give it the
  `/.well-known/documints.json` URL directly and let the recommended workflow above take it
  from there - the discovery document is designed to be the only URL an agent needs to be
  told about up front.
- **A generic script, RAG pipeline, or search indexer**: `docs-manifest.json` plus per-page
  `.md`/`.json` fetches is a complete, stable ingestion path - no HTML parsing, no scraping,
  no separate export step to maintain.

None of this requires an MCP server, a REST API, or a hosted service - it's the same static
files a browser or crawler already gets, just structured for a machine to use directly.
