import type { JSX } from "react";
import { forwardRef, useCallback } from "react";
import { useToggle } from "react-hook-primitives";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeSpace, makeColor, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { InputGroup } from "~/components/InputGroup";
import { InputLabel } from "~/components/InputLabel";
import { InputNumber } from "~/components/InputNumber";
import { InputText } from "~/components/InputText";
import { VariantContainer } from "~/components/VariantContainer";
import { VariantContainerBar } from "~/components/VariantContainerBar";
import { VariantContainerBarActions } from "~/components/VariantContainerBarActions";
import { VariantContainerBarText } from "~/components/VariantContainerBarText";
import { VariantContainerBarTitle } from "~/components/VariantContainerBarTitle";
import { VariantContainerContent } from "~/components/VariantContainerContent";

export type SizeConfigVariantPropsNative = JSX.IntrinsicElements["div"];
export type SizeConfigVariantPropsCustom = {
  dxVariantId: string;
  dxName: string;
  dxValue: number;
  dxBaselineGrid: number;
  dxOnDelete: (id: string) => void;
  dxOnChangeVariantProperties: (
    id: string,
    args: { property: "name"; name: string } | { property: "value"; value: number }
  ) => void;
};
export type SizeConfigVariantProps = SizeConfigVariantPropsNative & SizeConfigVariantPropsCustom;

const styles = css`
  grid-template-columns: ${makeRem(50)} auto auto 1fr !important;

  .value {
    position: relative;
    font-size: ${makeSpace(12)};
    color: ${makeColor("neutral-light", { opacity: 0.8 })};

    &::before {
      content: "";
      position: absolute;
      left: -${makeSpace(8)};
      top: 0;
      bottom: 0;
      height: 100%;
      background: ${makeColor("neutral-light", { opacity: 0.4 })};
      width: 1px;
    }
  }
`;

export const SizeConfigVariant = forwardRef<HTMLDivElement, SizeConfigVariantProps>(
  function SizeConfigVariant(
    {
      children,
      className,
      dxVariantId,
      dxName,
      dxValue,
      dxBaselineGrid,
      dxOnDelete,
      dxOnChangeVariantProperties,
      ...restProps
    },
    ref
  ) {
    const [isOpen, toggle] = useToggle();

    const handleDelete = useCallback(() => {
      dxOnDelete(dxVariantId);
    }, [dxOnDelete, dxVariantId]);

    return (
      <VariantContainer {...restProps} className={classes(styles, className)} ref={ref}>
        <VariantContainerBar className={styles}>
          <VariantContainerBarTitle>{dxName}</VariantContainerBarTitle>
          <VariantContainerBarText className="value">{dxValue}px</VariantContainerBarText>
          <VariantContainerBarText className="value">
            {dxValue / dxBaselineGrid}rem
          </VariantContainerBarText>
          <VariantContainerBarActions
            dxIsEditing={isOpen}
            dxOnEdit={toggle}
            dxOnDelete={handleDelete}
          />
        </VariantContainerBar>
        {isOpen && (
          <VariantContainerContent>
            <InputGroup>
              <InputLabel dxLabel="Token name" dxSize="dense">
                <InputText
                  dxSize="dense"
                  value={dxName}
                  onChange={({ currentTarget: { value } }) =>
                    dxOnChangeVariantProperties(dxVariantId, {
                      property: "name",
                      name: value
                    })
                  }
                />
              </InputLabel>
              <InputLabel
                dxLabel="Value in pixels"
                dxSize="dense"
                dxHelp="In increments of the baseline grid"
              >
                <InputNumber
                  dxSize="dense"
                  defaultValue={dxValue}
                  step={dxBaselineGrid}
                  onChange={({ currentTarget: { value } }) =>
                    dxOnChangeVariantProperties(dxVariantId, {
                      property: "value",
                      value: Number(value)
                    })
                  }
                />
              </InputLabel>
            </InputGroup>
          </VariantContainerContent>
        )}
      </VariantContainer>
    );
  }
);
