import { useMemo } from "react";
import { makeSpace, makeColor, makeRem, makeReset } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { Fragment } from "react/jsx-runtime";

import type { ConfigurationStateSizeAndSpace_SpaceVariants } from "../studio.state";

const styles = css`
  ${makeReset("ul")};

  font-size: ${makeRem(12)};
  display: grid;
  grid-template-columns: ${makeRem(80)} ${makeRem(48)} ${makeRem(64)} 1fr;
  gap: ${makeSpace(8)} ${makeSpace(16)};
  align-items: center;

  .meta {
    color: ${makeColor("neutral-light", { opacity: 0.5 })};
    font-variant-numeric: tabular-nums;
  }

  .bar-track {
    height: ${makeSpace(8)};
    background: ${makeColor("neutral-light", { opacity: 0.08 })};
    border-radius: ${makeSpace(4)};
    overflow: hidden;
  }

  .bar {
    height: 100%;
    background: ${makeColor("secondary-300")};
    border-radius: ${makeSpace(4)};
    min-width: ${makeSpace(2)};
  }
`;

export function SpacePreviewContentVariants(props: {
  baseFontSize: number;
  variants: ConfigurationStateSizeAndSpace_SpaceVariants;
}) {
  const maxValue = useMemo(
    () => Math.max(...Object.values(props.variants).map((v) => v.value), 1),
    [props.variants]
  );

  const sorted = useMemo(
    () => Object.entries(props.variants).sort((a, b) => a[1].value - b[1].value),
    [props.variants]
  );

  return (
    <div className={styles}>
      {sorted.map(([id, { name, value }]) => (
        <Fragment key={id}>
          <div>{name}</div>
          <div className="meta">{value}px</div>
          <div className="meta">{(value / props.baseFontSize).toFixed(3)}rem</div>
          <div className="bar-track">
            <div className="bar" style={{ width: `${(value / maxValue) * 100}%` }} />
          </div>
        </Fragment>
      ))}
    </div>
  );
}
