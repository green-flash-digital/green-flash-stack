---
title: Guides/Introduction/Why Documints?
---

# Why Documints?

## Build a documentation corpus, not just a website.

Documints turns one canonical source into polished pages for humans and structured knowledge for machines.

Write naturally in Markdown, MDX, or React. Keep documentation beside the code it explains or collect it in a dedicated docs directory. Documints discovers it, organizes it, and publishes it as fast static HTML, clean Markdown, structured metadata, full-text search, and agent-ready context.

**Human-readable by design. Machine-readable by default.**

Documints is intentionally built for one thing: technical documentation. That focus allows it to remove much of the configuration, duplication, and maintenance that general-purpose site frameworks leave to you.

This page explains the principles behind Documints. For implementation details, see [Routing](/guides/customization/routing), [Configuration](/guides/configuration), and [Writing Docs](/guides/writing/writing-docs).

## Focused on documentation

Documints is not a general-purpose site builder that happens to support Markdown. It is built specifically for technical documentation.

That focus keeps the API small. Routing, hierarchy, navigation, search, static generation, and machine-readable outputs are part of the system rather than separate pieces you must assemble.

The remaining configuration describes what is genuinely specific to your project: where documents can be found, how major sections are ordered, what appears in the header, and which Vite plugins you want to use.

Less framework configuration means more attention stays on the documentation itself.

## Documentation without the usual constraints

Most documentation frameworks begin by deciding where your docs must live, how your folders map to URLs, how navigation must be configured, and which proprietary extension system you need to learn.

Documints starts with the document.

Keep docs beside the code they explain, inside individual packages, or in a traditional documentation directory. Define the files Documints should discover with a glob, and use document metadata to control where each page appears publicly.

Your repository structure and documentation structure remain independent:

- source files can live wherever they are most useful
- moving a source file does not have to change its public URL
- navigation is derived from the documents that actually exist
- hierarchy lives in content rather than folder names

The result is documentation that can remain close to the work without forcing your website to mirror your codebase.

See [Routing](/guides/customization/routing) for how document metadata controls hierarchy and public URLs.

## One corpus for humans and machines

Documentation no longer has a single audience.

A person wants typography, navigation, search, syntax highlighting, and interactive examples. An AI agent wants direct access to clean content and predictable structure. A crawler wants complete HTML without executing an application first.

Documints serves all of them from the same canonical corpus.

```text
                 .doc.md · .doc.mdx · .doc.tsx
                            │
                            ▼
                   document graph
                            │
       ┌────────────┬───────┼────────┬──────────────┐
       ▼            ▼       ▼        ▼              ▼
     HTML           .md    .json   Search     Site manifest
       │            │       │                       │
       ▼            ▼       ▼                       ▼
    Humans       Agents   Tools              Corpus discovery
```

The website is not the only product. It is one first-class representation of the same documentation.

### A representation for every reader

- **HTML for humans and crawlers.** Every route prerenders to complete static HTML, so the content is present on the first request.
- **Markdown for agents.** Markdown and MDX documents are available through predictable `.md` sibling URLs, without requiring an agent to extract prose from rendered HTML.
- **JSON for structured consumers.** Each route exposes metadata, headings, relationships, and other document structure in a predictable format.
- **Search for readers and tools.** Pagefind creates a static full-text index without requiring a hosted search service.
- **A manifest for the entire corpus.** `docs-manifest.json` lets a tool understand the site's documents and hierarchy in one request.
- **LLM-oriented corpus outputs.** `llms.txt` and `llms-full.txt` provide lightweight discovery and whole-corpus ingestion.
- **Self-description.** `/.well-known/documints.json` tells machines which representations a site provides and where to find them.

Every Markdown and MDX page can also advertise its direct Markdown representation with:

```html
<link rel="alternate" type="text/markdown">
```

“View as Markdown,” “Copy as Markdown,” “Open in ChatGPT,” and “Open in Claude” make those representations visible to people as well as machines.

See [Using Documints with AI](/guides/advanced/using-documints-with-ai) for the full discovery and consumption model.

**One corpus. Multiple first-class representations. No scraping required.**

## Markdown when you want it. React when you need it.

Documentation is mostly prose—until it is not.

Use `.doc.md` for focused writing. Use `.doc.mdx` when prose needs live components. Use `.doc.tsx` when the page itself should be a complete React experience.

A TSX document is not a restricted template or a component embedded inside someone else's page model. It is a React page with access to state, interactions, components, and the DOM.

That makes room for documentation experiences that do not fit neatly inside prose:

- interactive examples
- component playgrounds
- visualizations
- live demos
- custom landing pages
- workflow-driven tools

Every format participates in the same routing, navigation, build, and static-generation system. Choose the right authoring mode for the page without changing frameworks.

The [Interactive Preview plugin](/guides/advanced/plugins) is one example of this principle: a live, working interface can sit directly beside the source it explains without introducing a separate shortcode language or custom rendering system.

See [Writing Docs](/guides/writing/writing-docs) for the differences between Markdown, MDX, and TSX documents.

## Built on tools you already know

Documints avoids introducing proprietary abstractions where the web platform and its ecosystem already provide good answers.

- **Vite plugins are Vite plugins.** Install them from npm and use them directly rather than adapting them to a Documints-specific plugin system.
- **React is React.** Interactive documentation uses normal components, state, TypeScript, and development tools.
- **Theming is CSS.** Design tokens are exposed as CSS custom properties instead of a bespoke theme-object API.
- **Configuration is TypeScript.** `defineDocumintsConfig` provides editor autocomplete and compile-time feedback.
- **Errors remain familiar.** Failures point back to the React, TypeScript, or content file that caused them.

The development server uses Vite's HMR pipeline, so edits appear without turning documentation authoring into a custom rebuild workflow. Update a `.doc.md`, `.doc.mdx`, or `.doc.tsx` file and see the change immediately without losing your place or resetting an interactive example.

Anything you already know about Vite—plugins, `optimizeDeps`, the error overlay, source maps, and development tooling—continues to apply.

Documints adds opinions where documentation benefits from them and gets out of the way everywhere else.

### Theming stays close to the platform

Re-theming Documints does not require a provider component or a theme-object schema.

Design tokens compile to CSS custom properties such as:

```css
--documints-color-primary
--documints-color-neutral-600
```

Override them in a CSS file, place the file in `.documints/public/`, and link it from `.documints/head.html`. The same conventions also handle favicons, self-hosted fonts, analytics scripts, and other static additions.

See [Static Assets & Head](/guides/customization/static-assets) for details.

### A small command surface

The primary workflow is intentionally compact:

```bash
documints dev
documints build
```

There is no separate bundler, router, Markdown processor, and static-generation pipeline for you to connect before writing the first page.

See [Usage](/guides/introduction/usage) and [Plugins](/guides/advanced/plugins) for the full configuration surface.

## Static by default

Every route builds to complete HTML and deployable static assets.

There is no production server to operate and no client-side runtime required to make the content visible. JavaScript enhances interactive pages after the document is already present; it does not stand between the reader and the documentation.

That means:

- fast first paint
- durable, cacheable output
- straightforward deployment
- strong crawlability
- fewer production dependencies
- no platform lock-in

Deploy the generated files to any static host. The output is not tied to a proprietary hosting platform or a server runtime.

Performance is not an optimization mode. It is the default output.

## One system, fewer sources of truth

The principles above produce a few important consequences:

- **Navigation cannot silently drift from the content.** It is generated from the same document graph that builds the site.
- **Repository layout does not dictate information architecture.** Keep source documents where they are useful while metadata controls where readers find them.
- **Docs remain portable.** Markdown, MDX, React, frontmatter, CSS, and Vite are standard, inspectable technologies.
- **Human and machine outputs remain aligned.** They come from the same documents and metadata rather than separate publishing pipelines.
- **Extension points stay familiar.** React, Vite plugins, CSS, static assets, and HTML provide the escape hatches.
- **Content remains useful without Documints.** Documents stay readable, greppable, diffable, and editable with ordinary development tools.

Documints is designed around a simple idea:

> Documentation should be easy to write, beautiful to read, and directly understandable by machines—without maintaining separate versions of it.

**Build a documentation corpus. The website comes with it.**
