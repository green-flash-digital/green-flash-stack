import { useCallback } from "react";

import { manualFontStyles } from "@keystone-css/core/schemas";
import { makeSpace, makeReset } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { exhaustiveMatchGuard, generateGUID } from "ts-jolt/isomorphic";

import { VariantAdd } from "~/components/VariantAdd";
import { VariantEmpty } from "~/components/VariantEmpty";
import { LOG } from "~/utils/util.logger";

import { useConfigurationContext } from "../Config.context";
import { FontFamilyConfigManual } from "./FontFamilyConfigManual";
import type { OnFontFamilyAction } from "./FontFamilyConfigVariant";

const styles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(8)};
`;

export function FontFamilyConfig() {
  const { state, update } = useConfigurationContext();

  const handleAction = useCallback<OnFontFamilyAction>(
    (args) => {
      switch (args.action) {
        case "addFontFamily":
          update((draft) => {
            const numOfFamilies = (Object.values(draft.font.families).length = 0);
            draft.font.source = "manual";
            draft.font.families[generateGUID()] = {
              tokenName: `family${numOfFamilies + 1}`,
              familyName: "Arial",
              fallback: undefined,
              styles: {
                "regular-400": {
                  display: manualFontStyles["regular-400"]
                }
              },
              meta: {
                isOpen: true
              }
            };
          });
          break;

        case "deleteFontFamily": {
          update((draft) => {
            const familyToDelete = draft.font.families[args.id];
            const isFontFamilyInVariants = Object.values(draft.font.variants).reduce(
              (accum, variant) => {
                if (variant.familyToken === familyToDelete.tokenName) return true;
                return accum;
              },
              false
            );
            if (isFontFamilyInVariants) {
              LOG.error(
                "Cannot delete this family since it is a part of the variants. Please delete the variants that include the family and try again."
              );
              return;
            }

            delete draft.font.families[args.id];
          });
          break;
        }

        case "toggle": {
          update((draft) => {
            draft.font.families[args.id].meta.isOpen =
              !draft.font.families[args.id].meta.isOpen;
          });
          break;
        }

        case "addStyle": {
          update((draft) => {
            draft.font.families[args.id].styles[args.style] = {
              display: manualFontStyles[args.style as keyof typeof manualFontStyles]
            };
          });
          break;
        }

        case "deleteStyle": {
          update((draft) => {
            delete draft.font.families[args.id].styles[args.style];
          });
          break;
        }

        case "changeFamilyName":
          update((draft) => {
            draft.font.families[args.id].familyName = args.fontFamilyName;
          });
          break;

        case "changeTokenName":
          update((draft) => {
            draft.font.families[args.id].tokenName = args.token;
          });
          break;

        case "changeFallback":
          update((draft) => {
            draft.font.families[args.id].fallback = args.fallback;
          });
          break;

        default:
          exhaustiveMatchGuard(args);
      }
    },
    [update]
  );

  const handleAddFontFamily = useCallback(
    () => handleAction({ action: "addFontFamily" }),
    [handleAction]
  );

  if (Object.entries(state.font.families).length === 0) {
    return (
      <VariantEmpty
        dxMessage="No font families have been added yet"
        dxActionMessage="Click to add a font family"
        dxOnAdd={handleAddFontFamily}
      />
    );
  }

  return (
    <ul className={styles}>
      {Object.entries(state.font.families).map(([familyId, family]) => (
        <li key={familyId}>
          <FontFamilyConfigManual
            {...family}
            id={familyId}
            source={state.font.source}
            onAction={handleAction}
          />
        </li>
      ))}
      <VariantAdd onAdd={handleAddFontFamily}>Add a font family</VariantAdd>
    </ul>
  );
}
