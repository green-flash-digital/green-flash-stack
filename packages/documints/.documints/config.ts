import { defineDocumintsConfig } from "documints";

import { defineDocumintsOrdering } from "./.generated/order.js";

export default defineDocumintsConfig({
  docs: "../docs/**/*.doc.{md,mdx,tsx}",
  siteUrl: "https://documints.dev",
  editUrl: "https://github.com/green-flash-digital/green-flash-stack/edit/main/packages/documints",
  header: {
    title: "documints",
    logo: {
      src: "/documints-mint-leaves.png",
      alt: "logo"
    },
    links: [
      [
        { type: "internal", href: "/guides", text: "Guides" },
        { type: "internal", href: "/reference", text: "Reference" }
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
      { advanced: ["plugins", "using-documints-with-ai"] }
    ],
    reference: ["cli", "how-it-works"]
  })
});
