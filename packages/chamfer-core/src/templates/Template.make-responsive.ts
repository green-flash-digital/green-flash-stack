import { createCSSProperty } from "../utils/index.js";
import { defineTemplate } from "./types.js";

function makeResponsiveUtil<T extends { breakpoints: Record<string, number> }>(tokens: T) {
  return {
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
    }
  };
}

export const responsiveTemplate = defineTemplate({
  name: "makeResponsive",
  namespace: "breakpoint",
  description: "Generates breakpoint tokens for use in media query helpers.",
  tokens(config) {
    return { breakpoints: config.config.response.breakpoints };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    return Object.entries(config.config.response.breakpoints).map(
      ([name, value]) => `${createCSSProperty(prefix, "breakpoint", name)}: ${value}px`
    );
  },
  util: makeResponsiveUtil
});
