import { useMemo } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { useConfigurationContext } from "../Config.context";
import { useSizePreviewContext } from "./SizePreview.context";

const containerStyles = css`
  position: relative;
  background: white;
  border-radius: ${makeSpace(8)};
  overflow: hidden;

  &.grid::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent calc(var(--grid) - 1px),
      rgba(99, 102, 241, 0.1) calc(var(--grid) - 1px),
      rgba(99, 102, 241, 0.1) var(--grid)
    );
    pointer-events: none;
    z-index: 1;
  }
`;

const listStyles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
`;

const rowStyles = css`
  display: grid;
  grid-template-columns: ${makeRem(88)} ${makeRem(52)} 1fr;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }

  .name {
    font-size: ${makeRem(12)};
    font-weight: ${makeFontWeight("mulish-semiBold")};
    color: #374151;
    padding: 0 ${makeSpace(12)};
  }

  .value {
    font-size: ${makeRem(11)};
    color: #6b7280;
    font-variant-numeric: tabular-nums;
    font-family: "Consolas", monospace;
    padding: 0 ${makeSpace(8)};
  }

  .bar {
    height: 100%;
    background: ${makeColor("primary-500", { opacity: 0.1 })};
    border-left: ${makeRem(2)} solid ${makeColor("primary-400")};
  }
`;

export function SizePreviewContent() {
  const {
    state: {
      sizing: { baselineGrid, size }
    }
  } = useConfigurationContext();
  const { showGrid } = useSizePreviewContext();

  const sorted = useMemo(
    () => Object.entries(size.variants).sort((a, b) => a[1].value - b[1].value),
    [size.variants]
  );

  return (
    <div
      className={classes(containerStyles, { grid: showGrid })}
      style={{ "--grid": `${baselineGrid}px` } as React.CSSProperties}
    >
      <ul className={listStyles}>
        {sorted.map(([id, variant]) => (
          <li key={id} className={rowStyles} style={{ height: variant.value }}>
            <span className="name">{variant.name}</span>
            <span className="value">{variant.value}px</span>
            <div className="bar" />
          </li>
        ))}
      </ul>
    </div>
  );
}
