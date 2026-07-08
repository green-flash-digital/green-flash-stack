import { colorTemplate } from "./templates/Template.make-color.js";
import { customTemplate } from "./templates/Template.make-custom.js";
import { fontFamilyTemplate } from "./templates/Template.make-font-family.js";
import { fontVariantTemplate } from "./templates/Template.make-font-variant.js";
import { fontWeightTemplate } from "./templates/Template.make-font-weight.js";
import { pxTemplate } from "./templates/Template.make-px.js";
import { remTemplate } from "./templates/Template.make-rem.js";
import { resetTemplate } from "./templates/Template.make-reset.js";
import { responsiveTemplate } from "./templates/Template.make-responsive.js";
import { sizeTemplate } from "./templates/Template.make-size.js";
import { spaceTemplate } from "./templates/Template.make-space.js";
import type { TokenManifest } from "./TokenManifest.js";

export type { TokenManifest };

export function createTokenUtils<T extends TokenManifest>(tokens: T) {
  return {
    ...colorTemplate.util(tokens),
    ...customTemplate.util(tokens),
    ...fontFamilyTemplate.util(tokens),
    ...fontWeightTemplate.util(tokens),
    ...fontVariantTemplate.util(tokens),
    ...spaceTemplate.util(tokens),
    ...sizeTemplate.util(tokens),
    ...remTemplate.util(tokens),
    ...pxTemplate.util(tokens),
    ...resetTemplate.util(tokens),
    ...responsiveTemplate.util(tokens)
  };
}
