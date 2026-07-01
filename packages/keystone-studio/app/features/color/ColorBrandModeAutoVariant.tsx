import { useCallback } from "react";
import type { ChangeEventHandler, MouseEventHandler } from "react";
import { useToggle } from "react-hook-primitives";

import type { ColorVariantTypes } from "@keystone-css/core/schemas";
import { makeSpace, makeRem } from "@keystone@keystone-css/studio-tokens";
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
import type { ConfigurationStateColorHueEntry } from "./color.utils";
import { ColorSwatchHue } from "./ColorSwatchHue";
import { ColorSwatchName } from "./ColorSwatchName";
import { ColorSwatchVariants } from "./ColorSwatchVariants";
import type { ColorSwatchVariantsPropsCustom } from "./ColorSwatchVariants";

const barStyles = css`
  grid-template-columns: ${makeSpace(24)} ${makeRem(100)} auto 1fr !important;
`;

export function ColorBrandModeAutoVariant<
  T extends { [id: string]: ConfigurationStateColorHueEntry }
>({ colorDef, setColor }: { colorDef: T; setColor: ConfigurationContextType["setColor"] }) {
  const { colorBlobRef, setHue } = useColorBlob();
  const [id, { name, hue, variants }] = Object.entries(colorDef)[0];
  const [isOpen, toggle] = useToggle();

  const handleChangeHue = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      setColor((draft) => {
        const color = draft.hue[id];
        const hue = Number(value);
        color.hue = hue;
        setHue(hue);
      });
    },
    [id, setColor, setHue]
  );

  const handleChangeName = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      setColor((draft) => {
        const color = draft.hue[id];
        color.name = value;
      });
    },
    [id, setColor]
  );

  const handleRemove = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    setColor((draft) => {
      delete draft.hue[id];
    });
  }, [id, setColor]);

  const handleChangeVariantType = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      const type = value as ColorVariantTypes["type"];
      switch (type) {
        case "auto":
          setColor((draft) => {
            draft.hue[id].variants = 10;
          });
          break;
        case "auto-named":
          setColor((draft) => {
            draft.hue[id].variants = ["light", "dark"];
          });
          break;
        case "key-value":
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
        draft.hue[id].variants = variant;
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
            const variants = draft.hue[id].variants;
            if (!Array.isArray(variants)) return;
            variants[params.index] = params.value;
          });
          break;

        case "add":
          setColor((draft) => {
            const variants = draft.hue[id].variants;
            if (!Array.isArray(variants)) return;
            variants.push(params.newValue);
          });
          break;

        case "remove":
          setColor((draft) => {
            const variants = draft.hue[id].variants;
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
        // only handle the number and array
        if (typeof variants === "number" || Array.isArray(variants)) {
          draft.hue[id].variants = variants;
        }
      });
    },
    [id, setColor]
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
