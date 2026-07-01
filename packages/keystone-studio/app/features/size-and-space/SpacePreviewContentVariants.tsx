import { makeSpace, makeColor, makeRem, makeReset } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { Fragment } from "react/jsx-runtime";

import type { ConfigurationStateSizeAndSpace_SpaceVariants } from "./size-and-space.utils.js";

const styles = css`
  ${makeReset("ul")};

  font-size: ${makeSpace(12)};
  display: grid;
  grid-template-columns: auto auto auto 1fr;
  grid-template-rows: auto;
  gap: ${makeSpace(16)};
  align-items: center;

  .px,
  .rem {
    color: ${makeColor("neutral-light", { opacity: 0.6 })};
  }

  .bar {
    height: 100%;
    background: ${makeColor("secondary-300")};
  }
`;

export function SpacePreviewContentVariants(props: {
  baseFontSize: number;
  variants: ConfigurationStateSizeAndSpace_SpaceVariants;
}) {
  return (
    <div className={styles}>
      {Object.entries(props.variants).map(([id, { name, value }]) => {
        return (
          <Fragment key={id}>
            <div>{name}</div>
            <div className="px">{value}px</div>
            <div className="rem">{value / props.baseFontSize}rem</div>
            <div className="bar" style={{ height: value }} />
          </Fragment>
        );
      })}
    </div>
  );
}
