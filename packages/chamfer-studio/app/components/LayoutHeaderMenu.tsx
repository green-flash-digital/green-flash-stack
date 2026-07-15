import { makeReset, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { IconMenu11 } from "~/icons/IconMenu11";

import { layoutHeaderMenuModalController } from "./LayoutHeaderMenuModal.controller";

const styles = css`
  justify-self: end;
  .menu {
    ${makeReset("button")};
    height: ${makeRem(52)};
    aspect-ratio: 1 / 1;
    display: grid;
    place-content: center;
  }
`;

export function LayoutHeaderMenu() {
  return (
    <div className={styles}>
      <button className="menu" onClick={layoutHeaderMenuModalController.launch}>
        <IconMenu11 dxSize={24} />
      </button>
      <layoutHeaderMenuModalController.Component />
    </div>
  );
}
