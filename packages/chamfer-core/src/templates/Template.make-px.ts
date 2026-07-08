import { defineTemplate } from "./types.js";

function makePxUtil<T>(_tokens: T) {
  return {
    makePx(val: number): string {
      return `${val}px`;
    }
  };
}

export const pxTemplate = defineTemplate({
  name: "makePx",
  namespace: "length",
  description: "Provides a utility for appending 'px' to a numeric value.",
  tokens(_config) {
    return {};
  },
  cssProperties(_config) {
    return [];
  },
  util: makePxUtil
});
