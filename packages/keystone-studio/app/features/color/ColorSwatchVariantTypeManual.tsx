import { useEffect } from "react";

import type { ColorVariantTypeKeyValue } from "@keystone-css/core/schemas";
import { makeSpace, makeRem } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { generateGUID } from "ts-jolt/isomorphic";
import { useImmer } from "use-immer";

import { InputColor } from "../../components/InputColor";
import { InputLabel } from "../../components/InputLabel";
import { InputText } from "../../components/InputText";
import { ColorSwatchVariantAdd } from "./ColorSwatchVariantAdd";
import { ColorSwatchVariantList } from "./ColorSwatchVariantList";
import { ColorSwatchVariantRemove } from "./ColorSwatchVariantRemove";

export type ColorSwatchVariantTypeManualProps = {
  variants: ColorVariantTypeKeyValue;
  onChangeVariantManual: (variants: ColorVariantTypeKeyValue) => void;
};

const styles = css`
  grid-template-columns: ${makeSpace(24)} 1fr auto !important;
`;

export function ColorSwatchVariantTypeManual({
  variants,
  onChangeVariantManual
}: ColorSwatchVariantTypeManualProps) {
  const [localVariants, setLocalVariants] = useImmer<{
    [id: string]: { name: string; hex: string };
  }>(
    Object.entries(variants).reduce(
      (accum, [name, hex]) =>
        Object.assign(accum, {
          [generateGUID()]: {
            name,
            hex
          }
        }),
      {}
    )
  );

  // Update the color config by transforming the local state
  // back into the state the state that is used for the rest of the
  // the configuration
  useEffect(() => {
    onChangeVariantManual(
      Object.values(localVariants).reduce(
        (accum, value) => Object.assign(accum, { [value.name]: value.hex }),
        {}
      )
    );
  }, [localVariants, onChangeVariantManual]);

  const localVariantEntries = Object.entries(localVariants);

  return (
    <>
      <InputLabel
        dxLabel="Manual Variants"
        dxSize="dense"
        dxHelp="Add custom variant colors & names"
      />
      <ColorSwatchVariantList>
        {localVariantEntries.map(([colorId, { name, hex }]) => {
          return (
            <li key={colorId} className={styles}>
              <InputColor
                value={hex}
                dxSize="dense"
                onChange={({ currentTarget: { value } }) => {
                  setLocalVariants((draft) => {
                    draft[colorId].hex = value;
                  });
                }}
              />
              <InputText
                dxSize="dense"
                value={name}
                onChange={({ currentTarget: { value } }) => {
                  setLocalVariants((draft) => {
                    draft[colorId].name = value;
                  });
                }}
              />
              <ColorSwatchVariantRemove
                dxIsVisible={localVariantEntries.length > 1}
                onClick={() => {
                  setLocalVariants((draft) => {
                    delete draft[colorId];
                  });
                }}
              />
            </li>
          );
        })}
        <li>
          <ColorSwatchVariantAdd
            onClick={() => {
              setLocalVariants((draft) => {
                draft[generateGUID()] = {
                  hex: "#000000",
                  name: `variant${localVariantEntries.length + 1}`
                };
              });
            }}
          />
        </li>
      </ColorSwatchVariantList>
    </>
  );
}
