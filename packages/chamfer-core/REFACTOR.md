# Buttery Tokens — Refactor Plan

## Context

This plan is based on a full codebase review and architectural reasoning session. Nothing is off-limits — schema changes, new utilities, new packages, and breaking changes are all on the table where justified.

The guiding principle for all decisions: **the library is a typesafe bridge between a design system configuration and the code that consumes it.** The `custom` token system is the clearest expression of that thesis and should lead positioning. Color is a feature of the system, not the system itself.

---

## Current State Assessment

| Area                       | Status                                                | Blocking? |
| -------------------------- | ----------------------------------------------------- | --------- |
| `makeColor`                | Works, but HSB model has perceptual issues            | No        |
| `makeCustom`               | Solid, most battle-tested utility                     | No        |
| `makeFontFamily`           | Works                                                 | No        |
| `makeFontWeight`           | Works, naming convention awkward                      | No        |
| `makeFontVariant`          | Schema ✓, Studio UI ✓, **Template missing**           | Yes       |
| `makeFontBaseSize`         | Confused signature, effectively broken                | Yes       |
| `makeSpace`                | Schema ✓, utils ✓, **Template commented out**         | Yes       |
| `makeSize`                 | Schema ✓, **Template commented out**                  | Yes       |
| `makeRem`                  | Works, but unconstrained (no grid validation)         | No        |
| `makeResponsive`           | Works well                                            | No        |
| Color: neutral/brand       | Separate models, neutrals outside vibe system         | No        |
| Color: HSB vibes           | ~200 lines of `z.literal()`, perceptually non-uniform | No        |
| Font: Google/Adobe sources | Stubs that silently produce no output                 | Yes       |
| Font: token name casing    | Preserves user input casing (`Poppins-bold`)          | No        |
| Studio dogfood config      | Font variants reference non-existent family tokens    | Yes       |
| `makeCustom` CSS output    | Bug: `"number"` and `"string"` types serialize wrong  | Yes       |

---

## Phase 0 — Factory Architecture (Do Before Everything Else)

The current model generates TypeScript utility function bodies as strings via `makeUtilTS(): string`. This has no IDE support, no type checking, and produces hard-to-maintain string templates with nested escape sequences. The `makeResponsive` template already has a bug from this: the combined `from && to` branch emits `@media` twice — invisible in a string, immediately obvious in real TypeScript.

The new model eliminates generated utility files entirely. The build produces one manifest file. The utility functions live as real TypeScript in `@buttery/core` and are accessed via a factory. Types flow through generics — no module augmentation, no generated function bodies.

### What the build produces

`buttery build` now writes two files total instead of one `.ts` per utility:

```
.buttery/_generated/
  _tokens.ts    ← all token data, regenerated on every build
  root.css      ← :root CSS custom properties, unchanged
```

`_tokens.ts` is a single `as const` object. TypeScript infers literal types from it automatically:

```ts
// .buttery/_generated/_tokens.ts  (auto-generated, do not edit)
export const tokens = {
  prefix: "studio",
  color: {
    primary: "oklch(0.58 0.14 80)",
    "primary-500": "oklch(0.58 0.14 80)",
    neutral: "oklch(0.75 0.02 220)"
  } as const,
  space: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40] as const,
  custom: {
    "layout-header-height": "6.25rem",
    "layout-max-width": "100rem"
  } as const,
  font: {
    families: { poppins: "Poppins, system-ui, sans-serif" } as const,
    weights: { "poppins-bold": 700, "poppins-regular": 400 } as const,
    variants: {
      heading: {
        family: "poppins",
        weight: "poppins-bold",
        size: 1.25,
        lineHeight: 1.3,
        letterSpacing: 0
      },
      body: {
        family: "poppins",
        weight: "poppins-regular",
        size: 0.875,
        lineHeight: 1.5,
        letterSpacing: 0
      }
    } as const
  },
  size: { dense: 24, normal: 32, big: 44 } as const,
  breakpoints: { phone: 375, tablet: 768, desktop: 1280 } as const
} as const;
```

### `createTokenUtils` — factory in `@buttery/core`

All utility functions live in `@buttery/core` as real TypeScript. The factory accepts the generated manifest and returns typed utilities. The generic `T` is captured once at creation; all returned functions have fully resolved concrete types.

```ts
// @buttery/core — real TypeScript, ships with the package
export type TokenManifest = {
  prefix: string;
  color: Record<string, string>;
  space: readonly number[];
  custom: Record<string, string>;
  font: {
    families: Record<string, string>;
    weights: Record<string, number>;
    variants: Record<
      string,
      { family: string; weight: string; size: number; lineHeight: number; letterSpacing: number }
    >;
  };
  size: Record<string, number>;
  breakpoints: Record<string, number>;
};

export function createTokenUtils<T extends TokenManifest>(tokens: T) {
  return {
    makeColor(tokenName: keyof T["color"] & string, options?: { opacity?: number }): string {
      const opacity = options?.opacity ?? 1;
      if (opacity === 1) return `var(--${tokens.prefix}-color-${tokenName})`;
      return `color-mix(in oklch, var(--${tokens.prefix}-color-${tokenName}), transparent ${(1 - opacity) * 100}%)`;
    },

    makeSpace(px: T["space"][number], options?: { unit?: "px" | "rem" }): string {
      const unit = options?.unit ?? "rem";
      return `var(--${tokens.prefix}-space-${px}-${unit})`;
    },

    makeSize(variant: keyof T["size"] & string, options?: { unit?: "px" | "rem" }): string {
      const unit = options?.unit ?? "rem";
      return `var(--${tokens.prefix}-size-${variant}-${unit})`;
    },

    makeCustom(tokenName: keyof T["custom"] & string): string {
      return `var(--${tokens.prefix}-custom-${tokenName})`;
    },

    makeFontFamily(familyName: keyof T["font"]["families"] & string): string {
      return `var(--${tokens.prefix}-font-family-${familyName})`;
    },

    makeFontWeight(weightName: keyof T["font"]["weights"] & string): string {
      return `var(--${tokens.prefix}-font-weight-${weightName})`;
    },

    makeFontVariant(variantName: keyof T["font"]["variants"] & string): string {
      const v = tokens.font.variants[variantName];
      return [
        `font-family: var(--${tokens.prefix}-font-family-${v.family})`,
        `font-weight: var(--${tokens.prefix}-font-weight-${v.weight})`,
        `font-size: ${v.size}rem`,
        `line-height: ${v.lineHeight}`,
        `letter-spacing: ${v.letterSpacing}em`
      ].join(";\n  ");
    },

    makeResponsive(params: {
      from?: keyof T["breakpoints"] & string;
      to?: keyof T["breakpoints"] & string;
    }): string {
      const from = params.from ? `${tokens.breakpoints[params.from]}px` : undefined;
      const to = params.to ? `calc(${tokens.breakpoints[params.to]}px - 1px)` : undefined;
      if (from && to) return `@media (min-width: ${from}) and (max-width: ${to})`;
      if (from) return `@media (min-width: ${from})`;
      if (to) return `@media (max-width: ${to})`;
      throw new Error("makeResponsive requires at least one of 'from' or 'to'");
    },

    makeRem(px: number): string {
      return `${px / 16}rem`;
    },

    makePx(val: number): string {
      return `${val}px`;
    }
  };
}
```

Note: `makeResponsive` bug (double `@media`) is fixed here since it's written as real TypeScript.

### Consumer setup — generated once by `buttery init`

The CLI generates `src/tokens.ts` on first run and never overwrites it. This file is committed to source control and imported throughout the project:

```ts
// src/tokens.ts  ← generated by `buttery init`, committed, never regenerated
import { createTokenUtils } from "@buttery/core";
import { tokens } from "../.buttery/_generated/_tokens.js";

export const {
  makeColor,
  makeSpace,
  makeSize,
  makeCustom,
  makeFontFamily,
  makeFontWeight,
  makeFontVariant,
  makeResponsive,
  makeRem,
  makePx
} = createTokenUtils(tokens);

// Named type exports for component props
export type ColorToken = Parameters<typeof makeColor>[0];
export type SpaceValue = Parameters<typeof makeSpace>[0];
export type SizeVariant = Parameters<typeof makeSize>[0];
export type CustomToken = Parameters<typeof makeCustom>[0];
export type FontVariant = Parameters<typeof makeFontVariant>[0];
export type Breakpoint = NonNullable<Parameters<typeof makeResponsive>[0]["from"]>;
```

Imports throughout the project use a path alias — the CLI configures this automatically in `tsconfig.json` and the relevant bundler config:

```ts
import { makeColor, makeSpace } from "@tokens";
import type { ColorToken, SpaceValue } from "@tokens";
```

Component props:

```ts
type ButtonProps = {
  color: ColorToken; // "primary" | "primary-500" | "neutral" | ...
  padding: SpaceValue; // 4 | 8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40
};
```

When you add a new color and run `buttery build`, `_tokens.ts` updates and `ColorToken` automatically includes the new value. `src/tokens.ts` never changes.

### `Template` base class after refactor

**File:** `packages/core/src/templates/Template.ts`

`makeUtilTS()` and `makeUtilSCSS()` are removed. The class owns two concerns:

```ts
export abstract class Template {
  // Contributes this utility's data to the central _tokens.ts manifest
  abstract makeTokens(): Record<string, unknown>;

  // Generates CSS custom property strings for :root
  abstract makeCSSProperties(): string[];
}
```

No `functionTemplatePath`. No file copying. The utility implementations live permanently in `@buttery/core`.

### `ButteryTokens.build()` after refactor

**File:** `packages/core/src/ButteryTokens.ts`

```ts
// 1. Collect token data from all templates
const manifest: Record<string, unknown> = {
  prefix: config.config.runtime.prefix
};
for (const template of templates) {
  Object.assign(manifest, template.makeTokens());
}

// 2. Write _tokens.ts — the only generated TS file
const manifestContent =
  `// auto-generated by buttery-tokens — do not edit\n` +
  `export const tokens = ${JSON.stringify(manifest, null, 2)} as const;\n`;
await writeFileRecursive(path.resolve(config.dirs.generated, "_tokens.ts"), manifestContent);

// 3. Collect CSS properties and write root.css (unchanged)
```

The barrel `index.ts` and per-utility `.ts` files are gone. `_tokens.ts` is the entire TypeScript output.

### Adding a new utility after this refactor

1. Add the function to `createTokenUtils` in `@buttery/core` — real TypeScript
2. Implement `makeTokens()` on the template class — returns the data slice
3. Implement `makeCSSProperties()` on the template class — returns CSS var strings
4. Register the template in `ButteryTokens.build()`
5. Add the export to `src/tokens.ts` (or re-run `buttery init` to regenerate it)

### Migration steps for existing templates

Each existing subclass needs:

- `makeUtilTS()` removed
- `makeUtilSCSS()` removed
- `makeTokens()` added — extract whatever data was being inlined as strings
- The function body moved to `createTokenUtils` in `@buttery/core`

The `function-templates/` directory concept is dropped — it is not needed.

---

## Priority 1 — Bug Fixes (Do First)

These are silent failures that affect the studio's own dogfood config today.

### 1.1 `TemplateMakeCustom` — wrong CSS property value for `number` and `string` types

**File:** `packages/core/src/templates/Template.make-custom.ts`

**Problem:** In `makeCSSProperties()`, the `number` and `string` cases return `${customTokenValue}` which serializes the whole object instead of `.value`.

```ts
// Current (broken)
case "number":
case "string":
  return `${property}: ${customTokenValue}`;

// Fixed
case "number":
case "string":
  return `${property}: ${customTokenValue.value}`;
```

### 1.2 Neutral color conversion produces wrong HSL/RGB values

**File:** `packages/core/src/utils/util.color-conversions.ts`

**Problem:** The studio's `root.css` shows `--studio-color-background: #fff` with `--studio-color-background-rgb: 0, 15, 255` — clearly wrong. `#fff` should be `rgb(255, 255, 255)`. The hex-to-rgb and hex-to-hsl conversion functions have a bug that surfaces with certain hex values.

**Fix:** Audit `hexToRgb` and `hexToHsl` in `util.color-conversions.ts`. Add unit tests for edge cases (`#fff`, `#000`, `#ffffff`, shorthand hex).

### 1.3 Studio dogfood config — font variants reference non-existent family tokens

**File:** `packages/studio-tokens/.buttery/config.json`

**Problem:** Font variants (`logo`, `heading`, `body`, `code`) use `familyToken` values (`"logo"`, `"heading"`, `"body"`, `"code"`) that don't exist in `families`. The actual family keys are `"Poppins"`, `"Inter"`, `"Mulish"`, `"Consolas"`. The Zod `superRefine` cross-validation catches this but the config was never corrected.

**Fix:** Remap variants to valid family tokens. Define semantic role → family mapping explicitly in the config:

```json
"variants": {
  "logo":    { "familyToken": "Poppins",  "weight": "bold-700",    "size": 24, "lineHeight": 1.2 },
  "heading": { "familyToken": "Poppins",  "weight": "semiBold-600","size": 18, "lineHeight": 1.3 },
  "body":    { "familyToken": "Mulish",   "weight": "regular-400", "size": 14, "lineHeight": 1.5 },
  "body-sm": { "familyToken": "Mulish",   "weight": "regular-400", "size": 12, "lineHeight": 1.5 },
  "label":   { "familyToken": "Mulish",   "weight": "medium-500",  "size": 12, "lineHeight": 1.4 },
  "code":    { "familyToken": "Consolas", "weight": "regular-400", "size": 13, "lineHeight": 1.6 }
}
```

---

## Priority 2 — `makeFontVariant` (Highest Impact Gap)

The font variant is the utility that ties the entire typography system together. The schema is defined, the studio UI exists, and production apps are currently hand-composing four CSS properties per component instead of using a single typed call.

### 2.1 Schema changes

**File:** `packages/core/src/schemas/schema.font.ts`

Add `letterSpacing` to `FontVariantValueSchema` (optional, defaults to `normal`):

```ts
const FontVariantValueSchema = z.object({
  familyToken: z.string(),
  weight: z.string(),
  size: z.number(),
  lineHeight: z.number(),
  letterSpacing: z.number().optional().default(0) // in em units
});
```

Normalize family token names to kebab-case via Zod transform so `"Poppins"` → `"poppins"` and `"My Brand Font"` → `"my-brand-font"`. This fixes the awkward `makeFontWeight("Poppins-bold")` API. Apply the transform in `FontFamiliesManualSchema`:

```ts
const familyTokenKey = z.string().transform(s =>
  s.toLowerCase().replace(/\s+/g, '-')
);
const FontFamiliesManualSchema = z.record(familyTokenKey, z.object({ ... }));
```

**Breaking change:** All existing configs using capitalized family names will need token names updated. Worth doing now before user base grows.

Remove Google/Adobe font source stubs. They silently produce no CSS output which is a worse failure than an honest error. Either:

- Delete them from the schema entirely (cleanest)
- Replace with a `z.never()` + descriptive error: `"google and adobe sources are not yet supported"`

### 2.2 New Template: `TemplateMakeFontVariant`

**File:** `packages/core/src/templates/Template.make-font-variant.ts` (new)

**Generated TypeScript utility:**

```ts
export type FontVariant = "logo" | "heading" | "body" | "code"; // derived from config

export function makeFontVariant(variantName: FontVariant): string {
  return `
    font-family: var(--prefix-font-family-${variantFamilyLookup[variantName]});
    font-weight: var(--prefix-font-weight-${variantWeightLookup[variantName]});
    font-size: ${variantSizeLookup[variantName]}rem;
    line-height: ${variantLineHeightLookup[variantName]};
    letter-spacing: ${variantLetterSpacingLookup[variantName]}em;
  `.trim();
}
```

`makeFontVariant` returns a **multi-line CSS string** designed to be interpolated directly in a `css` template literal:

```ts
// Linaria / Goober usage
const heading = css`
  ${makeFontVariant("heading")}
  color: ${makeColor("primary-500")};
`;
```

**CSS properties added to `:root`:** None required. Font variants reference existing `font-family` and `font-weight` custom properties. Size and line-height are inline computed values since they don't need to be dynamically themeable at runtime.

### 2.3 Fix `makeFontBaseSize`

**File:** `packages/core/src/templates/Template.make-font-base-size.ts`

The current signature `makeFontBaseSize(value: number) => string` accepts an arbitrary number but there's only one base font size. This is confusing and unused in practice.

**Options (pick one):**

- **Remove it** — `baseFontSize` is an internal config value used by `makeRem` and `makeSpace`. Consumers don't need to call it.
- **Change to zero-argument** — `makeFontBaseSize(): string` returns the value for setting on `html { font-size: ... }`.

Recommendation: remove it from the generated utilities. If a consumer needs to set `html { font-size: 16px }`, they write that directly — there's no value in a token for it.

### 2.4 Register template in `ButteryTokens.build()`

**File:** `packages/core/src/ButteryTokens.ts`

```ts
const templates = [
  new TemplateMakeColor(config),
  new TemplateMakeCustom(config),
  new TemplateMakeFontFamily(config),
  new TemplateMakeFontWeight(config),
  new TemplateMakeFontVariant(config), // ADD
  new TemplateMakePx(config),
  new TemplateMakeRem(config),
  new TemplateMakeReset(config),
  new TemplateMakeResponsive(config)
];
```

Remove `TemplateMakeFontBaseSize` from this list.

---

## Priority 3 — `makeSpace` and `makeSize`

### 3.1 The `makeSpace` design

**Key insight from design review:** Designers work in pixel values in Figma. Semantic spacing token names (`makeSpace("xl")`) add a lookup step with no benefit. The API should accept pixel values directly, validate against the baseline grid, and output rem.

**Schema change:** `SpaceManualSchema` currently uses `z.record(z.string(), z.number())`. Change `variants` to `z.number().array()` so both modes use pixel values as the API surface:

```ts
// Before
export const SpaceManualSchema = z.object({
  mode: z.literal("manual"),
  variants: z.record(z.string(), z.number())
});

// After
export const SpaceManualSchema = z.object({
  mode: z.literal("manual"),
  variants: z.number().array()
  // e.g. [4, 6, 10, 16, 24, 40] — arbitrary but intentional values
});
```

**Breaking change:** Existing manual space configs using named keys will need to be updated.

### 3.2 New Template: `TemplateMakeSpace`

**File:** `packages/core/src/templates/Template.make-space.ts` (new, replaces commented-out `_template.makeSpace.ts`)

**Generated TypeScript utility (auto mode, baselineGrid: 4, variants: 10):**

```ts
// Auto-generated union from baselineGrid × N steps
export type SpaceValue = 4 | 8 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40;

export function makeSpace(px: SpaceValue, options?: { unit?: "px" | "rem" }): string {
  const unit = options?.unit ?? "rem";
  return `var(--prefix-space-${px}-${unit})`;
}
```

**CSS properties in `:root`:** Both px and rem variants per step:

```css
--prefix-space-4-px: 4px;
--prefix-space-4-rem: 0.25rem;
--prefix-space-8-px: 8px;
--prefix-space-8-rem: 0.5rem;
/* ... */
```

**Strict mode integration:** In `strict: true`, the TypeScript type itself prevents invalid values at compile time. In `strict: false`, the union is widened to `number` and a runtime warning is emitted if the value is not a grid multiple.

**Usage:**

```ts
const card = css`
  padding: ${makeSpace(16)}; // → var(--prefix-space-16-rem)
  border-radius: ${makeSpace(4, { unit: "px" })}; // → var(--prefix-space-4-px)
  gap: ${makeSpace(24)};
`;
```

### 3.3 New Template: `TemplateMakeSize`

**File:** `packages/core/src/templates/Template.make-size.ts` (new, replaces commented-out `_template.makeSize.ts`)

`makeSize` is distinct from `makeSpace` — it's for named element heights (buttons, inputs, rows) that establish vertical rhythm, not for layout gaps and padding.

**Generated TypeScript utility:**

```ts
// From config: size.variants: { dense: 24, normal: 32, big: 44 }
export type SizeVariant = "dense" | "normal" | "big";

export function makeSize(variant: SizeVariant, options?: { unit?: "px" | "rem" }): string {
  const unit = options?.unit ?? "rem";
  return `var(--prefix-size-${variant}-${unit})`;
}
```

**CSS properties:**

```css
--prefix-size-dense-px: 24px;
--prefix-size-dense-rem: 1.5rem;
--prefix-size-normal-px: 32px;
--prefix-size-normal-rem: 2rem;
--prefix-size-big-px: 44px;
--prefix-size-big-rem: 2.75rem;
```

Size variants are defined by name intentionally — unlike spacing (where the pixel value is the name), element sizes are semantic and map to human concepts (dense UI, normal UI, comfortable UI).

---

## Priority 4 — Color System Migration to oklch

This is a larger refactor but the motivation is clear: **HSB is not perceptually uniform.** The 200+ lines of `z.literal()` in `schema.color.ts` are compensating for this by hand — different saturation/brightness ranges per vibe because the same HSB values look different at different hues.

oklch (`oklch(L C H)`) is perceptually uniform by design. The `L` channel corresponds to actual perceived brightness across all hues. This makes the vibe system scientifically grounded instead of hand-tuned.

### 4.1 Schema changes

**File:** `packages/core/src/schemas/schema.color.ts`

Replace the `z.literal()` union chains with `z.number().min().max()` backed by oklch L/C ranges. The vibe presets become a constant lookup table in the schema utilities:

```ts
export const vibePresets = {
  jewel: { minL: 0.4, maxL: 0.55, minC: 0.14, maxC: 0.22 },
  pastel: { minL: 0.8, maxL: 0.92, minC: 0.04, maxC: 0.1 },
  earth: { minL: 0.4, maxL: 0.65, minC: 0.05, maxC: 0.1 },
  neutral: { minL: 0.5, maxL: 0.9, minC: 0.0, maxC: 0.02 },
  fluorescent: { minL: 0.75, maxL: 0.9, minC: 0.18, maxC: 0.28 }
} as const;
```

Each vibe schema becomes:

```ts
export const ColorBrandTypeEarthSchema = z.object({
  type: z.literal("earth"),
  colors: ColorDefHueSchema,
  lightness: z.number().min(vibePresets.earth.minL).max(vibePresets.earth.maxL),
  chroma: z.number().min(vibePresets.earth.minC).max(vibePresets.earth.maxC)
});
```

`saturation` and `brightness` are replaced by `lightness` (oklch L, 0–1) and `chroma` (oklch C, 0–0.4). These are more intuitive names that map to what designers actually mean.

**Breaking change:** Existing auto-mode color configs using `saturation`/`brightness` need migration. Provide a migration utility that converts HSB→oklch ranges.

### 4.2 Unify brand and neutral colors

**Key insight:** In oklch, "neutral" is just a color with C ≈ 0. A warm gray is `oklch(0.75 0.02 60)`. A cool gray is `oklch(0.75 0.02 220)`. A true neutral is `oklch(0.75 0 0)`. The brand/neutral split in the current schema is an artifact of HSB's behavior at low saturation (where hue becomes meaningless), not a conceptual distinction.

**New unified color model:**

```ts
// All colors live under config.color.colors — no brand/neutral split
export const ColorSchema = z.object({
  colors: z.record(z.string(), ColorEntrySchema),
  vibe: ColorBrandTypeAutoSchema.optional() // vibe applies to hue-based entries
});
```

Each color entry is either hue-based (participates in vibe constraints) or hex-based (fixed value):

```ts
// Hue-based: derives color from vibe's L and C + user-specified H
{ hue: 220, variants: 10 }

// Fixed: exact hex, auto-generates scale via oklch
{ hex: "#2651ac", variants: 10 }
```

Neutral colors become hue-based entries with a low chroma — or just hex-based for fixed grays. The consumer labels them "neutral" by naming them `neutral-*`, not by putting them in a separate config section.

**Migration:** The `neutral` key in existing configs maps to `colors` entries. Provide a config migration utility.

### 4.3 CSS output changes

**Before (current):**

```css
--prefix-color-primary-500: #dab224;
--prefix-color-primary-500-hex: #dab224;
--prefix-color-primary-500-hsl: 47, 72, 50;
--prefix-color-primary-500-rgb: 218, 178, 36;
```

**After (oklch):**

```css
--prefix-color-primary-500: oklch(0.58 0.14 80);
```

One property per color variant instead of four. The browser resolves oklch natively (93%+ support as of 2026).

### 4.4 `makeColor` utility change

**Before:**

```ts
return `rgba(var(--prefix-color-${tokenName}-rgb), ${opacity})`;
```

**After:**

```ts
if (opacity === 1) {
  return `var(--prefix-color-${tokenName})`;
}
return `color-mix(in oklch, var(--prefix-color-${tokenName}), transparent ${(1 - opacity) * 100}%)`;
```

`color-mix()` in oklch space produces perceptually correct transparency without muddy midpoints. No more RGB decomposition.

**Breaking change:** Consumers using the `-rgb`, `-hsl`, or `-hex` CSS variable variants directly (outside of `makeColor`) will need to migrate. The `makeColor` function API is unchanged.

### 4.5 Color scale generation

**File:** `packages/core/src/utils/util.color-variants.ts`

Replace chroma.js `mode("lab")` scale with `mode("oklch")`:

```ts
const scale = chroma.scale([lightest, baseHex, darkest]).mode("oklch");
```

chroma.js already supports oklch. The scale will be perceptually smoother — equal visual steps between each variant instead of the uneven gradients that HSB/Lab produce.

### 4.6 Studio UI changes for color

Once the schema is simplified, the studio UI simplifies proportionally:

- **Drop `auto-named` variant type** from the swatch UI — reduce to two: auto (count) and manual (key-value).
- **Category selection leads** — don't start the auto flow with a color picker. Start with vibe selection; the "pick a color to detect category" becomes a secondary helper.
- **Unify brand/neutral UI** — once the schema merges them, the two-section color UI becomes one unified color list.
- **Sliders use `lightness`/`chroma` labels** instead of `saturation`/`brightness` — maps directly to oklch terminology.

---

## Priority 5 — Studio Dogfood Config Completion

After Priorities 2–4 are done, the studio's own token config should be fully specced to demonstrate all utilities in production.

**File:** `packages/studio-tokens/.buttery/config.json`

### Target config state

**Colors:** Keep the current fluorescent vibe for brand. Fix the neutral section — `#030305` for dark text and `#fff` for backgrounds are valid but the current key-value manual variants (`dark`/`light`) are barely distinguishable from the base. Replace with a proper neutral scale:

```json
"neutral": {
  "hex": "#64748b",
  "variants": 10
}
```

**Fonts:** After kebab-case normalization, family keys become `"poppins"`, `"inter"`, `"mulish"`, `"consolas"`. Fix variants to reference these normalized keys. Extend with proper sizes and line heights for the full studio type system.

**Spacing:** Add `space` config — `mode: "auto"`, `variants: 12`, `baselineGrid: 4`. Once `makeSpace` is built, migrate all `makeRem(N)` calls in studio components to `makeSpace(N)`.

**Sizes:** The studio config already has `size.variants: { dense: 24, normal: 32, big: 44 }`. Once `makeSize` is built, use it for all interactive element heights in the studio.

---

## Implementation Sequence

```
Phase 0 — Factory architecture (prerequisite for everything)
  ├── 0.1 @buttery/core: add TokenManifest type
  ├── 0.2 @buttery/core: implement createTokenUtils factory with all utility functions
  │       makeColor, makeSpace, makeSize, makeCustom, makeFontFamily,
  │       makeFontWeight, makeFontVariant, makeResponsive, makeRem, makePx
  │       (fixes makeResponsive double @media bug in the process)
  ├── 0.3 Refactor Template base class: remove makeUtilTS() + makeUtilSCSS(), add makeTokens()
  ├── 0.4 Refactor ButteryTokens.build(): collect makeTokens() slices, write single _tokens.ts
  ├── 0.5 Migrate existing template subclasses: remove makeUtilTS(), implement makeTokens()
  │       makeColor, makeCustom, makeFontFamily, makeFontWeight,
  │       makePx, makeRem, makeReset, makeResponsive
  ├── 0.6 Add buttery init command: generates src/tokens.ts with utils + named type exports
  └── 0.7 buttery init: configure @tokens path alias in tsconfig.json + bundler config

Phase 1 — Bug fixes (unblock dogfooding)
  ├── 1.1 Fix makeCustom CSS output: "number"/"string" types serialize object not .value
  ├── 1.2 Fix hexToRgb / hexToHsl for edge cases (#fff, #000, shorthand hex)
  └── 1.3 Fix studio config font variants to reference valid family tokens

Phase 2 — Complete the font system
  ├── 2.1 Schema: add optional letterSpacing to FontVariantValue
  ├── 2.2 Schema: normalize family token names to kebab-case via Zod transform
  ├── 2.3 Schema: remove Google/Adobe font source stubs
  ├── 2.4 Write function-templates/makeFontVariant.ts (real TypeScript)
  ├── 2.5 Template: TemplateMakeFontVariant — implement makeTokens() + makeCSSProperties()
  ├── 2.6 Remove TemplateMakeFontBaseSize
  └── 2.7 ButteryTokens.build(): register TemplateMakeFontVariant, deregister TemplateMakeFontBaseSize

Phase 3 — Complete the spacing system
  ├── 3.1 Schema: change SpaceManualSchema.variants to z.number().array()
  ├── 3.2 Write function-templates/makeSpace.ts (real TypeScript)
  ├── 3.3 Template: TemplateMakeSpace — implement makeTokens() + makeCSSProperties()
  ├── 3.4 Write function-templates/makeSize.ts (real TypeScript)
  ├── 3.5 Template: TemplateMakeSize — implement makeTokens() + makeCSSProperties()
  └── 3.6 ButteryTokens.build(): register both new templates

Phase 4 — oklch color migration
  ├── 4.1 Schema: replace z.literal() chains with z.number().min().max() + oklch L/C ranges
  ├── 4.2 Schema: unify brand/neutral into single color model
  ├── 4.3 Utils: update color scale generation to chroma.js oklch mode
  ├── 4.4 Update function-templates/makeColor.ts: oklch vars + color-mix opacity
  ├── 4.5 Studio UI: simplify color components (drop auto-named, unify brand/neutral)
  └── 4.6 Provide config migration utility (HSB saturation/brightness → oklch L/C)

Phase 5 — Studio dogfood completion
  ├── 5.1 Update studio config: fix font variants, normalize family token names
  ├── 5.2 Update studio config: replace broken neutral colors with proper scale
  ├── 5.3 Update studio config: add space config once makeSpace is built
  └── 5.4 Migrate studio components: makeRem → makeSpace, add makeFontVariant usage
```

---

## Breaking Changes Summary

| Change                                                  | Migration Path                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| Font family token names → kebab-case                    | `makeFontWeight("Poppins-bold")` → `makeFontWeight("poppins-bold")` |
| Remove Google/Adobe font sources                        | Remove from config; re-add when properly implemented                |
| `SpaceManualSchema.variants` → number array             | `{ "sm": 8, "md": 16 }` → `[8, 16]`                                 |
| Color: `saturation`/`brightness` → `lightness`/`chroma` | Run provided migration utility                                      |
| Color: brand/neutral unified                            | Move `neutral` keys into `colors`                                   |
| Color CSS vars: 4 per color → 1 per color               | Replace any direct `-rgb`/`-hsl`/`-hex` CSS var usage               |
| Remove `makeFontBaseSize`                               | Delete usage; set base font size directly in CSS                    |

All breaking changes are isolated to config JSON and CSS variable references. The TypeScript utility function signatures (`makeColor`, `makeCustom`, `makeFontFamily`, `makeResponsive`) are unchanged.

---

## What Does Not Change

- The core architecture: config → build → CSS custom properties in `:root` + TypeScript utility functions
- `makeCustom` — model is solid, no changes needed
- `makeRem` — keep as a general pixel→rem converter; it coexists with `makeSpace`
- `makePx` — unchanged
- `makeResponsive` — unchanged
- `makeReset` — unchanged
- The `ButteryTokens` class API — `build()`, `dev()`, `getConfig()`
- The CSS-in-JS mechanism being consumer's choice — utilities are pure string functions

---

## Notes on Package Structure

No new packages are needed in the near term. The current four-package structure (cli, core, studio, studio-tokens) is correct. The only package that would make sense as a future split is a standalone `@buttery/color` that exposes the oklch-based color scale utilities independently — but that's only worth extracting once the oklch migration is complete and there's evidence of demand for the color utilities outside of buttery-tokens itself.
