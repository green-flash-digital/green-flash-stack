---
title: Welcome
home: true
---

# documints

**documints** is a static-site generator for documentation, built on a simple idea: the
files on disk shouldn't dictate your site's structure. Instead, each page carries its own
place in the nav directly in its frontmatter - Storybook-style - so you can organize your
`.doc.md` files however makes sense for your project.

```md
---
title: Guides/Deployment
---

# Deployment

...
```

That's the entire contract. No folder conventions, no dot-separated filenames, no routing
config. `title: Guides/Deployment` puts this page under a "Guides" section in the nav, at
the URL `/guides/deployment`.

## What you get

- **Frontmatter-driven hierarchy** - a file's location on disk never affects its route.
- **A real CLI** - `documints dev`, `documints build`, `documints init`, built with
  [fizmoo](https://github.com/green-flash-digital/fizmoo).
- **True static output** - `documints build` produces plain HTML/CSS/JS. No Node process,
  no Workers runtime, no server required to serve it - any static file host works.
- **MDX support** - embed React components in your docs when Markdown isn't enough.

Head to [Getting Started](/getting-started) to spin up a new project, or browse the
[Guides](/guides) for a deeper look at how documints works.
