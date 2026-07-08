import { useCallback } from "react";
import type { ChangeEventHandler, MouseEventHandler } from "react";
import { useToggle } from "react-hook-primitives";

import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";
import type { ColorVariantTypes } from "@keystone-css/core/schemas";
import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import type { Updater } from "use-immer";

import { ColorBlob, useColorBlob } from "~/components/ColorBlob";
import { InputGroup } from "~/components/InputGroup";
import { VariantContainer } from "~/components/VariantContainer";
import { VariantContainerBar } from "~/components/VariantContainerBar";
import { VariantContainerBarActions } from "~/components/VariantContainerBarActions";
import { VariantContainerBarText } from "~/components/VariantContainerBarText";
import { VariantContainerBarTitle } from "~/components/VariantContainerBarTitle";
import { VariantContainerContent } from "~/components/VariantContainerContent";

import type { ConfigurationStateColorHexEntry, StudioState } from "../studio.state";
import { ColorSwatchHex } from "./ColorSwatchHex";
import { ColorSwatchName } from "./ColorSwatchName";
import { ColorSwatchVariants } from "./ColorSwatchVariants";
import type { ColorSwatchVariantsPropsCustom } from "./ColorSwatchVariants";

const barStyles = css`
  grid-template-columns: ${makeSpace(24)} ${makeRem(100)} auto 1fr !important;
`;

export function ColorBrandModeManualVariant<
  T extends { [id: string]: ConfigurationStateColorHexEntry }
>({ colorDef, update }: { colorDef: T; update: Updater<StudioState> }) {
  const [id, { name, hex, variants }] = Object.entries(colorDef)[0];
  const { colorBlobRef, setHex } = useColorBlob();
  const [isOpen, toggle] = useToggle();

  const handleChangeHex = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      update((draft) => {
        const color = draft.color.hex[id];
        color.hex = value;
      });
      setHex(value);
    },
    [id, update, setHex]
  );

  const handleChangeName = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      update((draft) => {
        const color = draft.color.hex[id];
        color.name = value;
      });
    },
    [id, update]
  );

  const handleRemove = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    update((draft) => {
      delete draft.color.hex[id];
    });
  }, [id, update]);

  const handleChangeVariantType = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      const type = value as ColorVariantTypes["type"];
      switch (type) {
        case "auto":
          update((draft) => {
            draft.color.hex[id].variants = 10;
          });
          break;
        case "auto-named":
          update((draft) => {
            draft.color.hex[id].variants = ["light", "dark"];
          });
          break;
        case "key-value":
          update((draft) => {
            draft.color.hex[id].variants = {
              light: "#cccccc",
              dark: "#525252"
            };
          });
          break;

        default:
          exhaustiveMatchGuard(type);
      }
    },
    [id, update]
  );

  const handleChangeVariantAuto = useCallback<
    ColorSwatchVariantsPropsCustom["onChangeVariantAuto"]
  >(
    (variant) => {
      update((draft) => {
        draft.color.hex[id].variants = variant;
      });
    },
    [id, update]
  );

  const handleChangeVariantNamed = useCallback<
    ColorSwatchVariantsPropsCustom["onChangeVariantNamed"]
  >(
    (params) => {
      switch (params.mode) {
        case "change":
          update((draft) => {
            const variants = draft.color.hex[id].variants;
            if (!Array.isArray(variants)) return;
            variants[params.index] = params.value;
          });
          break;

        case "add":
          update((draft) => {
            const variants = draft.color.hex[id].variants;
            if (!Array.isArray(variants)) return;
            variants.push(params.newValue);
          });
          break;

        case "remove":
          update((draft) => {
            const variants = draft.color.hex[id].variants;
            if (!Array.isArray(variants)) return;
            variants.splice(params.index, 1);
          });
          break;

        default:
          exhaustiveMatchGuard(params);
      }
    },
    [id, update]
  );

  const handleChangeVariantManual = useCallback<
    ColorSwatchVariantsPropsCustom["onChangeVariantManual"]
  >(
    (variants) => {
      update((draft) => {
        draft.color.hex[id].variants = variants;
      });
    },
    [id, update]
  );

  return (
    <VariantContainer>
      <VariantContainerBar className={barStyles}>
        <ColorBlob ref={colorBlobRef} dxVariant="circle" dxType="hex" dxValue={hex} />
        <VariantContainerBarTitle>{name}</VariantContainerBarTitle>
        <VariantContainerBarText>{`Hex: ${hex}`}</VariantContainerBarText>
        <VariantContainerBarActions
          dxIsEditing={isOpen}
          dxOnDelete={handleRemove}
          dxOnEdit={toggle}
        />
      </VariantContainerBar>
      {isOpen && (
        <VariantContainerContent>
          <InputGroup>
            <ColorSwatchName name={name} onChangeName={handleChangeName} />
            <ColorSwatchHex id={id} hex={hex} onChangeHex={handleChangeHex} />
            <ColorSwatchVariants
              dxVariants={variants}
              onChangeVariantType={handleChangeVariantType}
              onChangeVariantAuto={handleChangeVariantAuto}
              onChangeVariantNamed={handleChangeVariantNamed}
              onChangeVariantManual={handleChangeVariantManual}
            />
          </InputGroup>
        </VariantContainerContent>
      )}
    </VariantContainer>
  );
}
