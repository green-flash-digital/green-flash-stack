import type { DocumintsMeta } from "../meta/DocumintsMeta.js";

function ensureLeadingSlash(entries: string[]): string[] {
  return entries.map((entry) => (entry.startsWith("/") ? entry : "/".concat(entry)));
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
  head = ""
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
