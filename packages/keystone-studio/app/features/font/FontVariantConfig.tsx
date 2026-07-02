import { useCallback } from "react";

import { exhaustiveMatchGuard, generateGUID } from "@green-flash/ts-utils/isomorphic";

import { VariantAdd } from "~/components/VariantAdd";
import { VariantEmpty } from "~/components/VariantEmpty";
import { VariantList } from "~/components/VariantList";

import { useConfigurationContext } from "../Config.context";
import type { OnFontVariantAction } from "./FontVariantConfigVariant";
import { FontVariantConfigVariant } from "./FontVariantConfigVariant";

export function FontVariantConfig() {
  const { state, update } = useConfigurationContext();

  const handleAction = useCallback<OnFontVariantAction>(
    (args) => {
      switch (args.action) {
        case "addVariant":
          update((draft) => {
            const nextVariantNum = Object.values(draft.font.variants).length + 1;
            const family =
              draft.font.source === "manual"
                ? Object.values(draft.font.families)[0]
                : Object.values(draft.font.families)[0];
            draft.font.variants[generateGUID()] = {
              familyToken: family.tokenName,
              lineHeight: 1.3,
              size: 16,
              variantName: `variant${nextVariantNum}`,
              weight: "regular-400",
              letterSpacing: 0
            };
          });
          break;

        case "deleteVariant": {
          update((draft) => {
            delete draft.font.variants[args.id];
          });
          break;
        }

        case "changeVariantName": {
          update((draft) => {
            draft.font.variants[args.id].variantName = args.name;
          });
          break;
        }

        case "changeVariantFamilyToken": {
          update((draft) => {
            draft.font.variants[args.id].familyToken = args.familyToken;
          });
          break;
        }

        case "changeVariantSize": {
          update((draft) => {
            draft.font.variants[args.id].size = args.size;
          });
          break;
        }

        case "changeVariantWeightAndStyle": {
          update((draft) => {
            draft.font.variants[args.id].weight = args.weightAndStyle;
          });
          break;
        }

        default:
          exhaustiveMatchGuard(args);
      }
    },
    [update]
  );

  const handleAddTypographyVariant = useCallback(
    () => handleAction({ action: "addVariant" }),
    [handleAction]
  );

  if (Object.entries(state.font.variants).length === 0) {
    return (
      <VariantEmpty
        dxMessage="No typographical variants have been added yet"
        dxActionMessage="Click to add a typography variant"
        dxOnAdd={handleAddTypographyVariant}
      />
    );
  }

  return (
    <VariantList>
      {Object.entries(state.font.variants).map(([variantId, variant]) => (
        <li key={variantId}>
          <FontVariantConfigVariant
            variantId={variantId}
            state={state.font}
            onAction={handleAction}
            {...variant}
          />
        </li>
      ))}
      <VariantAdd onAdd={handleAddTypographyVariant}>Add a variant</VariantAdd>
    </VariantList>
  );
}
