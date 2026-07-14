import { useCallback } from "react";

import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { InputDropdownSelect } from "~/components/InputDropdownSelect";
import { useInputDropdownSelectContext } from "~/components/InputDropdownSelect.context";
import { IconBrush } from "~/icons/IconBrush";
import { IconColors } from "~/icons/IconColors";
import type { IconCopy } from "~/icons/IconCopy";
import { IconEarth } from "~/icons/IconEarth";
import { IconGem } from "~/icons/IconGem";
import { IconIdea01 } from "~/icons/IconIdea01";

import type { VibeName } from "./color.utils";

type ColorCategoryDef = {
  display: string;
  description: string;
  Icon: typeof IconCopy;
};
export const colorCategories: {
  [key in VibeName]: ColorCategoryDef;
} = {
  earth: {
    display: "Earth",
    description:
      "These are colors commonly found in nature. They are influenced by the tones of trees, forest, seas and sky and are muted and flat to emulate natural colors.",
    Icon: IconEarth
  },
  fluorescent: {
    display: "Fluorescent",
    description:
      "Fluorescence is a result of photoluminescence. Phosphorescent color emits light when excited by visible or ultraviolet light. These colors are bright and vibrant.",
    Icon: IconIdea01
  },
  jewel: {
    display: "Jewel",
    description:
      "Richly saturated hues named for gems including sapphire blue, ruby red, amethyst purple, citrine yellow, and emerald green. These colors are regal, deep and impart a sense of luxury.",
    Icon: IconGem
  },
  neutral: {
    display: "Neutral",
    description:
      "Pure neutral colors include black, white, beige and all grays while near neutrals include browns, tans, and darker colors.",
    Icon: IconColors
  },
  pastel: {
    display: "Pastel",
    description:
      "Pastel colors belong to the pale family of colors. The colors of this family are usually described as 'soothing'",
    Icon: IconBrush
  }
};

const styles = css`
  ${makeReset("ul")};
`;

const itemStyles = css`
  ${makeReset("button")};
  text-align: left;
  width: ${makeRem(400)};
  display: grid;
  grid-template-columns: ${makeSpace(24)} 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "icon title"
    "icon description";
  column-gap: ${makeSpace(8)};
  font-size: ${makeSpace(12)};
  transition: all 0.1s ease-in-out;
  min-height: ${makeRem(52)};
  align-content: center;
  padding: ${makeSpace(12)} ${makeSpace(16)};

  &:first-child {
    border-top-right-radius: inherit;
    border-top-left-radius: inherit;
  }
  &:last-child {
    border-bottom-right-radius: inherit;
    border-bottom-left-radius: inherit;
  }

  &.active {
    background: ${makeColor("primary", { opacity: 0.2 })};
  }

  .icon {
    grid-area: icon;
    display: grid;
    height: 100%;
    width: 100%;
    place-content: center;
  }
  .title {
    grid-area: title;
    margin-bottom: ${makeSpace(4)};
    font-weight: ${makeFontWeight("mulish-semiBold")};
  }
  .description {
    grid-area: description;
    color: ${makeColor("neutral-light", { opacity: 0.7 })};
    font-size: ${makeRem(11)};
  }
`;

function CategoryItem({
  Icon,
  display,
  description,
  isSelected,
  type
}: ColorCategoryDef & {
  type: string;
  isSelected: boolean;
}) {
  const { onSelect } = useInputDropdownSelectContext();

  return (
    <button className={classes(itemStyles, { active: isSelected })} onClick={() => onSelect(type)}>
      <div className="icon">
        <Icon dxSize={16} />
      </div>
      <div className="title">{display}</div>
      <div className="description">{description}</div>
    </button>
  );
}

export type ColorBrandModeAutoCategorySelectProps<T extends string> = {
  onSelect: (value: T) => void;
  id: string;
  selectedType: VibeName;
};

export function ColorBrandModeAutoCategorySelect<T extends string>(
  props: ColorBrandModeAutoCategorySelectProps<T>
) {
  const handleSelect = useCallback<(value: string) => void>(
    (value) => {
      props.onSelect(value as T);
    },
    [props]
  );

  return (
    <InputDropdownSelect
      dxSize="dense"
      dxOnSelect={handleSelect}
      id={props.id}
      defaultValue={props.selectedType}
      dxOffset={4}
    >
      <ul className={styles}>
        {Object.entries(colorCategories).map(([categoryName, categoryDef]) => {
          return (
            <li key={categoryName}>
              <CategoryItem
                isSelected={props.selectedType === categoryName}
                type={categoryName}
                {...categoryDef}
              />
            </li>
          );
        })}
      </ul>
    </InputDropdownSelect>
  );
}
