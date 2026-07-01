import type { ChangeEventHandler } from "react";
import { useCallback, useEffect } from "react";

import { exhaustiveMatchGuard, generateGUID } from "ts-jolt/isomorphic";

import { InputGroup } from "~/components/InputGroup";
import { InputLabel } from "~/components/InputLabel";
import { InputNumber } from "~/components/InputNumber";
import { VariantAdd } from "~/components/VariantAdd";
import { VariantEmpty } from "~/components/VariantEmpty";
import { VariantList } from "~/components/VariantList";

import { useConfigurationContext } from "../Config.context";
import { SizeConfigVariant } from "./SizeConfigVariant";
import type { SizeConfigVariantPropsCustom } from "./SizeConfigVariant";
import { useRecalculateSpaceVariants } from "./space.useRecalculateSpaceVariants";

export function SizeConfig() {
  const { sizing, setSizing } = useConfigurationContext();
  const { recalculateSpaceVariants } = useRecalculateSpaceVariants();

  const sizeVariantEntries = Object.entries(sizing.size.variants);

  const handleAddSizeVariant = useCallback(() => {
    const totalSizeVariants = sizeVariantEntries.length;
    setSizing((draft) => {
      draft.size.variants[generateGUID()] = {
        name: `size${totalSizeVariants + 1}`,
        value: (sizeVariantEntries[0]?.[1].value ?? 0) + sizing.baselineGrid
      };
    });
  }, [setSizing, sizeVariantEntries, sizing.baselineGrid]);

  const handleDelete = useCallback<(id: string) => void>(
    (id) => {
      setSizing((draft) => {
        delete draft.size.variants[id];
      });
    },
    [setSizing]
  );

  const handleChangeDocumentFontSize = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      setSizing((draft) => {
        draft.baseFontSize = Number(value);
      });
    },
    [setSizing]
  );

  const handleChangeBaselineGrid = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      setSizing((draft) => {
        const newBaselineGrid = Number(value);
        if (!newBaselineGrid) return; // return if the baseline grid is 0

        const mathFn = newBaselineGrid < draft.baselineGrid ? Math.floor : Math.ceil;
        draft.baselineGrid = newBaselineGrid;

        // Go through all of the size variants and adjust their values
        // to multiples of the `newBaselineGrid`
        const sizeVariantEntries = Object.entries(draft.size.variants);
        for (const [variantId, variant] of sizeVariantEntries) {
          const nearestValue = mathFn(variant.value / newBaselineGrid) * newBaselineGrid;
          draft.size.variants[variantId].value = nearestValue;
        }
      });
    },
    [setSizing]
  );

  // recalculate the size variants when the baseline grid changes
  useEffect(() => {
    recalculateSpaceVariants();
  }, [recalculateSpaceVariants, sizing.baselineGrid]);

  const handleChangeVariantProperties = useCallback<
    SizeConfigVariantPropsCustom["dxOnChangeVariantProperties"]
  >(
    (id, options) => {
      switch (options.property) {
        case "name":
          setSizing((draft) => {
            draft.size.variants[id].name = options.name;
          });
          break;

        case "value":
          setSizing((draft) => {
            draft.size.variants[id].value = options.value;
          });
          break;

        default:
          exhaustiveMatchGuard(options);
      }
    },
    [setSizing]
  );

  return (
    <InputGroup>
      <InputLabel
        dxLabel="Document Font Size"
        dxHelp="Establishes a base for consistent layout and typography scaling."
        dxSize="dense"
      >
        <InputNumber
          dxSize="dense"
          value={sizing.baseFontSize}
          onChange={handleChangeDocumentFontSize}
        />
      </InputLabel>
      <InputLabel
        dxLabel="Baseline Grid"
        dxSize="dense"
        dxHelp="Harmonizes rhythm and alignment in layouts and typography. (factors of 4)"
      >
        <InputNumber
          dxSize="dense"
          step={4}
          value={sizing.baselineGrid}
          onChange={handleChangeBaselineGrid}
        />
      </InputLabel>
      <div>
        <InputLabel
          dxLabel="Variants"
          dxSize="dense"
          dxHelp="Create named variants to align the vertical sizing of adjacent elements such as inputs, buttons and icons"
        />
        {sizeVariantEntries.length === 0 ? (
          <VariantEmpty
            dxMessage="No sizing variants have been added yet"
            dxActionMessage="Click to add a sizing variant color"
            dxOnAdd={handleAddSizeVariant}
          />
        ) : (
          <VariantList>
            {sizeVariantEntries.map(([variantId, { name, value }]) => (
              <li key={variantId}>
                <SizeConfigVariant
                  dxVariantId={variantId}
                  dxName={name}
                  dxValue={value}
                  dxBaselineGrid={sizing.baselineGrid}
                  dxOnDelete={handleDelete}
                  dxOnChangeVariantProperties={handleChangeVariantProperties}
                />
              </li>
            ))}
            <li>
              <VariantAdd onAdd={handleAddSizeVariant}>Add another sizing variant</VariantAdd>
            </li>
          </VariantList>
        )}
      </div>
    </InputGroup>
  );
}
