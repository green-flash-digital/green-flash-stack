/**
 * Regression check for the `Chamfer.build()` output pipeline's type
 * narrowing, not the template functions in isolation. `./fixtures/` is a
 * real (if minimal) project: `.chamfer/config.ts` defines tokens plus one
 * custom template, and `yarn generate:test-fixtures` runs the actual
 * `Chamfer.build()` against it (same code path any real project's `chamfer
 * build` runs), producing real `_generated/_tokens.ts` /
 * `_generated/makeUtils.ts` files. This file imports from that real output —
 * exactly what an app consuming `@chamfer-css/studio-tokens` does — so a
 * regression in how `defineTemplate`'s `util` preserves literal types would
 * fail here, not just in a hand-rolled fixture.
 *
 * Covers every built-in template plus a custom (user-provided) one, so a
 * regression specific to any single template doesn't slip through.
 *
 * This file is never executed — it only needs to *compile*. Each
 * `@ts-expect-error` asserts a real error occurs on that line; if narrowing
 * regresses to `string`/`number`/`{}`, that line stops erroring and tsc
 * reports "Unused '@ts-expect-error' directive" instead, failing the build.
 *
 * Run via `yarn test:types` (regenerates the fixture output, then plain
 * `tsc` against this file — no test runner involved).
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
  makeColor("primary");
  makeColor("secondary");
  makeColor("neutral-dark");
  // @ts-expect-error - "not-a-real-color-xyz" isn't one of this fixture's real color keys
  makeColor("not-a-real-color-xyz");
}

function checkMakeLightDark() {
  makeLightDark("primary", "secondary");
  makeLightDark(["primary", { opacity: 0.5 }], "neutral-dark");
  // @ts-expect-error - "bogus" isn't one of this fixture's real color keys
  makeLightDark("bogus", "secondary");
}

function checkMakeSemanticColor() {
  makeSemanticColor("interactive");
  // @ts-expect-error - "bogus-role" isn't one of this fixture's real semantic roles
  makeSemanticColor("bogus-role");
}

function checkMakeCustom() {
  makeCustom("brand-radius");
  // @ts-expect-error - "not-a-real-token" isn't one of this fixture's real custom tokens
  makeCustom("not-a-real-token");
}

function checkMakeFontFamily() {
  makeFontFamily("body");
  // @ts-expect-error - "comic-sans" isn't one of this fixture's real font families
  makeFontFamily("comic-sans");
}

function checkMakeFontWeight() {
  makeFontWeight("body-bold");
  makeFontWeight("body-regular");
  // @ts-expect-error - "body-ultrabold" isn't one of this fixture's real font weights
  makeFontWeight("body-ultrabold");
}

function checkMakeFontVariant() {
  makeFontVariant("heading");
  // @ts-expect-error - "caption" isn't one of this fixture's real font variants
  makeFontVariant("caption");
}

function checkMakeSpace() {
  makeSpace(4);
  makeSpace(16);
  // @ts-expect-error - 999999 isn't one of this fixture's real space steps
  makeSpace(999999);
}

function checkMakeSize() {
  makeSize("dense");
  makeSize("normal", { unit: "px" });
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
