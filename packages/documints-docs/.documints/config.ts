import { defineDocumintsConfig } from "documints";

export default defineDocumintsConfig({
  header: {
    title: "documints",
    links: [
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
    guides: ["writing-docs", "configuration"],
    reference: ["cli"]
  },
  docs: "../content/**/*.doc.(md|mdx)"
});
