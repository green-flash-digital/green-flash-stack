import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ActionFunctionArgs } from "react-router";

import type { KeystoneConfig } from "@keystone-css/core/schemas";
import { collect } from "@linaria/server";
import puppeteer from "puppeteer";
import { renderToString } from "react-dom/server";

import {
  convertBrandColorIntoVariants,
  convertNeutralColorIntoVariants,
  getInitColorStateFromConfig
} from "~/features/color/color.utils";
import { ConfigurationProvider } from "~/features/Config.context";
import { getSGColorClass, getSgColorClassValues } from "~/features/style-guide/style-guide.utils";
import { StyleGuideBasic } from "~/features/style-guide/StyleGuideBasic";

function htmlTemplate(htmlString: string, cssString: string) {
  return `<!DOCTYPE html><html>
    <head>
    <style type="text/css">${cssString}</style>
    </head>
    <body>${htmlString}</body></html>`;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const config = String(formData.get("config"));
  const configJson = JSON.parse(config) as KeystoneConfig;

  const clientAssetsDir =
    process.env.NODE_ENV !== "production"
      ? path.resolve(process.cwd(), "./build/client/assets")
      : "";
  const cssOutFile =
    process.env.NODE_ENV !== "production" ? path.resolve(process.cwd(), "./build/app-css.css") : "";
  const htmlOutFile =
    process.env.NODE_ENV !== "production"
      ? path.resolve(process.cwd(), "./build/app-html.html")
      : "";

  // Manually create some CSS styles
  const color = getInitColorStateFromConfig(configJson);
  const bVariants = convertBrandColorIntoVariants(color);
  const nVariants = convertNeutralColorIntoVariants(color);
  const variants = Object.assign(bVariants, nVariants);

  // Loop through all of the color and their variants and create individual classes
  let styleGuideCSS = "";
  for (const [colorName, { base }] of Object.entries(variants)) {
    const attributes = getSgColorClassValues(base);
    styleGuideCSS = styleGuideCSS.concat(`
      .${getSGColorClass(colorName)} {
        background-color: ${attributes.backgroundColor};
        color: ${attributes.color};
    }`);
  }

  const dirents = await readdir(clientAssetsDir, { withFileTypes: true });
  let restCss = "";
  let root = "";
  for await (const dirent of dirents) {
    if (!dirent.name.includes(".css")) continue;
    const cssFilePath = path.join(dirent.parentPath, dirent.name);
    const cssContent = await readFile(cssFilePath, { encoding: "utf8" });
    // add the root to the beginning
    if (dirent.name.includes("root-")) {
      root = cssContent;
      continue;
    }
    restCss = restCss.concat(cssContent);
  }

  // Assemble the root, the style guide colors and the rest of the CSS
  const css = styleGuideCSS.concat(root).concat(restCss);

  // Assemble the HTML with the critical CSS to the react tree
  const reactHtml = renderToString(
    <ConfigurationProvider originalConfig={configJson}>
      <StyleGuideBasic />
    </ConfigurationProvider>
  );
  const { critical: criticalCSS } = collect(reactHtml, css);
  const html = htmlTemplate(reactHtml, criticalCSS);

  // Print out some test's for verification
  if (process.env.NODE_ENV !== "production") {
    await writeFile(htmlOutFile, html);
    await writeFile(cssOutFile, criticalCSS);
  }

  // Render the style guide as HTML
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: "load"
  });
  await page.evaluate(() => {
    document.querySelectorAll(".page-break").forEach((el) => {
      const node = el as HTMLElement;
      node.style.display = "block";
      node.style.breakAfter = "page";
      node.style.pageBreakAfter = "always"; // Fallback
    });

    document.querySelectorAll(".page").forEach((el) => {
      const node = el as HTMLElement;
      node.style.borderBottom = "unset";
      node.style.marginBottom = "unset";
      node.style.paddingBottom = "unset";
      node.style.padding = "unset";
      node.style.border = "1px solid green";
    });
  });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    landscape: true,
    margin: {
      top: ".5in",
      right: ".5in",
      bottom: ".5in",
      left: ".5in"
    },
    displayHeaderFooter: false
  });
  await browser.close();

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=style-guide.pdf" // Open in browser instead of downloading
    }
  });
}
