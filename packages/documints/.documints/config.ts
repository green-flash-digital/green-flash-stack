import { defineDocumintsConfig } from "documints";

import { defineDocumintsOrdering } from "./.generated/order.js";

export default defineDocumintsConfig({
  docs: "../docs/**/*.doc.{md,mdx,tsx}",
  siteUrl: "https://documints.dev",
  editUrl: "https://github.com/green-flash-digital/green-flash-stack/edit/main/packages/documints",
  header: {
    title: "documints",
    links: [
      [
        { type: "section", title: "Guides" },
        { type: "section", title: "Reference" }
      ],
      [
        {
          type: "social",
          provider: "github",
          href: "https://github.com/green-flash-digital/green-flash-stack",
          label: "GitHub"
        }
      ]
    ]
  },
  order: defineDocumintsOrdering({
    guides: [
      { introduction: ["why-documints", "getting-started", "usage", "deploy"] },
      { writing: ["writing-docs", "playground"] },
      { customization: ["routing", "static-assets"] },
      "configuration",
      { advanced: ["plugins"] }
    ],
    reference: ["cli", "how-it-works"]
  })
});
