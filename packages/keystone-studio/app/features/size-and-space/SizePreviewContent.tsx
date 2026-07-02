import { useEffect, useRef } from "react";
import { classes } from "@green-flash/ts-utils/isomorphic";

import { makeSpace, makeColor, makePx, makeRem, makeReset } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { useConfigurationContext } from "../Config.context";
import { useSizePreviewContext } from "./SizePreview.context";

const styles = css`
  position: relative;
  min-height: 100%;
  width: calc(var(--container-width) + 1);
  height: calc(var(--container-min-height) + 1);
  /* min-height: calc(var(--container-min-height) + 1); */
  margin: 0 auto auto auto;
  background-color: #fff;
  overflow: hidden;
  font-size: var(--base-font-size);
  border: var(--baseline-grid) solid ${makeColor("secondary-200", { opacity: 0.2 })};

  &.grid {
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      /* background-image: linear-gradient(
          to right,
          rgba(0, 0, 0, 0.1) 1px,
          transparent 1px
        ),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px); */
      background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
      background-size: var(--baseline-grid) var(--baseline-grid);
      z-index: 1;
      pointer-events: none;
    }
  }
`;

const ulStyles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
  gap: var(--baseline-grid);

  li {
    display: flex;
    gap: var(--baseline-grid);
  }

  input,
  button {
    font-size: 0.75em;
    padding: 0 1em;
  }

  .icon {
    display: grid;
    place-content: center;
    border: 1px solid ${makeColor("secondary-600")};
    font-size: 0.5em;
    border-radius: ${makeSpace(4)};
  }
`;

export function SizePreviewContent() {
  const {
    state: {
      sizing: { baselineGrid, baseFontSize, size }
    }
  } = useConfigurationContext();
  const { showGrid } = useSizePreviewContext();
  const ref = useRef<HTMLDivElement | null>(null);

  // Update the size variants each time the baseline grid changes
  // This ensures that each time the baseline grid updates, the variants
  // are all divisible by the new baseline grid and the example always
  // lines up on the lines
  useEffect(() => {
    if (!ref.current) return;
    // Get the real width of the container
    const realWidth = ref.current.offsetWidth;
    const realHeight = ref.current.offsetHeight;

    // Calculate the width that the container should be based upon the baseline grid
    // this makes it a completely divisible grid
    const adjWidth = Math.floor(realWidth / baselineGrid) * baselineGrid;
    const adjHeight = Math.floor(realHeight / baselineGrid) * baselineGrid;
    const adjMin = Math.floor(300 / baselineGrid) * baselineGrid;

    // set some custom properties based upon those calculated values
    ref.current.style.setProperty("--container-min-height", makePx(adjMin));
    ref.current.style.setProperty("--container-width", makePx(adjWidth));
    ref.current.style.setProperty("--container-height", makePx(adjHeight));
  }, [baselineGrid]);

  return (
    <div style={{ height: "400px" }}>
      <div
        ref={ref}
        style={{
          // @ts-expect-error custom properties are OK
          "--base-font-size": `${baseFontSize}px`,
          "--baseline-grid": `${baselineGrid}px`
        }}
        className={classes(styles, {
          grid: showGrid
        })}
      >
        <ul className={ulStyles}>
          {Object.entries(size.variants).map(([variantId, variant]) => (
            <li key={variantId}>
              <button style={{ height: variant.value }}>btn - {variant.name}</button>
              <input style={{ height: variant.value }} defaultValue={`input - ${variant.name}`} />
              <div className="icon" style={{ height: variant.value, aspectRatio: "1 / 1" }}>
                icon
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
