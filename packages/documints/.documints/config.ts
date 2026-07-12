import { defineDocumintsConfig } from "documints";

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
  order: {
    guides: [
      "concepts",
      "usage",
      "writing-docs",
      "routing",
      "configuration",
      "static-assets",
      "plugins"
    ],
    reference: ["cli", "how-it-works"]
  },
  docs: "../docs/**/*.doc.{md,mdx,tsx}"
});
