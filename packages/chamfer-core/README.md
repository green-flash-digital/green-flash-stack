# @chamfer-css/core

> The missing piece between a design specification and developer tooling.

In engineering, a **chamfer** is a bevel deliberately cut into a sharp edge so a part fits and functions once it's actually built — the design is reshaped, at design time, to match manufacturing reality. `chamfer-css` does the same job for design systems: it takes a designer's raw intent (token definitions) and reshapes it into a developer's implementation (typed CSS utilities), so the two sides stay in sync instead of drifting apart.

---

## What it does

You define your design tokens once in TypeScript. `@chamfer-css/core` generates:

- **CSS custom properties** in a `:root {}` block, ready to import
- **Typed utility functions** (`makeColor`, `makeSpace`, `makeFontFamily`, etc.) that reference those properties with full type safety

The result is a single source of truth your design system and your codebase both point to.

```ts
// .chamfer/config.ts
import { defineTokens } from "@chamfer-css/core";

export default defineTokens({
  tokens: {
    runtime: { prefix: "ds" },
    color: {
      brand: { hue: 220, variants: 9 }
    },
    sizeAndSpace: {
      baselineGrid: 4,
      baseFontSize: 16,
      space: { mode: "auto", variants: 10 }
    }
  }
});
```

```ts
// consuming code
import { makeColor, makeSpace } from "./.chamfer/index.js";

const styles = {
  background: makeColor("brand", 600), // "var(--ds-color-brand-600)"
  padding: makeSpace(16) // "var(--ds-space-16-rem)"
};
```

---

## The `-css` suffix

The `-css` suffix is intentional. Tokens live in `:root` as CSS custom properties — that's where they exist at runtime. The TypeScript layer is how you consume them safely and with full autocomplete, not where they live.

---

## Installation

```sh
npm install @chamfer-css/core
```

Or use the CLI (recommended for most projects):

```sh
npm install -g chamfer-css
chamfer build
```

---

## Core concepts

### Token definition

Everything starts with `defineTokens`. It accepts your token configuration and an optional array of custom templates.

```ts
import { defineTokens } from "@chamfer-css/core";

export default defineTokens({
  tokens: { ... },
  templates: [...], // optional custom templates
});
```

### Built-in token types

| Category     | Utility function  | Example output                       |
| ------------ | ----------------- | ------------------------------------ |
| Color        | `makeColor`       | `var(--ds-color-brand-600)`          |
| Space        | `makeSpace`       | `var(--ds-space-16-rem)`             |
| Font family  | `makeFontFamily`  | `var(--ds-font-family-sans)`         |
| Font weight  | `makeFontWeight`  | `var(--ds-font-weight-bold)`         |
| Font variant | `makeFontVariant` | `var(--ds-font-variant-heading-lg)`  |
| Size         | `makeSize`        | `var(--ds-size-md)`                  |
| Rem          | `makeRem`         | converts `px` → `rem` string         |
| Px           | `makePx`          | appends `px` unit string             |
| Responsive   | `makeResponsive`  | generates `@media` query string      |
| Reset        | `makeReset`       | CSS reset string for a given element |
| Custom       | `makeCustom`      | `var(--ds-custom-<key>)`             |

### Custom templates

Custom templates let you extend the token system with your own token categories and utility functions, fully typed.

```ts
import { defineTemplate, defineTokens } from "@chamfer-css/core";

const borderTemplate = defineTemplate({
  name: "makeBorder",
  namespace: "border",
  tokens(_config) {
    return {
      border: { radius: { sm: 4, md: 8, lg: 16, full: 9999 } },
    };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    return [
      `--${prefix}-border-radius-sm: 4px`,
      `--${prefix}-border-radius-md: 8px`,
      `--${prefix}-border-radius-lg: 16px`,
      `--${prefix}-border-radius-full: 9999px`,
    ];
  },
  util(tokens) {
    return {
      makeBorder(size: keyof typeof tokens.border.radius): string {
        return `var(--${tokens.prefix}-border-radius-${size})`;
      },
    };
  },
});

export default defineTokens({
  tokens: { ... },
  templates: [borderTemplate],
});
```

The generated `makeUtils.ts` will include `makeBorder` alongside all built-in utilities, each as a direct named export.

### File-based templates

Drop any `.ts` file that exports a `defineTemplate` result into `.chamfer/templates/` and it will be auto-discovered at build time — no registration needed.

```
your-project/
└── .chamfer/
    ├── config.ts
    └── templates/
        └── make-border.ts   ← auto-discovered
```

---

## Programmatic API

```ts
import { Chamfer } from "@chamfer-css/core";
import definition from "./.chamfer/config.js";
import path from "node:path";

const chamfer = new Chamfer({
  definition,
  cwd: path.resolve(import.meta.dirname, ".."),
  logLevel: "info",
  env: "production"
});

await chamfer.build();
await chamfer.dev(); // build + watch mode
```

---

## Generated output

Running `chamfer build` produces three files inside `.chamfer/_generated/`:

| File           | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| `_tokens.ts`   | A `const tokens` object — the typed manifest of all token values |
| `root.css`     | A `:root {}` block with every CSS custom property                |
| `makeUtils.ts` | Named exports for every utility function                         |

And one file at `.chamfer/index.ts` that re-exports everything from `makeUtils.ts`.

---

## Package exports

```json
{
  ".": "@chamfer-css/core  — Chamfer class, defineTokens, defineTemplate",
  "./templates": "all built-in template objects",
  "./schemas": "Zod schemas and inferred TypeScript types",
  "./utils": "internal utility helpers"
}
```

---

## License

MIT
