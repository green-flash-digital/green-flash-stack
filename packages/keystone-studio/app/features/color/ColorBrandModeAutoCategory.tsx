import type { ChangeEventHandler } from "react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { classes } from "react-hook-primitives";

import {
  makeSpace,
  makeRem,
  makeColor,
  makeFontWeight
} from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import chroma from "chroma-js";
import { match, P } from "ts-pattern";
import type { Updater } from "use-immer";

import { Button } from "~/components/Button";
import { InputColor } from "~/components/InputColor";
import { InputLabel } from "~/components/InputLabel";
import { IconTick01 } from "~/icons/IconTick01";
import { IconTickDouble01 } from "~/icons/IconTickDouble01";

import type { ConfigurationStateColor, VibeName } from "./color.utils";
import { vibePresets, vibeDefaults } from "./color.utils";
import {
  ColorBrandModeAutoCategorySelect,
  colorCategories
} from "./ColorBrandModeAutoCategorySelect";

function matchHexToVibe(hex: string): { type: VibeName; exact: boolean } | undefined {
  try {
    const color = chroma(hex);
    const [L, C] = color.oklch();
    for (const [name, preset] of Object.entries(vibePresets) as [
      VibeName,
      (typeof vibePresets)[VibeName]
    ][]) {
      if (L >= preset.minL && L <= preset.maxL && C >= preset.minC && C <= preset.maxC) {
        return { type: name, exact: true };
      }
    }
    let minDist = Infinity;
    let closest: VibeName = "neutral";
    for (const [name, preset] of Object.entries(vibePresets) as [
      VibeName,
      (typeof vibePresets)[VibeName]
    ][]) {
      const midL = (preset.minL + preset.maxL) / 2;
      const midC = (preset.minC + preset.maxC) / 2;
      const dist = ((L - midL) ** 2 + (C - midC) ** 2) ** 0.5;
      if (dist < minDist) {
        minDist = dist;
        closest = name;
      }
    }
    return { type: closest, exact: false };
  } catch {
    return undefined;
  }
}

const categoryContainerStyles = css`
  padding: ${makeSpace(16)};
  background: white;
  border: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
  border-radius: ${makeSpace(4)};

  .cat-head {
    margin-bottom: ${makeSpace(16)};
    border-bottom: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
    padding-bottom: ${makeSpace(16)};

    .title {
      display: grid;
      grid-template-columns: ${makeSpace(24)} 1fr;
      align-items: center;
      gap: ${makeSpace(8)};
      font-weight: ${makeFontWeight("mulish-bold")};
    }

    .desc {
      font-size: ${makeSpace(12)};
      font-weight: ${makeFontWeight("mulish-regular")};
      height: ${makeSpace(44)};
      margin-top: ${makeSpace(8)};
      line-height: 1.4;
    }
  }

  .cat-pick {
    display: grid;
    grid-template-columns: 1fr 2fr;
    margin-bottom: ${makeSpace(16)};
    & > *:last-child {
      flex: 1;
      border-left: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
      padding-left: ${makeSpace(16)};
      margin-left: ${makeSpace(16)};
    }

    .color {
      display: flex;
      gap: ${makeSpace(16)};
      align-items: center;
      height: ${makeSpace(24)};

      .match {
        font-size: ${makeRem(14)};
        display: flex;
        gap: ${makeSpace(8)};
        align-items: center;
      }
    }

    button {
      &.close {
        color: ${makeColor("primary-700")};
      }
      &.exact {
        color: ${makeColor("success-600")};
      }
    }
  }
`;

export type ColorBrandModeAutoCategoryProps = {
  setColor: Updater<ConfigurationStateColor>;
  state: ConfigurationStateColor;
};

export function ColorBrandModeAutoCategory({ setColor, state }: ColorBrandModeAutoCategoryProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [matchType, setMatchType] = useState<
    { category: VibeName; matchType: "exact" | "close" } | undefined
  >(undefined);

  const currentVibeType = state.vibe?.type ?? "fluorescent";

  const handleSelectVibe = useCallback(
    (type: VibeName) => {
      setColor((draft) => {
        draft.vibe = { type, ...vibeDefaults[type] };
      });
    },
    [setColor]
  );

  const handlePickColorForCategory = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target: { value } }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const result = matchHexToVibe(value);
        if (!result) return;
        setMatchType({ category: result.type, matchType: result.exact ? "exact" : "close" });
        handleSelectVibe(result.type);
      }, 500);
    },
    [handleSelectVibe]
  );

  const CategoryIcon = colorCategories[currentVibeType].Icon;
  const selectId = useId();

  return (
    <div className={categoryContainerStyles}>
      {useMemo(
        () => (
          <div className="cat-head">
            <div className="title">
              <CategoryIcon dxSize={24} />
              <span>{colorCategories[currentVibeType].display}</span>
            </div>
            <div className="desc">{colorCategories[currentVibeType].description}</div>
          </div>
        ),
        [CategoryIcon, currentVibeType]
      )}
      <div className="cat-pick">
        {useMemo(
          () => (
            <InputLabel dxLabel="Manually select" dxSize="dense">
              <ColorBrandModeAutoCategorySelect
                id={selectId}
                onSelect={handleSelectVibe}
                selectedType={currentVibeType}
              />
            </InputLabel>
          ),
          [handleSelectVibe, selectId, currentVibeType]
        )}
        <InputLabel dxLabel="Pick a color" dxSize="dense">
          <div className="color">
            <InputColor dxSize="dense" onChange={handlePickColorForCategory} />
            <div className={classes("match", matchType?.matchType)}>
              {match(matchType)
                .with(P.nullish, () => null)
                .with({ matchType: "close" }, () => (
                  <Button
                    dxVariant="icon"
                    className="close"
                    dxHelp="Close Match: nearest vibe based on oklch lightness and chroma"
                    DXIcon={IconTick01}
                  />
                ))
                .with({ matchType: "exact" }, (s) => (
                  <Button
                    dxVariant="icon"
                    className="exact"
                    dxHelp={`Exact Match: this color falls within the oklch range for "${s.category}"`}
                    DXIcon={IconTickDouble01}
                  />
                ))
                .exhaustive()}
              {matchType && <div>{colorCategories[matchType.category].display}</div>}
            </div>
          </div>
        </InputLabel>
      </div>
    </div>
  );
}
