import { useCallback, useMemo } from "react";
import { useToggle } from "@stratum-ui/react/toggle";

import { makeSpace, makeColor, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { InputGroup } from "~/components/InputGroup";
import { InputLabel } from "~/components/InputLabel";
import { InputNumber } from "~/components/InputNumber";
import { InputSelect } from "~/components/InputSelect";
import { InputText } from "~/components/InputText";
import { VariantContainer } from "~/components/VariantContainer";
import { VariantContainerBar } from "~/components/VariantContainerBar";
import { VariantContainerBarActions } from "~/components/VariantContainerBarActions";
import { VariantContainerBarTitle } from "~/components/VariantContainerBarTitle";
import { VariantContainerContent } from "~/components/VariantContainerContent";

import type { ConfigurationStateFont, ConfigurationStateFontVariantValue } from "../studio.state";

export type OnFontVariantAction = (
  options:
    | { action: "addVariant" }
    | { action: "deleteVariant"; id: string }
    | { action: "changeVariantName"; id: string; name: string }
    | { action: "changeVariantFamilyToken"; id: string; familyToken: string }
    | { action: "changeVariantSize"; id: string; size: number }
    | { action: "changeVariantWeightAndStyle"; id: string; weightAndStyle: string }
) => void;

const barStyles = css`
  grid-template-columns: ${makeRem(80)} 1fr auto !important;

  .meta {
    font-size: ${makeSpace(12)};
    color: ${makeColor("neutral-light", { opacity: 0.7 })};
  }
`;

export type FontVariantConfigVariantProps = ConfigurationStateFontVariantValue & {
  variantId: string;
  state: ConfigurationStateFont;
  onAction: OnFontVariantAction;
};

export function FontVariantConfigVariant({
  variantId,
  variantName,
  state,
  familyToken,
  lineHeight,
  size,
  weight,
  onAction
}: FontVariantConfigVariantProps) {
  const [isOpen, toggle] = useToggle();

  const families = useMemo(
    () => Object.values(state.families).map((family) => family.tokenName),
    [state]
  );

  const weights = useMemo(() => {
    const selectedFamily = Object.values(state.families).find(
      (familyDef) => familyDef.tokenName === familyToken
    );
    if (!selectedFamily) return [];
    return Object.entries(selectedFamily.styles).reduce<{ value: string; display: string }[]>(
      (accum, [value, { display }]) => accum.concat({ value, display }),
      []
    );
  }, [familyToken, state]);

  const InputName = useMemo(
    () => (
      <InputLabel dxLabel="Variant Name" dxSize="dense" dxHelp="body1, display2, caption, etc...">
        <InputText
          dxSize="dense"
          defaultValue={variantName}
          onChange={({ currentTarget: { value } }) => {
            onAction({
              action: "changeVariantName",
              id: variantId,
              name: value
            });
          }}
        />
      </InputLabel>
    ),
    [onAction, variantId, variantName]
  );

  const InputFamily = useMemo(
    () => (
      <>
        <InputLabel dxLabel="Font Family" dxSize="dense">
          <InputSelect
            dxSize="dense"
            defaultValue={familyToken}
            onChange={({ currentTarget: { value } }) => {
              onAction({
                action: "changeVariantFamilyToken",
                id: variantId,
                familyToken: value
              });
            }}
          >
            {families.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </InputSelect>
        </InputLabel>
      </>
    ),
    [families, familyToken, onAction, variantId]
  );

  const InputSize = useMemo(
    () => (
      <InputLabel dxLabel="Size" dxSize="dense">
        <InputNumber
          dxSize="dense"
          defaultValue={size}
          min={4}
          onChange={({ currentTarget: { value } }) => {
            onAction({
              action: "changeVariantSize",
              id: variantId,
              size: Number(value)
            });
          }}
        />
      </InputLabel>
    ),
    [onAction, size, variantId]
  );

  const InputWeightAndStyle = useMemo(
    () => (
      <InputLabel dxLabel="Font Weight & Style" dxSize="dense">
        <InputSelect
          dxSize="dense"
          defaultValue={familyToken}
          onChange={({ currentTarget: { value } }) => {
            onAction({
              action: "changeVariantWeightAndStyle",
              id: variantId,
              weightAndStyle: value
            });
          }}
        >
          {weights.map((weight) => (
            <option key={weight.value} value={weight.value}>
              {weight.display}
            </option>
          ))}
        </InputSelect>
      </InputLabel>
    ),
    [familyToken, onAction, variantId, weights]
  );

  const handleDelete = useCallback(() => {
    onAction({
      action: "deleteVariant",
      id: variantId
    });
  }, [onAction, variantId]);

  return (
    <VariantContainer>
      <VariantContainerBar className={barStyles}>
        <VariantContainerBarTitle>{variantName}</VariantContainerBarTitle>
        <div className="meta">
          {familyToken} / {size} / {weight} / {lineHeight}
        </div>

        <VariantContainerBarActions
          dxIsEditing={isOpen}
          dxOnDelete={handleDelete}
          dxOnEdit={toggle}
        />
      </VariantContainerBar>
      {isOpen && (
        <VariantContainerContent>
          <InputGroup>
            {InputName}
            {InputFamily}
            {InputSize}
            {InputWeightAndStyle}
          </InputGroup>
        </VariantContainerContent>
      )}
    </VariantContainer>
  );
}
