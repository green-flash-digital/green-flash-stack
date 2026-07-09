/**
 * Regression test for the `Chamfer.build()` output pipeline's type
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
 * Run via `yarn test:types` (regenerates the fixture output first).
 */
import { describe, test } from "vitest";

import { makeBorder, makeColor, makeSpace } from "./fixtures/.chamfer/index.js";

describe("build output — built-in templates", () => {
  test("makeColor narrows to this project's real color keys", () => {
    makeColor("primary");
    makeColor("secondary");
    makeColor("neutral-dark");
    // @ts-expect-error - "not-a-real-color-xyz" isn't one of this fixture's real color keys
    makeColor("not-a-real-color-xyz");
  });

  test("makeSpace narrows to this project's real space steps", () => {
    makeSpace(4);
    makeSpace(16);
    // @ts-expect-error - 999999 isn't one of this fixture's real space steps
    makeSpace(999999);
  });
});

describe("build output — custom (user-provided) templates", () => {
  test("makeBorder (fixture's custom template) narrows to its real radius keys", () => {
    makeBorder("sm");
    makeBorder("md");
    // @ts-expect-error - "xl" isn't one of this fixture's real border radius keys
    makeBorder("xl");
  });
});
