import { defineTemplate } from "../../../templates/types.js";
import { defineTokens } from "../../../defineTokens.js";

/**
 * A representative custom (user-provided) template, mirroring the
 * `makeBorder` example real projects write in `.chamfer/config.ts`. Exists
 * so the build-output type test (see ./build-output.test-d.ts) covers both
 * built-in templates (color, space, ...) and a project-authored one.
 */
const makeBorderTemplate = defineTemplate({
  name: "makeBorder",
  description: "Fixture custom template for border radius tokens",
  namespace: "border",
  tokens(_config) {
    return {
      border: {
        radius: { sm: 4, md: 8 }
      }
    };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    return [`--${prefix}-border-radius-sm: 4px`, `--${prefix}-border-radius-md: 8px`];
  },
  util<T extends { prefix: string; border: { radius: Record<string, number> } }>(tokens: T) {
    return {
      makeBorder(size: keyof T["border"]["radius"] & string): string {
        return `var(--${tokens.prefix}-border-radius-${size})`;
      }
    };
  }
});

export default defineTokens({
  tokens: {
    runtime: { prefix: "fixture" },
    color: {
      vibe: { type: "fluorescent", lightness: 0.8, chroma: 0.23 },
      colors: {
        primary: { hue: 47, variants: 4 },
        secondary: { hue: 200, variants: 4 },
        background: { hex: "#ffffff" },
        surface: { hex: "#f8fafc" },
        neutral: { hex: "#64748b", variants: { dark: "#0f172a", light: "#f1f5f9" } }
      }
    },
    semantic: {
      interactive: { light: "primary", dark: "secondary" }
    },
    sizeAndSpace: {
      baseFontSize: 16,
      baselineGrid: 4,
      size: { variants: { dense: 24, normal: 32 } },
      space: { mode: "auto", variants: 11 }
    },
    font: {
      source: "manual",
      families: {
        Body: {
          family: "Body",
          fallback: "sans-serif",
          styles: ["bold-700", "regular-400"]
        }
      },
      variants: {
        heading: { familyToken: "Body", weight: "bold-700", size: 24, lineHeight: 1.2 }
      }
    },
    response: {
      breakpoints: { mobile: 375, tablet: 768, desktop: 1280 }
    },
    custom: {
      "brand-radius": { type: "rem", value: 8, description: "Fixture custom token" }
    }
  },
  templates: [makeBorderTemplate]
});
