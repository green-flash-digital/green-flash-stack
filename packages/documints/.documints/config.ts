import { defineDocumintsConfig } from "documints";

import { defineDocumintsOrdering } from "./.generated/order.js";

export default defineDocumintsConfig({
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
      { introduction: ["why-documints", "getting-started"] },
      "usage",
      "writing-docs",
      "routing",
      "configuration",
      "static-assets",
      { advanced: ["plugins"] }
    ],
    reference: ["cli", "how-it-works"]
  }),
  docs: "../docs/**/*.doc.{md,mdx,tsx}"
});
