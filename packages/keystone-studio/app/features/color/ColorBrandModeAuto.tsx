import type { ChangeEventHandler } from "react";
import { useCallback } from "react";

import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { generateGUID } from "ts-jolt/isomorphic";

import { VariantAdd } from "~/components/VariantAdd";
import { VariantEmpty } from "~/components/VariantEmpty";
import { VariantList } from "~/components/VariantList";

import { InputLabel } from "../../components/InputLabel";
import { InputRange } from "../../components/InputRange";
import { InputSection } from "../../components/InputSection";
import type { ConfigurationContextType } from "../Config.context";
import type { ConfigurationStateColor } from "./color.utils";
import { colorVibePresets, vibeDefaults } from "./color.utils";
import { ColorBrandModeAutoCategory } from "./ColorBrandModeAutoCategory";
import { ColorBrandModeAutoVariant } from "./ColorBrandModeAutoVariant";

const inputLabelStyles = css`
  margin-bottom: ${makeSpace(16)};
  margin-top: ${makeSpace(8)};
`;

export function ColorBrandModeAuto({
  state,
  setColor
}: {
  state: ConfigurationStateColor;
  setColor: ConfigurationContextType["setColor"];
}) {
  const vibeType = state.vibe?.type ?? "fluorescent";
  const presets = colorVibePresets[vibeType];

  const handleChangeLightness = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      setColor((draft) => {
        if (!draft.vibe) {
          draft.vibe = { type: vibeType, ...vibeDefaults[vibeType] };
        }
        (draft.vibe as { lightness: number }).lightness = Number(value);
      });
    },
    [setColor, vibeType]
  );

  const handleChangeChroma = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ currentTarget: { value } }) => {
      setColor((draft) => {
        if (!draft.vibe) {
          draft.vibe = { type: vibeType, ...vibeDefaults[vibeType] };
        }
        (draft.vibe as { chroma: number }).chroma = Number(value);
      });
    },
    [setColor, vibeType]
  );

  const handleAddVariant = useCallback(() => {
    const totalColors = Object.keys(state.hue).length;
    setColor((draft) => {
      const id = generateGUID();
      draft.hue[id] = {
        hue: 180,
        name: `brand${totalColors + 1}`,
        variants: 10
      };
    });
  }, [setColor, state.hue]);

  const colorEntries = Object.entries(state.hue);

  return (
    <>
      <InputSection>
        <InputLabel
          dxLabel="Determine the color category"
          dxHelp="Select a vibe or pick a color to auto-detect it"
        />
        <ColorBrandModeAutoCategory state={state} setColor={setColor} />
      </InputSection>
      <InputSection>
        <InputLabel
          dxLabel="Configure your colors"
          dxHelp="Adjust lightness, chroma, and hues within the selected vibe"
        />
        <div className={inputLabelStyles}>
          <InputLabel dxLabel="Lightness" htmlFor="lightness" dxSize="dense" />
          <InputRange
            id="lightness"
            dxDisplayMin
            dxDisplayMax
            dxDisplayInput
            value={state.vibe?.lightness ?? vibeDefaults[vibeType].lightness}
            min={presets.lightness.min}
            max={presets.lightness.max}
            step={0.01}
            className={inputLabelStyles}
            onChange={handleChangeLightness}
          />
        </div>
        <div className={inputLabelStyles}>
          <InputLabel dxLabel="Chroma" htmlFor="chroma" dxSize="dense" />
          <InputRange
            id="chroma"
            dxDisplayMin
            dxDisplayMax
            dxDisplayInput
            value={state.vibe?.chroma ?? vibeDefaults[vibeType].chroma}
            min={presets.chroma.min}
            max={presets.chroma.max}
            step={0.01}
            className={inputLabelStyles}
            onChange={handleChangeChroma}
          />
        </div>
        <div className={inputLabelStyles}>
          <InputLabel dxLabel="Hues & Variants" dxSize="dense" />
          {colorEntries.length === 0 ? (
            <VariantEmpty
              dxMessage="No colors have been added"
              dxActionMessage="Click to add a color"
              dxOnAdd={handleAddVariant}
            />
          ) : (
            <VariantList>
              {colorEntries.map(([colorId, colorNameAndDef]) => (
                <li key={colorId}>
                  <ColorBrandModeAutoVariant
                    colorDef={{ [colorId]: colorNameAndDef }}
                    setColor={setColor}
                  />
                </li>
              ))}
              <li>
                <VariantAdd onAdd={handleAddVariant}>Add another color</VariantAdd>
              </li>
            </VariantList>
          )}
        </div>
      </InputSection>
    </>
  );
}
