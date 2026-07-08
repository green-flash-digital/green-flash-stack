import { defineTemplate } from "./types.js";

function makeRemUtil<T extends { baseFontSize: number }>(tokens: T) {
  return {
    makeRem(px: number): string {
      return `${px / tokens.baseFontSize}rem`;
    }
  };
}

export const remTemplate = defineTemplate({
  name: "makeRem",
  namespace: "length",
  description:
    "Provides a utility for converting pixel values to rem units based on the configured base font size.",
  tokens(config) {
    return { baseFontSize: config.config.sizeAndSpace.baseFontSize };
  },
  cssProperties(_config) {
    return [];
  },
  util: makeRemUtil
});
