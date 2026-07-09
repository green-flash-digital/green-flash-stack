/**
 * Regression check for the `Chamfer.build()` output pipeline's type
 * narrowing, not the template functions in isolation. `.chamfer/config.ts`
 * is a real (if minimal) project config that deliberately exercises every
 * shape each schema section accepts — not just one happy path per
 * section — so a narrowing regression specific to one input shape (e.g.
 * hex + manual key-value color variants) doesn't slip through just because
 * a different shape (e.g. hue + auto variant count) still works.
 *
 * `yarn test` runs the actual `Chamfer.build()` against that config (same
 * code path any real project's `chamfer build` runs), producing real
 * `_generated/_tokens.ts` / `_generated/makeUtils.ts` files, then this file
 * imports from that real output — exactly what an app consuming
 * `@chamfer-css/studio-tokens` does.
 *
 * Covers every built-in template plus a custom (user-provided) one, so a
 * regression specific to any single template doesn't slip through either.
 *
 * This file is never executed — it only needs to *compile*. Each
 * `@ts-expect-error` asserts a real error occurs on that line; if narrowing
 * regresses to `string`/`number`/`{}`, that line stops erroring and tsc
 * reports "Unused '@ts-expect-error' directive" instead, failing the build.
 *
 * Run via `yarn test` (regenerates the fixture output, then plain `tsc`
 * against this file — no test runner involved).
 */
import {
  makeBorder,
  makeColor,
  makeCustom,
  makeFontFamily,
  makeFontVariant,
  makeFontWeight,
  makeLightDark,
  makePx,
  makeRem,
  makeReset,
  makeResponsive,
  makeSemanticColor,
  makeSize,
  makeSpace
} from "./.chamfer/index.js";

function checkMakeColor() {
  // hue + auto numeric variant count
  makeColor("primary");
  makeColor("primary-100");
  makeColor("secondary-200");
  // hue + auto-named variants (the array length picks the count; the
  // element strings aren't used as key names, so this produces the same
  // "50"/"100"/"200" shape as the numeric case above)
  makeColor("tertiary");
  makeColor("tertiary-100");
  // bare hex, no variants at all — only the base key exists
  makeColor("background");
  makeColor("surface");
  // hex + auto numeric variant count
  makeColor("accent");
  makeColor("accent-200");
  // hex + manual key-value variants (real custom names)
  makeColor("neutral-dark");
  makeColor("neutral-light");
  makeColor("info-subtle");
  makeColor("info-strong");
  // @ts-expect-error - "not-a-real-color-xyz" isn't one of this fixture's real color keys
  makeColor("not-a-real-color-xyz");
  // @ts-expect-error - "background-50" doesn't exist — background has no variants
  makeColor("background-50");
  // @ts-expect-error - "tertiary-light" isn't a real key — auto-named variants use numeric suffixes, not the given names
  makeColor("tertiary-light");
}

function checkMakeLightDark() {
  makeLightDark("primary", "secondary");
  makeLightDark(["primary", { opacity: 0.5 }], "neutral-dark");
  makeLightDark("info-subtle", "info-strong");
  // @ts-expect-error - "bogus" isn't one of this fixture's real color keys
  makeLightDark("bogus", "secondary");
}

function checkMakeSemanticColor() {
  makeSemanticColor("interactive");
  makeSemanticColor("surface");
  // @ts-expect-error - "bogus-role" isn't one of this fixture's real semantic roles
  makeSemanticColor("bogus-role");
}

function checkMakeCustom() {
  // all three CustomVariantSchema branches (rem / string / number) reduce
  // to the same `Record<string, string>` manifest shape, so they all just
  // narrow on key name — still worth covering as distinct real input shapes
  makeCustom("brand-radius");
  makeCustom("brand-name");
  makeCustom("z-index-modal");
  // @ts-expect-error - "not-a-real-token" isn't one of this fixture's real custom tokens
  makeCustom("not-a-real-token");
}

function checkMakeFontFamily() {
  makeFontFamily("body");
  makeFontFamily("mono");
  // @ts-expect-error - "comic-sans" isn't one of this fixture's real font families
  makeFontFamily("comic-sans");
}

function checkMakeFontWeight() {
  makeFontWeight("body-bold");
  makeFontWeight("body-regular");
  makeFontWeight("mono-regular");
  // @ts-expect-error - "body-ultrabold" isn't one of this fixture's real font weights
  makeFontWeight("body-ultrabold");
  // @ts-expect-error - "mono-bold" isn't real — Mono only declares a regular-400 style
  makeFontWeight("mono-bold");
}

function checkMakeFontVariant() {
  makeFontVariant("heading");
  makeFontVariant("code");
  // @ts-expect-error - "caption" isn't one of this fixture's real font variants
  makeFontVariant("caption");
}

function checkMakeSpace() {
  makeSpace(4);
  makeSpace(16);
  makeSpace(44);
  // @ts-expect-error - 999999 isn't one of this fixture's real space steps
  makeSpace(999999);
}

function checkMakeSize() {
  makeSize("dense");
  makeSize("normal", { unit: "px" });
  makeSize("big");
  // @ts-expect-error - "extra-large" isn't one of this fixture's real size variants
  makeSize("extra-large");
}

function checkMakePxAndMakeRem() {
  makePx(12);
  makeRem(24);
  // @ts-expect-error - a string isn't a valid pixel value
  makePx("12");
}

function checkMakeReset() {
  makeReset("button");
  makeReset("anchor");
  // @ts-expect-error - "table" isn't one of makeReset's supported elements
  makeReset("table");
}

function checkMakeResponsive() {
  makeResponsive({ from: "tablet" });
  makeResponsive({ from: "mobile", to: "desktop" });
  // @ts-expect-error - "ultrawide" isn't one of this fixture's real breakpoints
  makeResponsive({ from: "ultrawide" });
}

function checkMakeBorder() {
  // fixture's custom (user-provided) template
  makeBorder("sm");
  makeBorder("md");
  // @ts-expect-error - "xl" isn't one of this fixture's real border radius keys
  makeBorder("xl");
}

// Referenced so `noUnusedLocals` doesn't flag these compile-time-only checks.
void checkMakeColor;
void checkMakeLightDark;
void checkMakeSemanticColor;
void checkMakeCustom;
void checkMakeFontFamily;
void checkMakeFontWeight;
void checkMakeFontVariant;
void checkMakeSpace;
void checkMakeSize;
void checkMakePxAndMakeRem;
void checkMakeReset;
void checkMakeResponsive;
void checkMakeBorder;
