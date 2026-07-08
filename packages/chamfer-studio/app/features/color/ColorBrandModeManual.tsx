import { useCallback } from "react";

import { generateGUID } from "@green-flash/ts-utils/isomorphic";
import type { Updater } from "use-immer";

import { VariantAdd } from "~/components/VariantAdd";
import { VariantEmpty } from "~/components/VariantEmpty";
import { VariantList } from "~/components/VariantList";

import { InputLabel } from "../../components/InputLabel";
import { InputSection } from "../../components/InputSection";
import type { ConfigurationStateColor, StudioState } from "../studio.state";
import { ColorBrandModeManualVariant } from "./ColorBrandModeManualVariant";

export function ColorBrandModeManual({
  state,
  update
}: {
  state: ConfigurationStateColor;
  update: Updater<StudioState>;
}) {
  const handleAdd = useCallback(() => {
    const totalColors = Object.keys(state.hex).length;
    update((draft) => {
      const id = generateGUID();
      draft.color.hex[id] = {
        hex: "#000000",
        name: `brand${totalColors + 1}`,
        variants: 10
      };
    });
  }, [update, state]);

  const colorEntries = Object.entries(state.hex);

  return (
    <InputSection>
      <InputLabel
        dxLabel="Add brand colors to your color palette"
        dxHelp="You can configure each color's base value, name, and how variants are created."
      />
      {colorEntries.length === 0 ? (
        <VariantEmpty
          dxMessage="No brand colors have been added yet"
          dxActionMessage="Click to add a brand color"
          dxOnAdd={handleAdd}
        />
      ) : (
        <VariantList>
          {colorEntries.map(([colorId, colorNameAndDef]) => {
            return (
              <li key={colorId}>
                <ColorBrandModeManualVariant
                  colorDef={{ [colorId]: colorNameAndDef }}
                  update={update}
                />
              </li>
            );
          })}
          <li>
            <VariantAdd onAdd={handleAdd}>Add another brand color</VariantAdd>
          </li>
        </VariantList>
      )}
    </InputSection>
  );
}
