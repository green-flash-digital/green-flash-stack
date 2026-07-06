import { describe, expect, it } from "vitest";

import { makeLightDark } from "@keystone-css/studio-tokens";

// NOTE: makeLightDark currently accepts `string` at the TypeScript level — the
// generic precision is erased by defineTemplate when TUtil is inferred. Type
// safety for make function token names is tracked as a Phase 8 improvement
// (generator emitting typed wrappers). These tests verify runtime correctness.

const PREFIX = "studio";

describe("makeLightDark", () => {
  describe("token-name arguments", () => {
    it("produces a light-dark() value from two token names", () => {
      expect(makeLightDark("neutral-light", "neutral-dark")).toBe(
        `light-dark(var(--${PREFIX}-color-neutral-light), var(--${PREFIX}-color-neutral-dark))`
      );
    });

    it("works with variant tokens", () => {
      expect(makeLightDark("primary-400", "primary-700")).toBe(
        `light-dark(var(--${PREFIX}-color-primary-400), var(--${PREFIX}-color-primary-700))`
      );
    });

    it("works when both args are the same token", () => {
      expect(makeLightDark("secondary", "secondary")).toBe(
        `light-dark(var(--${PREFIX}-color-secondary), var(--${PREFIX}-color-secondary))`
      );
    });
  });

  describe("opacity tuple arguments", () => {
    it("applies opacity on the light arg via color-mix", () => {
      expect(makeLightDark(["neutral-light", { opacity: 0.9 }], "neutral-dark")).toBe(
        `light-dark(color-mix(in oklch, var(--${PREFIX}-color-neutral-light), transparent 10%), var(--${PREFIX}-color-neutral-dark))` // (1-0.9)*100 rounds to 10
      );
    });

    it("applies opacity on the dark arg via color-mix", () => {
      expect(makeLightDark("neutral-light", ["neutral-dark", { opacity: 0.6 }])).toBe(
        `light-dark(var(--${PREFIX}-color-neutral-light), color-mix(in oklch, var(--${PREFIX}-color-neutral-dark), transparent 40%))`
      );
    });

    it("applies opacity on both args", () => {
      expect(
        makeLightDark(["neutral-light", { opacity: 0.8 }], ["neutral-dark", { opacity: 0.8 }])
      ).toBe(
        `light-dark(color-mix(in oklch, var(--${PREFIX}-color-neutral-light), transparent 20%), color-mix(in oklch, var(--${PREFIX}-color-neutral-dark), transparent 20%))`
      );
    });

    it("computes opacity=1 as a plain var (no color-mix)", () => {
      expect(makeLightDark(["primary-500", { opacity: 1 }], "neutral-dark")).toBe(
        `light-dark(var(--${PREFIX}-color-primary-500), var(--${PREFIX}-color-neutral-dark))`
      );
    });
  });
});
