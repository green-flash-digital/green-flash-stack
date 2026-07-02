import { useCallback } from "react";

import { generateGUID } from "ts-jolt/isomorphic";

import { InputLabel } from "~/components/InputLabel";
import { InputSection } from "~/components/InputSection";
import { VariantAdd } from "~/components/VariantAdd";
import { VariantEmpty } from "~/components/VariantEmpty";
import { VariantList } from "~/components/VariantList";

import { useConfigurationContext } from "../Config.context";
import { ColorNeutralVariant } from "./ColorNeutralVariant";

export function ColorNeutral() {
  const { state, update } = useConfigurationContext();

  const colorEntries = Object.entries(state.color.hex);

  const handleAdd = useCallback(() => {
    const totalColors = colorEntries.length;
    update((draft) => {
      const id = generateGUID();
      draft.color.hex[id] = {
        hex: "#000000",
        name: `neutral${totalColors + 1}`,
        variants: 10
      };
    });
  }, [colorEntries.length, update]);

  return (
    <InputSection>
      <InputLabel
        dxLabel="Add neutral colors to your color palette"
        dxHelp="You can configure each color's base value, name, and how variants are created."
      />
      {colorEntries.length === 0 ? (
        <VariantEmpty
          dxMessage="No neutral colors have been added yet"
          dxActionMessage="Click to add a neutral color"
          dxOnAdd={handleAdd}
        />
      ) : (
        <VariantList>
          {colorEntries.map(([colorId, colorNameAndDef]) => {
            return (
              <li key={colorId}>
                <ColorNeutralVariant
                  colorDef={{ [colorId]: colorNameAndDef }}
                  update={update}
                />
              </li>
            );
          })}
          <li>
            <VariantAdd onAdd={handleAdd}>Add another neutral color</VariantAdd>
          </li>
        </VariantList>
      )}
    </InputSection>
  );
}
