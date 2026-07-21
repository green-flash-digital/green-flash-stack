---
title: Guides/Introduction/Deploy
description: Build and deploy a static documints site to Cloudflare, Netlify, Vercel, GitHub Pages, or AWS.
---

# Deploy

## Build

```sh
yarn documints build
```

Produces `.documints/static/`: a real, prerendered `index.html` for every route, plus the
JS/CSS assets they reference. Nothing in that output depends on Node, Vite, or documints
itself at runtime - it's a plain static site.

That also means deployment is simpler than a typical SPA: every route already has its own
real HTML file on disk, so there's no client-side router to fall back to, and no catch-all
rewrite rule to configure. Point a static host at the directory and it works.

## Deploy

Hand `.documints/static/` to any static host exactly like you would a hand-written
HTML/CSS/JS bundle - there's no server process to configure or keep running. Below are the
five most common targets.

### Cloudflare

The simplest path is Cloudflare Pages: connect your repo, set the build command to
`yarn documints build` and the output directory to `.documints/static`, and every push
deploys automatically.

For more control - custom routing, a domain already on your Cloudflare account, Worker
logic alongside the site - use Workers with static assets instead, via Wrangler. This is
exactly what this site's own `wrangler.jsonc` does:

```jsonc
{
  "name": "your-site",
  "compatibility_date": "2026-07-07",
  "assets": { "directory": "./.documints/static" }
}
```

```sh
yarn documints build
npx wrangler deploy
```

### Netlify

```toml
# netlify.toml
[build]
  command = "yarn documints build"
  publish = ".documints/static"
```

Or, without a git-connected site, deploy directly from the CLI:

```sh
yarn documints build
npx netlify-cli deploy --prod --dir=.documints/static
```

### Vercel

```json
// vercel.json
{
  "buildCommand": "yarn documints build",
  "outputDirectory": ".documints/static"
}
```

Set the framework preset to "Other" if prompted - documints isn't a framework Vercel
recognizes by name, and doesn't need to be.

### GitHub Pages

Deploy via GitHub Actions rather than a `gh-pages` branch, using the official Pages
actions:

```yaml
# .github/workflows/deploy.yml
- run: yarn documints build
- uses: actions/upload-pages-artifact@v3
  with:
    path: .documints/static
- uses: actions/deploy-pages@v4
```

Requires Pages enabled in the repo's Settings, with "GitHub Actions" selected as the
source.

### AWS S3 + CloudFront

```sh
yarn documints build
aws s3 sync .documints/static s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

The CloudFront invalidation matters here - without it, CloudFront keeps serving cached
copies of changed pages until their TTL expires. S3 static website hosting also works
without CloudFront in front of it, at the cost of no CDN/HTTPS unless you add one.
