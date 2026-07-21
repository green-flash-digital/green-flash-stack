import { Suspense } from "react";

import { makeColor, makeFontFamily, makeFontWeight, makeRem, makeReset } from "@documints/tokens";
import { css } from "@linaria/core";
import { useMenu } from "@stratum-ui/react/menu";

import type { DocumintConfigHeaderLinkTypeDropdown } from "../../config/config.utils.js";
import { IconComponent } from "./icons/IconComponent.js";

const buttonStyles = css`
  ${makeReset("button")};
  font-size: ${makeRem(16)};
  font-family: ${makeFontFamily("source-sans-3")};
  cursor: pointer;

  display: flex;
  gap: ${makeRem(8)};
  align-items: center;

  &:hover {
    color: ${makeColor("primary")};
  }

  &.active {
    color: ${makeColor("primary")};
    font-weight: ${makeFontWeight("source-sans-3-bold")};
  }
`;

const dropdownStyles = css`
  border: none;
  filter: drop-shadow(3px 8px 28px rgba(130, 130, 130, 0.3));
  border-radius: 0.5rem;
  padding: 0;
  min-width: 200px;

  opacity: 0;
  transform: scale(0.9);
  transition:
    opacity 0.15s,
    transform 0.15s,
    display 0.15s allow-discrete,
    overlay 0.15s allow-discrete;

  &:popover-open {
    opacity: 1;
    transform: scale(1);
  }

  @starting-style {
    &:popover-open {
      opacity: 0;
      transform: scale(0.9);
    }
  }

  ul {
    ${makeReset("ul")};
    padding: ${makeRem(16)} 0;

    a {
      ${makeReset("anchor")};
      font-family: ${makeFontFamily("source-sans-3")};
      display: grid;
      grid-template-columns: ${makeRem(48)} auto;
      gap: ${makeRem(8)};
      align-items: center;
      padding: ${makeRem(8)} ${makeRem(16)};

      &:not(:has(img)) {
        grid-template-columns: auto;
      }

      img {
        max-height: ${makeRem(36)};
        justify-self: center;
        align-self: middle;
        max-width: auto;
        object-fit: contain;
        place-content: center;
      }

      .title {
        font-size: ${makeRem(16)};
        font-weight: ${makeFontWeight("source-sans-3-semiBold")};
      }

      .sub-title {
        font-size: ${makeRem(14)};
        color: ${makeColor("neutral-500")};
      }

      &.active,
      &:hover,
      &:focus-visible {
        .title,
        .sub-title {
          color: ${makeColor("primary")};
        }
      }
    }
  }
`;

export function LayoutHeaderLinksTypeDropdown(props: DocumintConfigHeaderLinkTypeDropdown) {
  const menu = useMenu({
    position: "bottom-span-left",
    offset: 16,
    load: () => import("./LayoutHeaderLinksTypeDropdownContent.js")
  });
  const Content = menu.Content;

  return (
    <>
      <button
        type="button"
        className={buttonStyles}
        ref={menu.triggerRef}
        onMouseEnter={menu.preload}
        onFocus={menu.preload}
      >
        {props.text}
        <IconComponent icon="arrow-down-stroke-rounded" ddSize={24} />
      </button>
      <div ref={menu.menuRef} className={dropdownStyles}>
        {menu.shouldRenderContent && Content && (
          <Suspense fallback={null}>
            <Content items={props.items} getItemRef={menu.getItemRef} />
          </Suspense>
        )}
      </div>
    </>
  );
}
