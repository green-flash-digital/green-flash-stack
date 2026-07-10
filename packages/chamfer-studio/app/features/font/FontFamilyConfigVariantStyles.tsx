import type { ChangeEvent } from "react";

import { makeSpace, makeReset, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { InputCheckbox } from "~/components/InputCheckbox";
import { InputLabel } from "~/components/InputLabel";

import type { OnFontFamilyAction } from "./FontFamilyConfigVariant";

const ulStyles = css`
  ${makeReset("ul")};
  li {
    label {
      display: grid;
      grid-template-columns: ${makeSpace(24)} 1fr;
      gap: ${makeSpace(4)};
      align-items: center;
      font-size: ${makeSpace(12)};
    }
  }
`;

export type FontFamilyConfigVariantStylesProps = {
  allStyles: { value: string; display: string }[];
  selectedStyles: string[];
  id: string;
  onAction: OnFontFamilyAction;
};
export function FontFamilyConfigVariantStyles({
  allStyles,
  selectedStyles,
  id,
  onAction
}: FontFamilyConfigVariantStylesProps) {
  const styles = allStyles.map((style) => {
    return {
      ...style,
      isChecked: selectedStyles.includes(style.value)
    };
  }, []);

  function handleCheck({
    currentTarget: { checked, value: style }
  }: ChangeEvent<HTMLInputElement>) {
    onAction({
      action: checked ? "addStyle" : "deleteStyle",
      id,
      style
    });
  }

  return (
    <InputLabel
      dxLabel="Styles"
      dxSize="dense"
      dxHelp="Add weights & styles to create separate variants the font family"
    >
      <ul className={ulStyles}>
        {styles.map((style) => {
          return (
            <li key={style.value}>
              <label>
                <InputCheckbox
                  dxSize="normal"
                  value={style.value}
                  checked={style.isChecked}
                  onChange={handleCheck}
                />
                <div>{style.display}</div>
              </label>
            </li>
          );
        })}
      </ul>
    </InputLabel>
  );
}
