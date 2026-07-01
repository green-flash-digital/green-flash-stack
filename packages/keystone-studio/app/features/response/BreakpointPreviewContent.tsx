import type { MouseEventHandler, RefCallback } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { classes } from "react-hook-primitives";

import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makePx,
  makeRem,
  makeReset
} from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { useConfigurationContext } from "../Config.context";
import type { ConfigurationStateResponseBreakpointValue } from "./response.utils";

const styles = css`
  /* background: #272727; */
  padding: 1rem;

  .points {
    ${makeReset("ul")};
    display: flex;
    justify-content: center;
    gap: ${makeSpace(16)};
    padding: ${makeSpace(16)};
    margin-bottom: ${makeSpace(16)};

    li {
      & + li {
        & > div {
          border-left: 1px solid
            ${makeColor("neutral-light", {
              opacity: 0.4
            })};
        }
      }
    }

    button {
      ${makeReset("button")};
      width: min-content;
      height: ${makeSpace(44)};
      display: grid;
      place-content: center;
      padding: ${makeSpace(16)};
      color: ${makeColor("neutral-light", { opacity: 0.5 })};
      .title {
        font-size: ${makeRem(18)};
      }
      .name {
        font-size: ${makeRem(14)};
        font-weight: ${makeFontWeight("mulish-light")};
      }
      &.active {
        color: ${makeColor("neutral")};
      }
    }
  }

  .grid {
    ${makeReset("ul")};
    position: relative;
    width: 100%;
    height: ${makeRem(200)};
    padding-top: ${makeSpace(24)};

    .line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      margin: 0 auto;
      border-left: 1px solid rgb(var(--color));
      border-right: 1px solid rgb(var(--color));
      width: initial;
      transition: all 0.3s ease-in-out;

      button {
        ${makeReset("button")};
        width: 100%;
        height: ${makeSpace(24)};
        font-size: ${makeSpace(12)};
        display: grid;
        place-content: center;
        cursor: pointer;
        background: ${makeColor("neutral-light", { opacity: 0.1 })};
        transition: all 0.3s ease-in-out;

        & > span {
          display: none;
          color: white;
          z-index: 12;
        }
        &:hover {
          background: rgba(var(--color), 0.8);

          & > span {
            display: initial;
          }
        }
      }
    }

    .page {
      background: white;
      position: relative;
      z-index: 20;
      padding: 1rem;
      height: ${`calc(100% - ${makeSpace(8)})`};
      border-radius: ${makeSpace(4)};
      box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
      margin-top: ${makeSpace(8)};
      margin-left: auto;
      margin-right: auto;
      border: 2px solid transparent;
      transition: width 0.2s ease-in-out;
      display: grid;
      place-content: center;
    }
  }
`;

const colors = [
  "255, 191, 0", // Amber
  "176, 30, 86", // Raspberry
  "15, 82, 186", // Sapphire
  "0, 168, 107", // Jade
  "103, 58, 183", // Deep Purple
  "11, 218, 81", // Malachite
  "218, 165, 32", // Goldenrod
  "155, 17, 30", // Ruby Red
  "64, 224, 208", // Turquoise
  "138, 43, 226", // Violet
  "193, 84, 193", // Fuchsia
  "228, 208, 10", // Citrine
  "0, 128, 128", // Teal
  "223, 124, 223" // Plum
];

type State = ConfigurationStateResponseBreakpointValue & {
  id: string;
  samplePageWidth: string;
};

export function BreakpointPreviewContent() {
  const { response } = useConfigurationContext();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [activeBreakpoint, setActiveBreakpoint] = useState<State | undefined>(undefined);

  const maxBreakpoint = useMemo(
    () =>
      Object.values(response.breakpoints).reduce((accum, { value }) => {
        if (value > accum) return value;
        return accum;
      }, 0),
    [response.breakpoints]
  );

  const calculateBreakpointSectionWidth = useCallback<
    (maxSize: number, containerWidth: number, width: number) => number
  >((maxSize, containerWidth, width) => {
    const scalingFactor = containerWidth / maxSize;
    const scaledValue = width * scalingFactor;
    return scaledValue;
  }, []);

  const calculateAndSetActiveBreakpoint = useCallback<
    (
      breakpointId: string,
      breakpoint: ConfigurationStateResponseBreakpointValue,
      breakpointSectionWidth: number
    ) => void
  >((breakpointId, breakpoint, breakpointSectionWidth) => {
    setActiveBreakpoint({
      ...breakpoint,
      id: breakpointId,
      samplePageWidth: `calc(${makePx(breakpointSectionWidth)} - 2px)`
    });
  }, []);

  const createBreakpointSection = useCallback<
    (
      breakpointId: string,
      breakpoint: ConfigurationStateResponseBreakpointValue,
      isActive: boolean
    ) => RefCallback<HTMLDivElement>
  >(
    (breakpointId, breakpoint, isActive) => (node) => {
      if (!node) return;
      const container = node.parentElement;
      if (!container) return;
      const containerWidth = gridRef.current?.offsetWidth ?? container.offsetWidth;
      const breakpointSectionWidth = calculateBreakpointSectionWidth(
        maxBreakpoint,
        containerWidth,
        breakpoint.value
      );
      node.style.setProperty("width", makePx(breakpointSectionWidth));

      if (!isActive) return;
      calculateAndSetActiveBreakpoint(breakpointId, breakpoint, breakpointSectionWidth);
    },
    [calculateBreakpointSectionWidth, maxBreakpoint, calculateAndSetActiveBreakpoint]
  );

  const createHandleClick = useCallback<
    (
      breakpointId: string,
      breakpoint: ConfigurationStateResponseBreakpointValue
    ) => MouseEventHandler<HTMLButtonElement>
  >(
    (breakpointId, breakpoint) => () => {
      if (!gridRef.current) return;
      const breakpointSectionWidth = calculateBreakpointSectionWidth(
        maxBreakpoint,
        gridRef.current.offsetWidth,
        breakpoint.value
      );
      calculateAndSetActiveBreakpoint(breakpointId, breakpoint, breakpointSectionWidth);
    },
    [calculateAndSetActiveBreakpoint, calculateBreakpointSectionWidth, maxBreakpoint]
  );

  const breakpointEntires = useMemo(
    () => Object.entries(response.breakpoints).sort((a, b) => a[1].value - b[1].value),
    [response.breakpoints]
  );

  return (
    <div className={styles}>
      <ul className="points">
        {breakpointEntires.reverse().map(([breakpointId, breakpoint]) => (
          <li key={breakpointId}>
            <button
              onClick={createHandleClick(breakpointId, breakpoint)}
              className={classes({
                active: breakpointId === activeBreakpoint?.id
              })}
            >
              <div className="title">{makePx(breakpoint.value)}</div>
              <div className="name">{breakpoint.name}</div>
            </button>
          </li>
        ))}
      </ul>
      <div className="grid" ref={gridRef}>
        {useMemo(
          () => (
            <div>
              {breakpointEntires.map(([breakpointId, breakpoint], i) => (
                <div
                  className="line"
                  key={breakpointId}
                  ref={createBreakpointSection(breakpointId, breakpoint, i === 0)}
                  // @ts-expect-error custom properties are valid
                  style={{ "--color": colors[i] }}
                >
                  <button onClick={createHandleClick(breakpointId, breakpoint)}>
                    <span>{makePx(breakpoint.value)}</span>
                  </button>
                </div>
              ))}
            </div>
          ),
          [breakpointEntires, createBreakpointSection, createHandleClick]
        )}
        <div
          className="page"
          ref={pageRef}
          style={{
            width: activeBreakpoint?.samplePageWidth ?? "initial"
          }}
        >
          {activeBreakpoint?.name}
        </div>
      </div>
    </div>
  );
}
