import { defineTokens } from "../../defineTokens.js";
import { defineTemplate } from "../../templates/types.js";

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
      // Every shape `ColorEntrySchema` accepts, so the color template's
      // key-naming logic gets exercised for each one, not just the "auto
      // numeric variants from a hue" happy path:
      vibe: { type: "fluorescent", lightness: 0.8, chroma: 0.23 },
      colors: {
        // hue + auto numeric variant count
        primary: { hue: 47, variants: 4 },
        secondary: { hue: 200, variants: 4 },
        // hue + auto-named variants (array length picks the count; the
        // element strings themselves aren't used as key names — see
        // `autoCreateVariantMap` in util.color-variants.ts — so this
        // produces the same "50"/"100"/"200" shape as the numeric case,
        // but is still worth covering as a distinct valid *input* shape)
        tertiary: { hue: 280, variants: ["light", "base", "dark"] },
        // bare hex, no variants at all
        background: { hex: "#ffffff" },
        surface: { hex: "#f8fafc" },
        // hex + auto numeric variant count
        accent: { hex: "#ff6b35", variants: 3 },
        // hex + manual key-value variants (real custom names — the only
        // shape that actually produces non-numeric generated keys)
        neutral: { hex: "#64748b", variants: { dark: "#0f172a", light: "#f1f5f9" } },
        info: { hex: "#0ea5e9", variants: { subtle: "#e0f2fe", strong: "#0369a1" } }
      }
    },
    semantic: {
      interactive: { light: "primary", dark: "secondary" },
      surface: { light: "background", dark: "neutral-dark" }
    },
    sizeAndSpace: {
      baseFontSize: 16,
      baselineGrid: 4,
      size: { variants: { dense: 24, normal: 32, big: 44 } },
      space: { mode: "auto", variants: 11 }
    },
    font: {
      source: "manual",
      families: {
        Body: {
          family: "Body",
          fallback: "sans-serif",
          styles: ["bold-700", "regular-400"]
        },
        Mono: {
          family: "Mono",
          fallback: "monospace",
          styles: ["regular-400"]
        }
      },
      variants: {
        heading: { familyToken: "Body", weight: "bold-700", size: 24, lineHeight: 1.2 },
        code: { familyToken: "Mono", weight: "regular-400", size: 14, lineHeight: 1.5 }
      }
    },
    response: {
      breakpoints: { mobile: 375, tablet: 768, desktop: 1280 }
    },
    custom: {
      // All three CustomVariantSchema branches (rem / string / number)
      "brand-radius": { type: "rem", value: 8, description: "Fixture custom rem token" },
      "brand-name": {
        type: "string",
        value: "Chamfer",
        description: "Fixture custom string token"
      },
      "z-index-modal": { type: "number", value: 1000, description: "Fixture custom number token" }
    }
  },
  templates: [makeBorderTemplate]
});
