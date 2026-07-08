# Session Summary — `buttery-tokens` Architecture Refactor

## Goal

Replace the single `createTokenUtils` function (which destructured all token utilities from one call) with a modular, per-template export system. Users can now define custom templates inline via `defineTokens` or drop files into `.buttery/templates/`, and each utility is a direct named export typed to its specific template.

---

## What Changed

### `packages/core/src/templates/types.ts`

- `TokenTemplate` is now fully generic: `TokenTemplate<TTokens, TUtil>`
- `defineTemplate<TTokens, TUtil>` infers both type params from the definition object, giving full type safety on `util(tokens)` — including user-defined token keys like `tokens.border.radius`
- `util` is **required** (not optional)

### `packages/core/src/defineTokens.ts`

- `defineTokens` now accepts `{ tokens: ButteryTokensConfigInput; templates?: [...T] }`
- Generic over the template tuple `T extends AnyTemplate[]` — preserves tuple types so `_def.templates[0].util(tokens)` is fully typed in the generated file
- `AnyTemplate = TokenTemplate<Record<string, unknown>, Record<string, unknown>>` — avoids lint-banned `any` while method bivariance makes the constraint work
- `ButteryTokensDefinition<T>` exported for consumers

### `packages/core/src/templates/index.ts` _(new file)_

- Barrel export of all 11 built-in templates for use via `@buttery/core/templates`

### `packages/core/package.json`

- Added `"./templates": "./dist/templates/index.js"` export entry

### `packages/core/src/templates/Template.make-space.ts`

- `getSpaceSteps` return type annotated as `readonly number[]` to align with `TokenManifest.space` and fix a compile error

### `packages/core/src/ButteryTokens.ts`

- Constructor renamed `config` param to `definition` (accepts `ButteryTokensDefinition`)
- `build()` separates `builtinTemplates` array from user-provided templates
- File-based template discovery (`.buttery/templates/`) tracks `{ template, relPath }` pairs
- **Step 4 fully rewritten** — generates `makeUtils.ts` using individual template imports:
  - Built-ins imported from `@buttery/core/templates`, one `export const { fn } = template.util(tokens)` per template
  - Inline user templates accessed via `_def.templates[i].util(tokens)` (imports `../config.js`)
  - File-based user templates imported by relative path with a local variable
  - Keys discovered at build time via `Object.keys(template.util(manifest as unknown as TokenManifest))`

---

## Generated Output (`makeUtils.ts`)

```ts
import { colorTemplate, spaceTemplate /* ... */ } from "@buttery/core/templates";
import { tokens } from "./_tokens.js";
import _def from "../config.js";

export const { makeColor } = colorTemplate.util(tokens);
export const { makeSpace } = spaceTemplate.util(tokens);
// ... all 11 built-ins
export const { makeBorder } = _def.templates[0].util(tokens);
```

---

## Usage Pattern (Consumer Side)

```ts
// .buttery/config.ts
import { defineTemplate, defineTokens } from "@buttery/core";

const makeBorderTemplate = defineTemplate({
  name: "makeBorder",
  namespace: "border",
  tokens(_config) {
    return { border: { radius: { sm: 4, md: 8, lg: 16, full: 9999 } } };
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
  tokens: { runtime: { prefix: "studio" } /* ... */ },
  templates: [makeBorderTemplate]
});
```

```ts
// consuming code
import { makeColor, makeSpace, makeBorder } from "./.buttery/index.js";
```

---

## Key Design Decisions

**Method syntax bivariance** — `TokenTemplate` uses method syntax (`util(tokens): TUtil`) rather than property function syntax (`util: (tokens) => TUtil`), which makes `TokenTemplate<Specific>` assignable to `TokenTemplate<Record<string,unknown>>` without variance errors.

**No `any`** — `AnyTemplate = TokenTemplate<Record<string,unknown>, Record<string,unknown>>` avoids the lint ban while achieving the same flexibility, because method bivariance makes specific template types assignable to it.

**Tuple preservation** — `templates?: [...T]` in `defineTokens` keeps the tuple type intact so individual template indices (`_def.templates[0]`) are precisely typed in the generated file.

**Build-time key discovery** — calling `Object.keys(template.util(manifest as unknown as TokenManifest))` during `build()` drives what gets destructured in the generated file, so no manual registration is needed when adding a new template.

**Two user extension points:**

1. `templates` array in `defineTokens({ tokens, templates })` — inline, fully typed, tuple-inferred
2. `.buttery/templates/*.ts` files — file-based, auto-discovered at build time, imported by relative path in the generated output
