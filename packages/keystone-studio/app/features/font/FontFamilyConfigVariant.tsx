import type { ReactNode } from "react";
import { useCallback } from "react";

import { makeRem, makeColor } from "@keystone@keystone-css/studio-tokens";
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
  ConfigurationStateFontFamilyValuesMeta,
  OnFontFamilyAction
} from "./font.utils";

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
  // const fallbackRef = useRef<HTMLInputElement | null>(null);

  // const handleToggleFallback = useCallback<
  //   ChangeEventHandler<HTMLInputElement>
  // >(
  //   ({ currentTarget: { checked } }) => {
  //     props.onAction({
  //       action: "changeFallback",
  //       id: props.id,
  //       fallback: checked ? "" : undefined,
  //     });
  //     if (checked) {
  //       setTimeout(() => fallbackRef.current?.focus(), 100);
  //     }
  //   },
  //   [props]
  // );

  // const handleChangeFallback = useCallback<
  //   ChangeEventHandler<HTMLInputElement>
  // >(
  //   ({ currentTarget: { value } }) => {
  //     props.onAction({
  //       action: "changeFallback",
  //       id: props.id,
  //       fallback: value,
  //     });
  //   },
  //   [props]
  // );

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
          <InputGroup>
            {props.children}

            {/* <InputLabel
              dxLabel="Include a fallback?"
              dxSize="dense"
              dxHelp="Customize the fallback font if the font-family fails to load"
            >
              <div className={inlineField}>
                <InputCheckbox
                  checked={typeof props.fallback !== "undefined"}
                  onChange={handleToggleFallback}
                />
                <InputText
                  ref={fallbackRef}
                  dxSize="dense"
                  dxType="text"
                  disabled={typeof props.fallback === "undefined"}
                  value={props.fallback}
                  onChange={handleChangeFallback}
                />
              </div>
            </InputLabel> */}
          </InputGroup>
        </VariantContainerContent>
      )}
    </VariantContainer>
  );
}
