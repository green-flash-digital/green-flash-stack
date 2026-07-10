import type { ButteryMeta } from "@buttery/meta";

function ensureLeadingSlash(entries: string[]): string[] {
  return entries.map((entry) =>
    entry.startsWith("/") ? entry : "/".concat(entry)
  );
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
}: {
  cssLinks: string[];
  jsScripts: string[];
  Meta: ButteryMeta;
}) {
  const htmlStart = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${ensureLeadingSlash(cssLinks).reduce<string>(
      (accum, href) =>
        accum.concat(`<link rel="stylesheet" href="${href}" />\n`),
      ""
    )}
    ${Meta.renderNodesToString()}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap"
      rel="stylesheet"
    />
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
    (accum, src) =>
      accum.concat(`<script type="module" src="${src}"></script>`),
    ""
  )}
</html>
`;

  return {
    htmlStart,
    htmlEnd,
    htmlDev: `${htmlStart}<!--ssr-outlet-->${htmlEnd}`,
  };
}
