import { useCallback } from "react";

import { makeSpace, makeRem, makeReset } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { exhaustiveMatchGuard, generateGUID } from "ts-jolt/isomorphic";

import { VariantAdd } from "~/components/VariantAdd";
import { VariantEmpty } from "~/components/VariantEmpty";

import { useConfigurationContext } from "../Config.context";
import { CustomConfigVariant } from "./CustomConfigVariant";
import type { OnCustomAction } from "./CustomConfigVariant";

const styles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(16)};

  li.add {
    button {
      width: 100%;
    }
  }
`;

export function CustomConfig() {
  const { state, update } = useConfigurationContext();

  const onCustomAction = useCallback<OnCustomAction>(
    (args) => {
      switch (args.action) {
        case "addToken":
          update((draft) => {
            const numOfTokens = Object.keys(draft.custom).length;
            const newTokenNum = numOfTokens + 1;
            draft.custom[generateGUID()] = {
              type: "string",
              name: `token_${newTokenNum}`,
              description: `token_description_${newTokenNum}`,
              value: ""
            };
          });
          break;

        case "deleteToken":
          update((draft) => {
            delete draft.custom[args.id];
          });
          break;

        case "updateName":
          update((draft) => {
            draft.custom[args.id].name = args.name;
          });
          break;

        case "updateDescription":
          update((draft) => {
            draft.custom[args.id].description = args.description;
          });
          break;

        case "updateValue":
          update((draft) => {
            draft.custom[args.id].value = args.value;
          });
          break;

        case "updateType": {
          update((draft) => {
            const token = draft.custom[args.id];
            token.type = args.type;
            switch (args.type) {
              case "string":
                token.value = "";
                break;

              case "rem":
              case "number":
                token.value = 0;
                break;

              default:
                exhaustiveMatchGuard(args.type);
            }
          });
          break;
        }

        default:
          exhaustiveMatchGuard(args);
      }
    },
    [update]
  );

  const handleAdd = useCallback(() => {
    onCustomAction({ action: "addToken" });
  }, [onCustomAction]);

  const customEntires = Object.entries(state.custom);
  if (customEntires.length === 0) {
    return (
      <VariantEmpty
        dxMessage="No custom tokens have been added yet"
        dxActionMessage="Click to add a custom token"
        dxOnAdd={handleAdd}
      />
    );
  }

  return (
    <ul className={styles}>
      {customEntires.map(([tokenId, tokenDef]) => (
        <li key={tokenId}>
          <CustomConfigVariant tokenId={tokenId} tokenDef={tokenDef} onAction={onCustomAction} />
        </li>
      ))}
      <li className="add">
        <VariantAdd onAdd={handleAdd}>Add another custom token</VariantAdd>
      </li>
    </ul>
  );
}
