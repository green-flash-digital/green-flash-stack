import type { ChangeEventHandler, JSX } from "react";
import { useMemo, forwardRef } from "react";

import type {
  ChamferColorVariant,
  ChamferColorVariantBase,
  ColorVariantTypes
} from "@chamfer-css/core/schemas";
import { makeSpace, makeRem } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";
import { match } from "ts-pattern";

import { InputRadioTab } from "~/components/InputRadioTab";
import { InputRadioTabs } from "~/components/InputRadioTabs";

import { InputLabel } from "../../components/InputLabel";
import { ColorSwatchVariantTypeAuto } from "./ColorSwatchVariantTypeAuto";
import type { ColorSwatchVariantTypeManualProps } from "./ColorSwatchVariantTypeManual";
import { ColorSwatchVariantTypeManual } from "./ColorSwatchVariantTypeManual";
import type { ColorSwatchVariantTypeNamedProps } from "./ColorSwatchVariantTypeNamed";
import { ColorSwatchVariantTypeNamed } from "./ColorSwatchVariantTypeNamed";

export type ColorSwatchVariantsPropsNative = JSX.IntrinsicElements["div"];
export type ColorSwatchVariantsPropsCustom = {
  dxVariants: ChamferColorVariant;
  /**
   * An optional key to manually display only a sub-set of the
   * available variant options
   */
  dxAvailableOptions?: (typeof variantOptions)[0]["type"][];
  onChangeVariantType: ChangeEventHandler<HTMLInputElement>;
  onChangeVariantAuto: <T extends ChamferColorVariantBase>(variant: T) => void;
  onChangeVariantNamed: ColorSwatchVariantTypeNamedProps["onChangeVariantNamed"];
  onChangeVariantManual: ColorSwatchVariantTypeManualProps["onChangeVariantManual"];
};
export type ColorSwatchVariantsProps = ColorSwatchVariantsPropsNative &
  ColorSwatchVariantsPropsCustom;

const styles = css`
  padding: 0 ${makeSpace(16)};
`;

const variantOptions: {
  type: ColorVariantTypes["type"];
  display: string;
  description: string;
}[] = [
  {
    type: "auto",
    display: "Auto",
    description: "Auto-create colors & names"
  },
  {
    type: "auto-named",
    display: "Named",
    description: "Auto-create colors with custom names"
  },
  {
    type: "key-value",
    display: "Manual",
    description: "Custom colors & names"
  }
];

export const ColorSwatchVariants = forwardRef<HTMLDivElement, ColorSwatchVariantsProps>(
  function ColorSwatchVariants(
    {
      children,
      className,
      dxVariants,
      dxAvailableOptions,
      onChangeVariantType,
      onChangeVariantAuto,
      onChangeVariantNamed,
      onChangeVariantManual,
      ...restProps
    },
    ref
  ) {
    const variantUnion = useMemo<ColorVariantTypes>(() => {
      if (typeof dxVariants === "number") {
        return {
          type: "auto",
          variant: dxVariants
        };
      }
      if (Array.isArray(dxVariants)) {
        return {
          type: "auto-named",
          variant: dxVariants
        };
      }
      return {
        type: "key-value",
        variant: dxVariants
      };
    }, [dxVariants]);

    const options = useMemo(() => {
      if (dxAvailableOptions) {
        return dxAvailableOptions.map((availableOption) =>
          variantOptions.find((variantOption) => variantOption.type === availableOption)
        );
      }
      return variantOptions;
    }, [dxAvailableOptions]);

    return (
      <>
        <InputLabel
          dxLabel="Variants"
          dxSize="dense"
          dxHelp="The methodology in which the variants are created & named"
        >
          <InputRadioTabs>
            {options.map((option) => {
              if (!option) return null;
              return (
                <InputRadioTab
                  key={option.type}
                  dxSize="dense"
                  dxLabel={option.display}
                  name="variant-mode"
                  onChange={onChangeVariantType}
                  checked={option.type === variantUnion.type}
                  value={option.type}
                >
                  {option.display}
                </InputRadioTab>
              );
            })}
          </InputRadioTabs>
        </InputLabel>
        <div {...restProps} className={classes(styles, className)} ref={ref}>
          {match(variantUnion)
            .with({ type: "auto" }, ({ variant }) => (
              <ColorSwatchVariantTypeAuto
                variant={variant}
                onChangeVariantAuto={onChangeVariantAuto}
              />
            ))
            .with({ type: "auto-named" }, ({ variant }) => {
              return (
                <ColorSwatchVariantTypeNamed
                  variants={variant}
                  onChangeVariantNamed={onChangeVariantNamed}
                />
              );
            })
            .with({ type: "key-value" }, ({ variant }) => {
              return (
                <ColorSwatchVariantTypeManual
                  variants={variant}
                  onChangeVariantManual={onChangeVariantManual}
                />
              );
            })
            .exhaustive()}
        </div>
      </>
    );
  }
);
