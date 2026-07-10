import type { ChamferConfig } from "@chamfer-css/core/schemas";
import { describe, expect, it } from "vitest";

import { getTokensFromState, initStudioState } from "../studio.state";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const BASE: ChamferConfig = {
  runtime: { prefix: "test", strict: true, suppressStrictWarnings: false },
  color: {
    vibe: { type: "jewel", lightness: 0.55, chroma: 0.18 },
    colors: {
      primary: { hue: 220, variants: 10 },
      accent: { hex: "#ff6b6b", variants: 5 }
    }
  },
  font: {
    source: "manual",
    families: {
      Inter: { family: "Inter", fallback: "sans-serif", styles: ["regular-400", "bold-700"] }
    },
    variants: {
      body: { familyToken: "inter", weight: "400", size: 16, lineHeight: 1.5, letterSpacing: 0 },
      heading: {
        familyToken: "inter",
        weight: "700",
        size: 32,
        lineHeight: 1.2,
        letterSpacing: -0.5
      }
    }
  },
  sizeAndSpace: {
    baseFontSize: 16,
    baselineGrid: 4,
    size: { variants: { xs: 24, sm: 32, md: 44, lg: 56 } },
    space: { mode: "auto", variants: 10 }
  },
  response: {
    breakpoints: { mobile: 480, tablet: 768, desktop: 1280 }
  },
  custom: {
    "header-height": { type: "rem", value: 52, description: "Header height" },
    "grid-columns": { type: "number", value: 12, description: "Grid column count" }
  },
  semantic: {
    interactive: { light: "primary-600", dark: "primary-400" },
    surface: { light: "accent", dark: "accent-3" }
  }
};

const MANUAL_SPACE: ChamferConfig = {
  ...BASE,
  sizeAndSpace: {
    ...BASE.sizeAndSpace,
    space: { mode: "manual", variants: [4, 8, 16, 24, 32] }
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function roundTrip(config: ChamferConfig): ChamferConfig {
  return getTokensFromState(initStudioState(config));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("initStudioState → getTokensFromState round-trip", () => {
  describe("runtime", () => {
    it("preserves prefix, strict, suppressStrictWarnings", () => {
      expect(roundTrip(BASE).runtime).toEqual(BASE.runtime);
    });
  });

  describe("color", () => {
    it("preserves vibe", () => {
      expect(roundTrip(BASE).color.vibe).toEqual(BASE.color.vibe);
    });

    it("preserves hue-based color entries", () => {
      expect(roundTrip(BASE).color.colors.primary).toEqual({ hue: 220, variants: 10 });
    });

    it("preserves hex-based color entries", () => {
      expect(roundTrip(BASE).color.colors.accent).toEqual({ hex: "#ff6b6b", variants: 5 });
    });

    it("preserves all color names", () => {
      const colors = roundTrip(BASE).color.colors;
      expect(Object.keys(colors).sort()).toEqual(["accent", "primary"]);
    });
  });

  describe("font", () => {
    it("preserves font source", () => {
      expect(roundTrip(BASE).font.source).toBe("manual");
    });

    it("preserves family definition", () => {
      expect(roundTrip(BASE).font.families.Inter).toMatchObject({
        family: "Inter",
        styles: expect.arrayContaining(["regular-400", "bold-700"])
      });
    });

    it("preserves variant values", () => {
      const { body } = roundTrip(BASE).font.variants;
      expect(body).toEqual(BASE.font.variants.body);
    });

    it("preserves all variant names", () => {
      const names = Object.keys(roundTrip(BASE).font.variants).sort();
      expect(names).toEqual(["body", "heading"]);
    });
  });

  describe("sizeAndSpace", () => {
    it("preserves baseFontSize and baselineGrid", () => {
      const { baseFontSize, baselineGrid } = roundTrip(BASE).sizeAndSpace;
      expect(baseFontSize).toBe(16);
      expect(baselineGrid).toBe(4);
    });

    it("preserves size variant names and values", () => {
      const variants = roundTrip(BASE).sizeAndSpace.size.variants;
      expect(variants).toEqual({ xs: 24, sm: 32, md: 44, lg: 56 });
    });

    describe("auto space mode", () => {
      it("round-trips mode as auto", () => {
        expect(roundTrip(BASE).sizeAndSpace.space.mode).toBe("auto");
      });

      it("round-trips variant count", () => {
        const space = roundTrip(BASE).sizeAndSpace.space;
        expect(space.mode).toBe("auto");
        if (space.mode === "auto") {
          expect(space.variants).toBe(10);
        }
      });
    });

    describe("manual space mode", () => {
      it("round-trips mode as manual", () => {
        expect(roundTrip(MANUAL_SPACE).sizeAndSpace.space.mode).toBe("manual");
      });

      it("round-trips variant values in order", () => {
        const space = roundTrip(MANUAL_SPACE).sizeAndSpace.space;
        expect(space.mode).toBe("manual");
        if (space.mode === "manual") {
          expect(space.variants).toEqual([4, 8, 16, 24, 32]);
        }
      });
    });
  });

  describe("response", () => {
    it("preserves all breakpoint names", () => {
      const bps = roundTrip(BASE).response.breakpoints;
      expect(Object.keys(bps).sort()).toEqual(["desktop", "mobile", "tablet"]);
    });

    it("preserves breakpoint values", () => {
      const bps = roundTrip(BASE).response.breakpoints;
      expect(bps).toEqual({ mobile: 480, tablet: 768, desktop: 1280 });
    });
  });

  describe("custom", () => {
    it("preserves rem custom token", () => {
      expect(roundTrip(BASE).custom["header-height"]).toEqual({
        type: "rem",
        value: 52,
        description: "Header height"
      });
    });

    it("preserves number custom token", () => {
      expect(roundTrip(BASE).custom["grid-columns"]).toEqual({
        type: "number",
        value: 12,
        description: "Grid column count"
      });
    });

    it("preserves all custom token names", () => {
      const names = Object.keys(roundTrip(BASE).custom).sort();
      expect(names).toEqual(["grid-columns", "header-height"]);
    });
  });
});
