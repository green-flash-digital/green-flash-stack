import { useCallback, useMemo } from "react";

import { generateGUID } from "@green-flash/ts-utils/isomorphic";
import {
  makeColor,
  makeFontFamily,
  makeFontWeight,
  makeRem,
  makeReset,
  makeSpace
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { InputSelect } from "~/components/InputSelect";
import { InputText } from "~/components/InputText";
import { useConfigurationContext } from "~/features/Config.context";

import { buildFlatColorManifest } from "./color.utils";

const tableStyles = css`
  width: 100%;
  border-collapse: collapse;
  font-family: ${makeFontFamily("inter")};
  font-size: ${makeRem(12)};

  thead tr th {
    text-align: left;
    font-weight: ${makeFontWeight("mulish-semiBold")};
    font-size: ${makeRem(11)};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${makeColor("neutral", { opacity: 0.6 })};
    padding: 0 0 ${makeSpace(8)};

    &:not(:last-child) {
      padding-right: ${makeSpace(8)};
    }
  }

  tbody tr td {
    padding: ${makeSpace(4)} 0;
    vertical-align: middle;

    &:not(:last-child) {
      padding-right: ${makeSpace(8)};
    }
  }
`;

const deleteButtonStyles = css`
  ${makeReset("button")};
  color: ${makeColor("danger-200")};
  font-size: ${makeRem(11)};
  padding: ${makeSpace(4)};
  border-radius: ${makeSpace(4)};
  transition: color 0.15s ease-in-out;

  &:hover {
    color: ${makeColor("danger-300")};
  }
`;

const addButtonStyles = css`
  ${makeReset("button")};
  margin-top: ${makeSpace(12)};
  font-size: ${makeRem(12)};
  color: ${makeColor("secondary-700")};
  font-weight: ${makeFontWeight("mulish-medium")};

  &:hover {
    color: ${makeColor("secondary-900")};
  }
`;

export function ColorSemanticRoles() {
  const { state, update } = useConfigurationContext();

  const colorManifest = useMemo(() => buildFlatColorManifest(state.color), [state.color]);
  const tokenOptions = useMemo(() => Object.keys(colorManifest).sort(), [colorManifest]);

  const handleAdd = useCallback(() => {
    const id = generateGUID();
    const firstToken = tokenOptions[0] ?? "";
    update((draft) => {
      draft.semantic[id] = { role: "", light: firstToken, dark: firstToken };
    });
  }, [update, tokenOptions]);

  const handleDelete = useCallback(
    (id: string) => {
      update((draft) => {
        delete draft.semantic[id];
      });
    },
    [update]
  );

  const handleRoleChange = useCallback(
    (id: string, role: string) => {
      update((draft) => {
        draft.semantic[id].role = role;
      });
    },
    [update]
  );

  const handleLightChange = useCallback(
    (id: string, light: string) => {
      update((draft) => {
        draft.semantic[id].light = light;
      });
    },
    [update]
  );

  const handleDarkChange = useCallback(
    (id: string, dark: string) => {
      update((draft) => {
        draft.semantic[id].dark = dark;
      });
    },
    [update]
  );

  return (
    <div>
      <table className={tableStyles}>
        <thead>
          <tr>
            <th>Role name</th>
            <th>Light token</th>
            <th>Dark token</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {Object.entries(state.semantic).map(([id, entry]) => (
            <tr key={id}>
              <td>
                <InputText
                  dxSize="dense"
                  value={entry.role}
                  placeholder="e.g. interactive"
                  onChange={(e) => handleRoleChange(id, e.target.value)}
                />
              </td>
              <td>
                <InputSelect
                  dxSize="dense"
                  value={entry.light}
                  onChange={(e) => handleLightChange(id, e.target.value)}
                >
                  {tokenOptions.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </InputSelect>
              </td>
              <td>
                <InputSelect
                  dxSize="dense"
                  value={entry.dark}
                  onChange={(e) => handleDarkChange(id, e.target.value)}
                >
                  {tokenOptions.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </InputSelect>
              </td>
              <td>
                <button
                  type="button"
                  className={deleteButtonStyles}
                  onClick={() => handleDelete(id)}
                  aria-label={`Delete ${entry.role || "role"}`}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className={addButtonStyles} onClick={handleAdd}>
        + Add role
      </button>
    </div>
  );
}
