import { makeColorUtil } from "./Template.make-color.js";
import { defineTemplate } from "./types.js";

function makeLightDarkUtil<T extends { prefix: string; color: Record<string, string> }>(tokens: T) {
  const { makeColor } = makeColorUtil(tokens);
  type ColorToken = keyof T["color"] & string;
  type ColorArg = ColorToken | readonly [ColorToken, { opacity: number }];

  function resolveArg(arg: ColorArg): string {
    if (Array.isArray(arg)) {
      const [tokenName, { opacity }] = arg as [ColorToken, { opacity: number }];
      return makeColor(tokenName, { opacity });
    }
    return makeColor(arg as ColorToken);
  }

  return {
    makeLightDark(light: ColorArg, dark: ColorArg): string {
      return `light-dark(${resolveArg(light)}, ${resolveArg(dark)})`;
    }
  };
}

export const lightDarkTemplate = defineTemplate({
  name: "makeLightDark",
  namespace: "lightDark",
  description:
    "Generates a typed wrapper around CSS `light-dark()` for adaptive color tokens. Requires `color-scheme` on a containing element. Chrome 123+, Firefox 120+, Safari 17.5+.",
  tokens() {
    return {};
  },
  cssProperties() {
    return [];
  },
  util: makeLightDarkUtil
});
