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

import type { ConfigurationStateColorHueEntry, StudioState } from "../studio.state";
import { ColorSwatchHue } from "./ColorSwatchHue";
import { ColorSwatchName } from "./ColorSwatchName";
import { ColorSwatchVariants } from "./ColorSwatchVariants";
import type { ColorSwatchVariantsPropsCustom } from "./ColorSwatchVariants";

const barStyles = css`
  grid-template-columns: ${makeSpace(24)} ${makeRem(100)} auto 1fr !important;
`;

export function ColorBrandModeAutoVariant<
  T extends { [id: string]: ConfigurationStateColorHueEntry }
>({ colorDef, update }: { colorDef: T; update: Updater<StudioState> }) {
  const { colorBlobRef, setHue } = useColorBlob();
  const [id, { name, hue, variants }] = Object.entries(colorDef)[0];
  const [isOpen, toggle] = useToggle();

  const handleChangeHue = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      update((draft) => {
        const color = draft.color.hue[id];
        const hue = Number(value);
        color.hue = hue;
        setHue(hue);
      });
    },
    [id, update, setHue]
  );

  const handleChangeName = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      update((draft) => {
        const color = draft.color.hue[id];
        color.name = value;
      });
    },
    [id, update]
  );

  const handleRemove = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    update((draft) => {
      delete draft.color.hue[id];
    });
  }, [id, update]);

  const handleChangeVariantType = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      const type = value as ColorVariantTypes["type"];
      switch (type) {
        case "auto":
          update((draft) => {
            draft.color.hue[id].variants = 10;
          });
          break;
        case "auto-named":
          update((draft) => {
            draft.color.hue[id].variants = ["light", "dark"];
          });
          break;
        case "key-value":
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
        draft.color.hue[id].variants = variant;
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
            const variants = draft.color.hue[id].variants;
            if (!Array.isArray(variants)) return;
            variants[params.index] = params.value;
          });
          break;

        case "add":
          update((draft) => {
            const variants = draft.color.hue[id].variants;
            if (!Array.isArray(variants)) return;
            variants.push(params.newValue);
          });
          break;

        case "remove":
          update((draft) => {
            const variants = draft.color.hue[id].variants;
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
        if (typeof variants === "number" || Array.isArray(variants)) {
          draft.color.hue[id].variants = variants;
        }
      });
    },
    [id, update]
  );

  return (
    <VariantContainer>
      <VariantContainerBar className={barStyles}>
        <ColorBlob ref={colorBlobRef} dxVariant="circle" dxType="hue" dxValue={hue} />
        <VariantContainerBarTitle>{name}</VariantContainerBarTitle>
        <VariantContainerBarText>{`Hue: ${hue}`}</VariantContainerBarText>
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
            <ColorSwatchHue hue={hue} onChangeHue={handleChangeHue} />
            <ColorSwatchVariants
              dxVariants={variants}
              dxAvailableOptions={["auto", "auto-named"]}
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
