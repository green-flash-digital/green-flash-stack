import { useCallback } from "react";

import { exhaustiveMatchGuard, generateGUID } from "@green-flash/ts-utils/isomorphic";

import { useConfigurationContext } from "../Config.context";

export function useRecalculateSpaceVariants() {
  const {
    update,
    state: {
      sizing: {
        space: { mode }
      }
    }
  } = useConfigurationContext();

  const recalculateSpaceVariants = useCallback<(numOfVariants?: number) => void>(
    (numOfVariants) => {
      update((draft) => {
        const prevVariants = draft.sizing.space[mode].variants;
        const prevVarEntries = Object.entries(prevVariants);
        const prevVarEntriesLength = prevVarEntries.length;
        const prevVarLastEntryVal = prevVarEntries[prevVarEntriesLength - 1][1];

        const totalVariants = numOfVariants ?? prevVarEntriesLength;

        // Remove the amount of values
        if (totalVariants < prevVarEntriesLength) {
          const newEntries = prevVarEntries.slice(0, totalVariants);
          draft.sizing.space[mode].variants = Object.fromEntries(newEntries);
          return;
        }

        // Add the amount of values
        if (totalVariants > prevVarEntriesLength) {
          const numOfVariantsToAdd = totalVariants - prevVarEntriesLength;
          const newVariantsArr = [...new Array(numOfVariantsToAdd)];
          const newVariantStartIndex = prevVarEntriesLength + 1;
          const newVariantStartOrder = prevVarLastEntryVal.order + 1;

          switch (mode) {
            case "auto": {
              const newAutoVariants = Object.entries(newVariantsArr).reduce((accum, _, i) => {
                const order = newVariantStartOrder + i;
                const value = draft.sizing.baselineGrid * (prevVarEntriesLength + i + 1);
                return Object.assign(accum, {
                  [generateGUID()]: {
                    name: String(value),
                    value,
                    order
                  }
                });
              }, prevVariants);
              draft.sizing.space[mode].variants = newAutoVariants;
              return;
            }

            case "manual": {
              const newManualVariants = Object.entries(newVariantsArr).reduce((accum, _, i) => {
                const index = newVariantStartIndex + i;
                const order = newVariantStartOrder + i;
                const value = index * draft.sizing.baselineGrid;

                return Object.assign(accum, {
                  [generateGUID()]: {
                    name: String(index),
                    value,
                    order
                  }
                });
              }, prevVariants);
              draft.sizing.space[mode].variants = newManualVariants;
              return;
            }

            default:
              exhaustiveMatchGuard(mode);
          }
        }
      });
    },
    [mode, update]
  );

  return { recalculateSpaceVariants };
}
