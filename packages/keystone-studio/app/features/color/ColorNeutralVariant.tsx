import { useCallback } from "react";
import type { ChangeEventHandler, MouseEventHandler } from "react";
import { useToggle } from "react-hook-primitives";

import type { ColorVariantTypes } from "@keystone-css/core/schemas";
import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { exhaustiveMatchGuard } from "ts-jolt/isomorphic";

import { ColorBlob, useColorBlob } from "~/components/ColorBlob";
import { InputGroup } from "~/components/InputGroup";
import { VariantContainer } from "~/components/VariantContainer";
import { VariantContainerBar } from "~/components/VariantContainerBar";
import { VariantContainerBarActions } from "~/components/VariantContainerBarActions";
import { VariantContainerBarText } from "~/components/VariantContainerBarText";
import { VariantContainerBarTitle } from "~/components/VariantContainerBarTitle";
import { VariantContainerContent } from "~/components/VariantContainerContent";

import type { ConfigurationContextType } from "../Config.context";
import type { ConfigurationStateColorHexEntry } from "./color.utils";
import { ColorSwatchHex } from "./ColorSwatchHex";
import { ColorSwatchName } from "./ColorSwatchName";
import { ColorSwatchVariants } from "./ColorSwatchVariants";
import type { ColorSwatchVariantsPropsCustom } from "./ColorSwatchVariants";

const barStyles = css`
  grid-template-columns: ${makeSpace(24)} ${makeRem(100)} auto 1fr !important;
`;

export function ColorNeutralVariant<T extends { [id: string]: ConfigurationStateColorHexEntry }>({
  colorDef,
  setColor
}: {
  colorDef: T;
  setColor: ConfigurationContextType["setColor"];
}) {
  const [id, { name, hex, variants }] = Object.entries(colorDef)[0];
  const { colorBlobRef, setHex } = useColorBlob();
  const [isOpen, toggle] = useToggle();

  const handleChangeHex = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      setColor((draft) => {
        const color = draft.hex[id];
        color.hex = value;
      });
      setHex(value);
    },
    [id, setColor, setHex]
  );

  const handleChangeName = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      setColor((draft) => {
        const color = draft.hex[id];
        color.name = value;
      });
    },
    [id, setColor]
  );

  const handleRemove = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    setColor((draft) => {
      delete draft.hex[id];
    });
  }, [id, setColor]);

  const handleChangeVariantType = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      const type = value as ColorVariantTypes["type"];
      switch (type) {
        case "auto":
          setColor((draft) => {
            draft.hex[id].variants = 10;
          });
          break;
        case "auto-named":
          setColor((draft) => {
            draft.hex[id].variants = ["light", "dark"];
          });
          break;
        case "key-value":
          setColor((draft) => {
            draft.hex[id].variants = {
              light: "#cccccc",
              dark: "#525252"
            };
          });
          break;

        default:
          exhaustiveMatchGuard(type);
      }
    },
    [id, setColor]
  );

  const handleChangeVariantAuto = useCallback<
    ColorSwatchVariantsPropsCustom["onChangeVariantAuto"]
  >(
    (variant) => {
      setColor((draft) => {
        draft.hex[id].variants = variant;
      });
    },
    [id, setColor]
  );

  const handleChangeVariantNamed = useCallback<
    ColorSwatchVariantsPropsCustom["onChangeVariantNamed"]
  >(
    (params) => {
      switch (params.mode) {
        case "change":
          setColor((draft) => {
            const variants = draft.hex[id].variants;
            if (!Array.isArray(variants)) return;
            variants[params.index] = params.value;
          });
          break;

        case "add":
          setColor((draft) => {
            const variants = draft.hex[id].variants;
            if (!Array.isArray(variants)) return;
            variants.push(params.newValue);
          });
          break;

        case "remove":
          setColor((draft) => {
            const variants = draft.hex[id].variants;
            if (!Array.isArray(variants)) return;
            variants.splice(params.index, 1);
          });
          break;

        default:
          exhaustiveMatchGuard(params);
      }
    },
    [id, setColor]
  );

  const handleChangeVariantManual = useCallback<
    ColorSwatchVariantsPropsCustom["onChangeVariantManual"]
  >(
    (variants) => {
      setColor((draft) => {
        draft.hex[id].variants = variants;
      });
    },
    [id, setColor]
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
