import { useCallback } from "react";

import { exhaustiveMatchGuard, generateGUID } from "ts-jolt/isomorphic";

import { VariantAdd } from "~/components/VariantAdd";
import { VariantEmpty } from "~/components/VariantEmpty";
import { VariantList } from "~/components/VariantList";

import { useConfigurationContext } from "../Config.context";
import type { OnFontVariantAction } from "./font.utils";
import { FontVariantConfigVariant } from "./FontVariantConfigVariant";

export function FontVariantConfig() {
  const { font, setFont } = useConfigurationContext();

  const handleAction = useCallback<OnFontVariantAction>(
    (args) => {
      switch (args.action) {
        case "addVariant":
          setFont((draft) => {
            const nextVariantNum = Object.values(draft.variants).length + 1;
            const family =
              draft.source === "manual"
                ? Object.values(draft.families)[0]
                : Object.values(draft.families)[0];
            draft.variants[generateGUID()] = {
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
          setFont((draft) => {
            delete draft.variants[args.id];
          });
          break;
        }

        case "changeVariantName": {
          setFont((draft) => {
            draft.variants[args.id].variantName = args.name;
          });
          break;
        }

        case "changeVariantFamilyToken": {
          setFont((draft) => {
            draft.variants[args.id].familyToken = args.familyToken;
          });
          break;
        }

        case "changeVariantSize": {
          setFont((draft) => {
            draft.variants[args.id].size = args.size;
          });
          break;
        }

        case "changeVariantWeightAndStyle": {
          setFont((draft) => {
            draft.variants[args.id].weight = args.weightAndStyle;
          });
          break;
        }

        default:
          exhaustiveMatchGuard(args);
      }
    },
    [setFont]
  );

  const handleAddTypographyVariant = useCallback(
    () => handleAction({ action: "addVariant" }),
    [handleAction]
  );

  // Show an empty state if there are no families added
  if (Object.entries(font.variants).length === 0) {
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
      {Object.entries(font.variants).map(([variantId, variant]) => (
        <li key={variantId}>
          <FontVariantConfigVariant
            variantId={variantId}
            state={font}
            onAction={handleAction}
            {...variant}
          />
        </li>
      ))}
      <VariantAdd onAdd={handleAddTypographyVariant}>Add a variant</VariantAdd>
    </VariantList>
  );
}
