import { defineTemplate } from "./types.js";

function makeResetUtil<T>(_tokens: T) {
  return {
    makeReset(element: "ul" | "button" | "body" | "anchor" | "input"): string {
      switch (element) {
        case "ul":
          return `
          margin: 0;
          padding: 0;

          li {
            margin: 0;
            padding: 0;
            list-style-type: none;
          }
        `;
        case "button":
          return `
          margin: 0;
          padding: 0;
          border: none;
          background: none;
        `;
        case "body":
          return `
          margin: 0;
          padding: 0;
        `;
        case "anchor":
          return `
          text-decoration: none;
          color: inherit;

          &:visited {
            color: inherit;
          }
        `;
        case "input":
          return `
          margin: 0;
          padding: 0;
          border: none;
          background: none;
          font: inherit;
          color: inherit;
          appearance: none;
          outline: none;
          box-sizing: border-box;
          width: inherit;

          &[type="number"]::-webkit-inner-spin-button,
          &[type="number"]::-webkit-outer-spin-button {
            appearance: none;
            margin: 0;
          }

          &[type="range"]::-ms-track {
            background: transparent;
            border-color: transparent;
            color: transparent;
          },
          &[type="range"]::-webkit-slider-thumb {
            appearance: none;
            -webkit-appearance: none;
          }
          &[type="range"]:focus {
            outline: none;
          }
        `;
        default: {
          const _exhaustive: never = element;
          throw new Error(`Unhandled reset element: ${_exhaustive}`);
        }
      }
    }
  };
}

export const resetTemplate = defineTemplate({
  name: "makeReset",
  namespace: "reset",
  description: "Provides CSS resets for common HTML elements.",
  tokens(_config) {
    return {};
  },
  cssProperties(_config) {
    return [];
  },
  util: makeResetUtil
});
