---
title: Guides/Introduction/Why Documints?
---

# Why Documints?

Documints is a static site generator built for exactly one thing: technical documentation.
Point it at Markdown, MDX, or React files, and it turns them into a fast, static site with
navigation, hierarchy, and a header that stay correct on their own. The mechanics are
covered elsewhere - [Routing](/guides/routing), [Configuration](/guides/configuration),
[Writing Docs](/guides/writing-docs). This page is the *why*.

## A narrow scope, on purpose

documints is built for exactly one thing: technical documentation. Not marketing pages,
not blogs, not general-purpose sites. That narrowness isn't a limitation to work around -
it's the reason the API is small.

Once you stop trying to be everything, whole categories of configuration disappear.
Navigation, routing, and hierarchy don't need a config surface at all, because there's only
one sensible way they should work for documentation: a page's `title` decides where it
lives, and the nav builds itself from that. A marketing site builder has to expose knobs
for all of this because it doesn't know what you're building. documints already knows -
so it just does it, out of the box, and the config that's left (`docs`, `order`, `header`,
`vitePlugins`) is what's actually specific to your project, not busywork.

That reduction compounds where it matters most: for the person actually writing the docs.
Minimal settings means minimal configuration, and minimal configuration means minimal
cognitive load - opening a new `.doc.md` file means writing a `title`, then writing content.
There's no per-page settings block to fill in, no sidebar-registration step to remember, no
"which config file controls this again?" The fewer decisions the tool asks of you, the more
of your attention is left for the doc itself.

## Docs that live where the code lives

Frontmatter-driven routing (see [Routing](/guides/routing)) means location on disk never
decides where a page ends up - a page's `title` does. That has a real consequence: a
`.doc.mdx` file can sit directly next to the component or module it documents - in the same
folder, in the same PR - without that location dictating anything about the site's
structure or degrading the result into a flat, unstyled dump. The nav, hierarchy, and design
are exactly as polished whether your docs live in one tidy `docs/` folder or scattered
across a real codebase next to what they describe. Docs that are easy to find *while
writing code* are docs that actually stay up to date, and you can reorganize freely later -
moving a file never breaks a route or a link.

## Built AI-first

Documentation used to have exactly one audience: a person, reading in a browser. That's no
longer true, and documints is built around that shift rather than bolting it on afterward.

- **Crawlable by default, not by opting in.** Every route prerenders to real, static HTML -
  no JavaScript execution required to see the content. A crawler, a search indexer, or an
  AI agent gets the actual page on the first request, the same as a browser does. There's
  no separate "SEO mode" or prerender flag to remember; it's just what building the site
  produces.
- **The source was never anything other than what an LLM already reads and writes best.**
  A `.doc.md`/`.doc.mdx` file's content *is* plain Markdown - the same format most language
  models are already fluent in, with no proprietary CMS schema standing between an agent and
  the actual prose. That cuts both ways: an AI agent reading your docs to answer a question
  is reading the real thing, and an AI agent asked to write or restructure a doc is writing
  in a format it already handles well, not translating into some other tool's dialect first.
- **Serving the raw source is a natural next step, not a new feature to build.** Because the
  source already is Markdown, this architecture sets up something no conversion step is
  required for: serving that raw source directly at a predictable URL alongside the
  rendered page (`/guides/routing` also reachable as `/guides/routing.md`, a pattern already
  emerging across the docs-tooling ecosystem). An agent that fetches that URL gets exactly
  the prose, with none of the HTML it would otherwise have to parse back out of. This isn't
  built yet, but the reason it'll be cheap to add later is the same reason the rest of
  documints is simple: nothing about the content ever depended on being HTML in the first
  place.

## React, all the way down

documints isn't a Markdown tool with React bolted on for embeds - it's a React application
that happens to render Markdown as one of its content types. The nav, header, and layout
are real React components; `.doc.mdx` embeds real React components; and `.doc.tsx` lets a
page *be* a React component, full stop, with real state and real interactivity (see
[Writing Docs](/guides/writing-docs)).

The payoff shows up whenever you need to go past what Markdown can express. There's no
separate shortcode syntax, no custom directive system, no plugin API shaped like anything
other than React itself to learn - if you can write a component, you can extend documints.
The [Interactive Preview plugin](/guides/plugins) isn't a special case bolted onto the
side; it's what "just use React" looks like when you need a live, working example next to
its source.

And it's not limited to enhancing Markdown - a page doesn't have to be Markdown at all.
Write a `.doc.tsx` file instead of `.doc.md`/`.doc.mdx` and the page *is* a full React
component, with nothing standing between you and the DOM. That's the escape hatch for
whatever doesn't fit nicely into prose: a landing page like this site's own home page, an
interactive playground, a live demo with real state - anything that needs to be an
application rather than a document. Same routing, same nav, same build; just a different
file extension for when Markdown would be the wrong tool.

## Theming is just CSS

Re-theming documints doesn't mean writing against a bespoke theming API - there isn't one.
Every design token compiles to a plain CSS custom property (`--documints-color-primary`,
`--documints-color-neutral-600`, and so on). Overriding the look of a site is exactly as
complicated as writing a CSS file, dropping it in `.documints/public/`, and linking it from
`.documints/head.html` (see [Static Assets & Head](/guides/static-assets)) - the same two
conventions that already handle a favicon or a self-hosted font, reused for exactly this.
No provider component, no theme object schema, no build step of its own.

## Developer experience is not an afterthought

A docs tool that's pleasant to work in gets kept up to date; one that fights you gets
abandoned in favor of a stale README. Documints treats that as seriously as the output.

- **Real hot reloading, not a full-page refresh in disguise.** Edit a `.doc.md`, `.doc.mdx`,
  or `.doc.tsx` file with `documints dev` running and the change shows up where you're
  looking, immediately - no losing your scroll position, no re-triggering a playground's
  state, no manual reload. Because documints is a real Vite app rather than a bespoke
  file-watcher-plus-rebuild loop, this is Vite's actual HMR pipeline doing what it already
  does well, not a documints-specific approximation of it.
- **It's just Vite underneath.** Nothing about the dev server or build is a custom bundler
  wearing a disguise - anything you already know about Vite (plugins, `optimizeDeps`, the
  error overlay, sourcemapped stack traces) transfers directly, and any Vite plugin from npm
  works unmodified (see [Plugins](/guides/plugins)). Cold starts and rebuilds are fast for
  the same reason any modern Vite app's are - it never had to reinvent that.
- **Typed, end to end.** `.documints/config.ts` is authored through `defineDocumintsConfig`,
  a real TypeScript function - your editor autocompletes `header.links`, catches a
  misspelled header link `type` at compile time, and tells you immediately, rather than the
  config silently doing nothing and you finding out at runtime (or not at all). The same
  goes for a `.doc.tsx` page: it's a typed React component, checked by `tsc` like any other
  file in the project, not a string template evaluated at build time.
- **Failures look like normal TypeScript/React errors.** Get something wrong and you see a
  real stack trace pointing at your actual file and line - not an opaque error from a
  custom templating DSL three layers removed from the file you actually edited.
- **One command, not a pipeline to assemble.** `documints dev` and `documints build` are the
  whole surface (see [Usage](/guides/usage)) - there's no separate step to wire up a
  bundler, a markdown processor, and a router together yourself before you can start writing.

## Fast, because it's static

Every route prerenders to real, static HTML - no server, no runtime dependency, just files.
First paint never waits on JavaScript to execute; hydration happens after, to make the page
interactive, not to make it visible. Performance is the starting point, not a tuning pass
that happens later.

## What falls out of all this

A few things end up true almost by accident, as a consequence of the choices above rather
than features built directly:

- **One source of truth for navigation.** The header's `section` links
  ([Routing](/guides/routing)) resolve against the same route graph that builds the
  sidebar - there's no second list to keep in sync, so they can't drift apart.
- **No lock-in.** Content is plain `.doc.md`/`.doc.mdx`/`.doc.tsx` files with frontmatter -
  readable, greppable, diffable, and portable even if you stop using documints tomorrow.
- **Escape hatches, not APIs.** `vitePlugins`, `head.html`, and CSS variables are all
  "you already know how to do this" mechanisms - documints adds surface area only where a
  documentation site genuinely needs an opinion, and gets out of the way everywhere else.
