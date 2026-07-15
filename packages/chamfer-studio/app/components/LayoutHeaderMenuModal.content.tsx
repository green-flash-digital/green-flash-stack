import type { RefCallback } from "react";
import { useCallback } from "react";
import { NavLink } from "react-router";
import { useModalContext } from "@stratum-ui/react/modal";

import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { IconSettings05 } from "~/icons/IconSettings05";

import { ModalBody } from "./ModalBody";
import { ModalHeader } from "./ModalHeader";

const styles = css`
  a {
    ${makeReset("anchor")};

    &.active {
      .item {
        background-color: ${makeColor("primary-100", { opacity: 0.2 })};
      }
    }
  }

  ul {
    ${makeReset("ul")};
    display: flex;
    flex-direction: column;
    gap: ${makeSpace(16)};
  }

  .item {
    width: ${makeRem(360)};
    padding: ${makeSpace(16)};
    border-radius: ${makeSpace(8)};
    display: grid;
    column-gap: ${makeSpace(16)};
    grid-template-columns: ${makeSpace(44)} auto;

    .icon {
      & > div {
        grid-area: icon;
        border-radius: ${makeSpace(8)};
        display: grid;
        place-content: center;
        width: 100%;
        aspect-ratio: 1 / 1;
      }
      &.v-a {
        & > div {
          background: ${makeColor("primary")};
          color: white;
        }
      }
      &.v-b {
        & > div {
          background: ${makeColor("secondary")};
          color: ${makeColor("secondary-900")};
        }
      }
    }

    div {
      .title {
        font-size: ${makeSpace(16)};
        font-weight: ${makeFontWeight("mulish-bold")};
      }

      .sub {
        margin-top: ${makeSpace(4)};
        font-size: ${makeRem(14)};
        color: ${makeColor("neutral-light", { opacity: 0.8 })};
      }
    }
  }
`;

export default function LayoutHeaderMenuModalContent() {
  const { closeModal } = useModalContext();

  /**
   * Callback ref to add a listener to all of the links
   * to close the modal once clicked
   */
  const ref = useCallback<RefCallback<HTMLDivElement>>(
    (node) => {
      if (!node) return;
      const anchors = node.getElementsByTagName("a");
      for (const anchor of anchors) {
        anchor.addEventListener("click", closeModal);
      }

      return () => {
        for (const anchor of anchors) {
          anchor.removeEventListener("click", closeModal);
        }
      };
    },
    [closeModal]
  );

  return (
    <>
      <ModalHeader>Options</ModalHeader>
      <ModalBody ref={ref} className={styles}>
        <ul>
          <li>
            <NavLink to="/config">
              <div className="item">
                <div className="icon v-a">
                  <div>
                    <IconSettings05 dxSize={28} />
                  </div>
                </div>
                <div>
                  <div className="title">Configure</div>
                  <div className="sub">
                    View, edit and save changes to your tokens configuration
                  </div>
                </div>
              </div>
            </NavLink>
          </li>
        </ul>
      </ModalBody>
    </>
  );
}
