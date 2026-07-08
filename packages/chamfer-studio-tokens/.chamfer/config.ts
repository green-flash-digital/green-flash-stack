import { defineTemplate, defineTokens } from "@keystone-css/core";

const makeBorderTemplate = defineTemplate({
  name: "makeBorder",
  description: "Custom border radius tokens",
  namespace: "border",
  tokens(_config) {
    return {
      border: {
        radius: { sm: 4, md: 8, lg: 16, full: 9999 }
      }
    };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    return [
      `--${prefix}-border-radius-sm: 4px`,
      `--${prefix}-border-radius-md: 8px`,
      `--${prefix}-border-radius-lg: 16px`,
      `--${prefix}-border-radius-full: 9999px`
    ];
  },
  util(tokens) {
    return {
      makeBorder(size: keyof typeof tokens.border.radius): string {
        return `var(--${tokens.prefix}-border-radius-${size})`;
      }
    };
  }
});

export default defineTokens({
  tokens: {
    runtime: {
      prefix: "studio",
      strict: true,
      suppressStrictWarnings: false
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
        Poppins: {
          family: "Poppins",
          fallback:
            'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          styles: ["bold-700", "semiBold-600", "medium-500", "regular-400", "light-300"]
        },
        Inter: {
          family: "Inter",
          fallback:
            'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          styles: ["bold-700", "semiBold-600", "medium-500", "regular-400", "light-300"]
        },
        Mulish: {
          family: "Mulish",
          fallback:
            'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          styles: ["bold-700", "semiBold-600", "medium-500", "regular-400", "light-300"]
        },
        Consolas: {
          family: "Consolas",
          fallback:
            'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          styles: ["bold-700", "semiBold-600", "medium-500", "regular-400", "light-300"]
        }
      },
      variants: {
        logo: { familyToken: "Poppins", weight: "bold-700", size: 24, lineHeight: 1.2 },
        heading: { familyToken: "Poppins", weight: "semiBold-600", size: 18, lineHeight: 1.3 },
        body: { familyToken: "Mulish", weight: "regular-400", size: 14, lineHeight: 1.5 },
        "body-sm": { familyToken: "Mulish", weight: "regular-400", size: 12, lineHeight: 1.5 },
        label: { familyToken: "Mulish", weight: "medium-500", size: 12, lineHeight: 1.4 },
        code: { familyToken: "Consolas", weight: "regular-400", size: 13, lineHeight: 1.6 }
      }
    },
    response: {
      breakpoints: { phone: 375, tablet: 768, desktop: 1280 }
    },
    color: {
      vibe: { type: "fluorescent", lightness: 0.82, chroma: 0.23 },
      colors: {
        primary: { hue: 47, variants: 10 },
        secondary: { hue: 170, variants: 10 },
        warning: { hue: 60, variants: 6 },
        danger: { hue: 359, variants: 4 },
        success: { hue: 131, variants: 10 },
        background: { hex: "#ffffff" },
        surface: { hex: "#f8fafc" },
        neutral: { hex: "#64748b", variants: { dark: "#0f172a", light: "#f1f5f9" } }
      }
    },
    semantic: {
      interactive: { light: "primary-600", dark: "primary-400" },
      "interactive-text": { light: "neutral-light", dark: "neutral-light" },
      surface: { light: "background", dark: "neutral-dark" },
      "on-surface": { light: "neutral-dark", dark: "neutral-light" }
    },
    custom: {
      "layout-header-height": {
        type: "rem",
        value: 100,
        description:
          "The height of the header. Used to reference the header height to calculate sticky values"
      },
      "layout-max-width": {
        type: "rem",
        value: 1600,
        description: "The max width of the application content area"
      },
      "layout-gutters": {
        type: "rem",
        value: 32,
        description: "The padding for each of the layouts"
      },
      "layout-section-title-height": {
        type: "rem",
        value: 72,
        description: "The height of the title for each of the section layout"
      },
      "modal-gutters": {
        type: "rem",
        value: 32,
        description:
          "The padding for any dialogs to be used in the header, body and footer elements"
      }
    }
  },
  templates: [makeBorderTemplate]
});
