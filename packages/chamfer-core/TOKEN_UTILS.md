# Token Utils

This document covers the architecture of `buttery-tokens` utilities and how to extend them with your own custom templates.

## How it works

Running `buttery-tokens build` generates three files inside `.buttery/_generated/`:

| File              | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `_tokens.ts`      | Typed JSON manifest of all design tokens             |
| `_token-utils.ts` | Factory-generated object of typed utility functions  |
| `root.css`        | CSS custom properties (`:root` block) for all tokens |

The `_tokens.ts` manifest is the single source of truth. Both the CSS variables and the utility functions are derived from it at build time.

## Using the built-in utilities

Each utility is a named export. Import directly from `.buttery` (the barrel) or from the generated binding file:

```ts
// preferred — clean barrel import
import { makeColor, makeRem, makeResponsive } from "./.buttery";

// or directly from the generated file
import { makeColor, makeRem } from "./.buttery/_generated/_token-utils.js";
```

All utilities are fully typed against your specific token manifest — token name parameters autocomplete to only the names you've defined in your config.

### `makeColor(name, options?)`

Returns a CSS variable reference for a color token. Supports optional opacity via `color-mix`.

```ts
makeColor("primary"); // → var(--myapp-color-primary)
makeColor("neutral-500"); // → var(--myapp-color-neutral-500)
makeColor("primary", { opacity: 0.5 }); // → color-mix(in oklch, var(--myapp-color-primary), transparent 50%)
```

### `makeRem(px)`

Converts a pixel value to `rem` based on `sizeAndSpace.baseFontSize` in your config.

```ts
makeRem(16); // → "1rem"   (if baseFontSize is 16)
makeRem(24); // → "1.5rem"
```

### `makePx(val)`

Appends `px` to a numeric value.

```ts
makePx(4); // → "4px"
```

### `makeResponsive({ from?, to? })`

Returns a CSS `@media` query string. Token names for `from`/`to` autocomplete to your configured breakpoints.

```ts
makeResponsive({ from: "md" }); // → "@media (min-width: 768px)"
makeResponsive({ to: "lg" }); // → "@media (max-width: 1023px)"
makeResponsive({ from: "sm", to: "lg" }); // → "@media (min-width: 480px) and (max-width: 1023px)"
```

### `makeReset(element)`

Returns CSS reset styles for a common HTML element.

```ts
makeReset("button"); // → "margin: 0; padding: 0; border: none; background: none;"
makeReset("ul"); // → resets margins, padding, and list-style
makeReset("input"); // → comprehensive input reset (appearance, outline, box-sizing, etc.)
makeReset("anchor"); // → removes underline and inherits color
makeReset("body"); // → resets margin and padding
```

### `makeCustom(name)`, `makeFontFamily(name)`, `makeFontWeight(name)`

CSS variable references for custom, font-family, and font-weight tokens respectively. Token names autocomplete to only the names defined in your config.

```ts
makeCustom("spacing-xl"); // → var(--myapp-custom-spacing-xl)
makeFontFamily("sans"); // → var(--myapp-font-family-sans)
makeFontWeight("sans-regular"); // → var(--myapp-font-weight-sans-regular)
```

---

## Adding custom utilities

Place a `token-utils.ts` file in your `.buttery/` directory. It must export an array named `extensions` — each element is a `defineTemplate` object.

```ts
// .buttery/token-utils.ts
import { defineTemplate } from "@buttery/core";

export const extensions = [
  defineTemplate({
    name: "makeFluidType",
    namespace: "fluid",
    description: "Fluid typography scale between two sizes",
    tokens(_config) {
      return {};
    },
    cssProperties(_config) {
      return [];
    },
    util(tokens) {
      return {
        makeFluidType(min: number, max: number): string {
          return `clamp(${min}px, ${tokens.baseFontSize}vw, ${max}px)`;
        }
      };
    }
  })
];
```

After running `build`, the generated `_token-utils.ts` exports built-in utils by name and provides a `tokenUtils` object that merges them with your extensions:

```ts
// .buttery/_generated/_token-utils.ts  (auto-generated)
import { createTokenUtils } from "@buttery/core/token-utils";
import { tokens } from "./_tokens.js";
import { extensions } from "../token-utils.js";

export const {
  makeColor,
  makeCustom
  // ...all built-ins
} = createTokenUtils(tokens);

export const tokenUtils = {
  makeColor,
  makeCustom,
  // ...all built-ins
  ...extensions.reduce(
    (acc, template) => ({ ...acc, ...(template.util?.(tokens) ?? {}) }),
    {} as Record<string, unknown>
  )
};
```

Built-in utils are available as named imports via the barrel. Extension utils are accessed through `tokenUtils`:

```ts
import { makeColor } from "./.buttery"; // built-in: fully typed
import { tokenUtils } from "./.buttery"; // includes extensions
tokenUtils.makeFluidType(14, 18); // → "clamp(14px, 16vw, 18px)"
```

---

## `defineTemplate` API

Each template is a plain object with the following fields:

| Field                   | Required | Description                                                                                      |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `name`                  | yes      | The name of the primary util function this template produces (e.g. `"makeColor"`)                |
| `namespace`             | yes      | CSS variable namespace segment (e.g. `"color"` → `--prefix-color-*`)                             |
| `description`           | no       | Human-readable description of what the template generates                                        |
| `tokens(config)`        | yes      | Returns a slice of the token manifest. Merged into `_tokens.ts`.                                 |
| `cssProperties(config)` | yes      | Returns an array of CSS custom property declarations. Merged into `:root` in `root.css`.         |
| `util(tokens)`          | no       | Returns an object of utility functions closed over the token manifest. Merged into `tokenUtils`. |

The `tokens` argument passed to `util` is the full generated manifest from `_tokens.ts`, so your utility functions have access to all token values at runtime.

---

## Directory structure

```
.buttery/
  config.json          ← design system config (colors, fonts, breakpoints, etc.)
  token-utils.ts       ← optional: your custom template extensions
  _generated/
    _tokens.ts         ← auto-generated: typed token manifest
    _token-utils.ts    ← auto-generated: typed utility factory
    root.css           ← auto-generated: CSS custom properties (:root block)
```
