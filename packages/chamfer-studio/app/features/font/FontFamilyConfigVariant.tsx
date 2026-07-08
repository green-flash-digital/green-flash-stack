import type { ReactNode } from "react";
import { useCallback } from "react";

import { makeRem, makeColor } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { InputGroup } from "~/components/InputGroup";
import { VariantContainer } from "~/components/VariantContainer";
import { VariantContainerBar } from "~/components/VariantContainerBar";
import { VariantContainerBarActions } from "~/components/VariantContainerBarActions";
import { VariantContainerBarText } from "~/components/VariantContainerBarText";
import { VariantContainerBarTitle } from "~/components/VariantContainerBarTitle";
import { VariantContainerContent } from "~/components/VariantContainerContent";

import type {
  ConfigurationStateFont,
  ConfigurationStateFontFamilyValuesMeta
} from "../studio.state";

export type OnFontFamilyAction = (
  options:
    | { action: "addFontFamily" }
    | { action: "deleteFontFamily"; id: string }
    | { action: "toggle"; id: string }
    | { action: "addStyle"; id: string; style: string }
    | { action: "deleteStyle"; id: string; style: string }
    | { action: "changeTokenName"; id: string; token: string }
    | { action: "changeFamilyName"; id: string; fontFamilyName: string }
    | { action: "changeFallback"; id: string; fallback: string | undefined }
) => void;

const variantStyles = css`
  grid-template-columns: ${makeRem(100)} 1fr 1fr !important;

  .family-name {
    align-content: start;
    text-align: left;
    font-size: ${makeRem(14)};
    color: ${makeColor("neutral-light", { opacity: 0.5 })};
  }
`;

export type FontFamilyConfigVariantProps = ConfigurationStateFontFamilyValuesMeta & {
  id: string;
  tokenName: string;
  familyName: string;
  source: ConfigurationStateFont["source"];
  onAction: OnFontFamilyAction;
};

export function FontFamilyConfigVariant(
  props: FontFamilyConfigVariantProps & {
    children: ReactNode;
  }
) {
  const handleToggle = useCallback(() => {
    props.onAction({
      action: "toggle",
      id: props.id
    });
  }, [props]);

  const handleDelete = useCallback(() => {
    props.onAction({
      action: "deleteFontFamily",
      id: props.id
    });
  }, [props]);

  return (
    <VariantContainer>
      <VariantContainerBar className={variantStyles}>
        <VariantContainerBarTitle>{props.tokenName}</VariantContainerBarTitle>
        <VariantContainerBarText>{props.familyName}</VariantContainerBarText>
        <VariantContainerBarActions
          dxIsEditing={props.meta.isOpen}
          dxOnEdit={handleToggle}
          dxOnDelete={handleDelete}
        />
      </VariantContainerBar>
      {props.meta.isOpen && (
        <VariantContainerContent>
          <InputGroup>{props.children}</InputGroup>
        </VariantContainerContent>
      )}
    </VariantContainer>
  );
}
