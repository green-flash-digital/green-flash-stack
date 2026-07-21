import type { DocumintsMeta } from "../meta/DocumintsMeta.js";

function ensureLeadingSlash(entries: string[]): string[] {
  return entries.map((entry) => (entry.startsWith("/") ? entry : "/".concat(entry)));
}

/**
 * Every machine-readable format this route/site publishes, as `<link>` tags
 * plus a plain-language HTML comment - belt-and-suspenders discovery. The
 * `<link>` tags are for tools that recognize `rel` values (mirroring how a
 * blog advertises its RSS feed from every page, not just the homepage); the
 * comment is for an LLM-based agent reading raw HTML as text, which doesn't
 * need a registered `rel` value to notice "these files exist, here's where."
 * An agent that lands on one arbitrary page via a search result has no way
 * to know `/.well-known/documints.json` exists otherwise.
 */
function renderMachineDiscoveryTags({
  markdownHref,
  jsonHref,
  manifestHref,
  wellKnownHref,
  llmsTxtHref,
  llmsFullTxtHref
}: {
  markdownHref?: string;
  jsonHref?: string;
  manifestHref?: string;
  wellKnownHref?: string;
  llmsTxtHref?: string;
  llmsFullTxtHref?: string;
}): string {
  const links = [
    markdownHref && `<link rel="alternate" type="text/markdown" href="${markdownHref}" />`,
    jsonHref && `<link rel="alternate" type="application/json" href="${jsonHref}" />`,
    manifestHref && `<link rel="index" href="${manifestHref}" />`,
    llmsTxtHref && `<link rel="llms.txt" href="${llmsTxtHref}" />`
  ]
    .filter(Boolean)
    .join("\n    ");

  const notes = [
    markdownHref && `this page's raw Markdown source is at ${markdownHref}`,
    jsonHref && `this page's structured metadata is at ${jsonHref}`,
    manifestHref && `this whole site's document index is at ${manifestHref}`,
    wellKnownHref && `this site's machine-discovery endpoint is at ${wellKnownHref}`,
    llmsTxtHref && `an index of every page is at ${llmsTxtHref}`,
    llmsFullTxtHref && `this entire site's content, concatenated, is at ${llmsFullTxtHref}`
  ].filter(Boolean);

  const comment =
    notes.length > 0
      ? `<!-- This is a documints site - documentation generated once, published as HTML for people and structured data for agents. ${notes.join("; ")}. -->`
      : "";

  return [links, comment].filter(Boolean).join("\n    ");
}

/**
 * Dynamically create the HTML shell where the scripts, meta, and
 * css are inserted into the app... this will allow for hydration on
 * the client once the first request is made
 */
export function generateHTMLTemplate({
  cssLinks,
  jsScripts,
  Meta,
  head = "",
  markdownHref,
  jsonHref,
  manifestHref,
  wellKnownHref,
  llmsTxtHref,
  llmsFullTxtHref
}: {
  cssLinks: string[];
  jsScripts: string[];
  Meta: DocumintsMeta;
  /**
   * Raw HTML, inserted as-is into `<head>` - the contents of the project's
   * `.documints/head.html`, if present (favicon links, a self-hosted font's
   * `<style>`/`@font-face` block, social preview meta tags, whatever real
   * HTML the project needs). Trusted project-authored content, not user
   * input, so no escaping is applied.
   */
  head?: string;
  /**
   * This route's raw-Markdown sibling (see `Documints.getMarkdownHref`) -
   * advertised via `<link rel="alternate">` so an agent that already has the
   * HTML can discover it without guessing the `.md` convention. Omitted for
   * routes with no Markdown equivalent (`.doc.tsx` pages).
   */
  markdownHref?: string;
  /** This route's structured `.json` sibling (see `Documints.getJsonHref`) - every route has one. */
  jsonHref?: string;
  /** The site-wide `docs-manifest.json`, always generated regardless of `siteUrl`. */
  manifestHref?: string;
  /** The site's `/.well-known/documints.json` discovery document, always generated. */
  wellKnownHref?: string;
  /** Only set when `siteUrl` is configured - `llms.txt`/`llms-full.txt` aren't generated otherwise. */
  llmsTxtHref?: string;
  llmsFullTxtHref?: string;
}) {
  const htmlStart = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${head}
    ${ensureLeadingSlash(cssLinks).reduce<string>(
      (accum, href) => accum.concat(`<link rel="stylesheet" href="${href}" />\n`),
      ""
    )}
    ${renderMachineDiscoveryTags({
      markdownHref,
      jsonHref,
      manifestHref,
      wellKnownHref,
      llmsTxtHref,
      llmsFullTxtHref
    })}
    ${Meta.renderNodesToString()}
    <style>
      html, body {
        padding: 0;
        margin: 0;
      }
    </style>
  </head>
  <body>
  <div id="root">`;

  const htmlEnd = `</div>
  </body>
  ${ensureLeadingSlash(jsScripts).reduce<string>(
    (accum, src) => accum.concat(`<script type="module" src="${src}"></script>`),
    ""
  )}
</html>
`;

  return {
    htmlStart,
    htmlEnd,
    htmlDev: `${htmlStart}<!--ssr-outlet-->${htmlEnd}`
  };
}
