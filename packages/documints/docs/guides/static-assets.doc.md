---
title: Guides/Static Assets & Head
slug: static-assets
---

# Static Assets & Head

Two file conventions cover everything from a favicon to a self-hosted font: a folder for
the assets themselves, and an HTML file for anything that needs to reference them from
`<head>`.

## `.documints/public/`

Anything placed here is served as-is at the site root, and copied verbatim into
`.documints/static/` on build - no processing, no import required.

```txt
.documints/
└── public/
    ├── favicon.svg
    └── fonts/
        └── Geist-Regular.woff2
```

`public/favicon.svg` → available at `/favicon.svg`. `public/fonts/Geist-Regular.woff2` →
available at `/fonts/Geist-Regular.woff2`. Reference these paths directly (from
`.documints/head.html`, or `header.logo.src` in [Configuration](/guides/configuration)).

## `.documints/head.html`

Optional. If present, its raw contents are inserted as-is into every page's `<head>` - a
favicon link, an `@font-face` block for a self-hosted font, social preview meta tags,
anything else `<head>` normally holds. There's no schema to learn here; it's just HTML.

### Favicon

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

A plain `favicon.ico` at `.documints/public/favicon.ico` also works without any entry in
`head.html` at all - browsers request that specific path by convention. Use `head.html`
when you want something other than the default (an SVG icon, an `apple-touch-icon`, etc.).

### Self-hosted fonts

Put the font file in `public/fonts/`, then declare it in `head.html`:

```html
<style>
  @font-face {
    font-family: "Geist";
    src: url("/fonts/Geist-Regular.woff2") format("woff2");
    font-weight: 400;
    font-display: swap;
  }
</style>
```

Anything referencing that `font-family` in your own CSS (via [Plugins](/guides/plugins)'
`vitePlugins`, or documints' own design tokens) will pick it up.

### Anything else

`head.html` isn't limited to `<link>`/`<style>` - Open Graph tags, a `<script>` for
analytics, a JSON-LD block, whatever real HTML your project needs. It's inserted
unescaped, since it's your own trusted project content, not user input.
