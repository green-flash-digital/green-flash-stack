import { useMemo } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { ColorAccessibilityChecker, getAccessibleTextColor } from "@chamfer-css/core/utils";
import {
  makeColor,
  makeFontFamily,
  makeFontWeight,
  makeRem,
  makeSpace
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { useConfigurationContext } from "~/features/Config.context";

import { buildFlatColorManifest } from "./color.utils";
import { ColorPreviewContainer } from "./ColorPreviewContainer";

const checker = new ColorAccessibilityChecker();

const emptyStyles = css`
  padding: ${makeSpace(32)};
  font-family: ${makeFontFamily("inter")};
  font-size: ${makeRem(13)};
  color: ${makeColor("neutral", { opacity: 0.5 })};
  text-align: center;
`;

const listStyles = css`
  list-style: none;
  margin: 0;
  padding: ${makeSpace(16)};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(12)};
`;

const rowStyles = css`
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(8)};

  .role-name {
    font-family: ${makeFontFamily("consolas")};
    font-size: ${makeRem(11)};
    font-weight: ${makeFontWeight("mulish-semiBold")};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${makeColor("neutral", { opacity: 0.7 })};
  }

  .swatches {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-radius: ${makeSpace(8)};
    overflow: hidden;
  }
`;

const swatchStyles = css`
  padding: ${makeSpace(12)} ${makeSpace(12)};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(4)};

  .scheme {
    font-family: ${makeFontFamily("consolas")};
    font-size: ${makeRem(10)};
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .token {
    font-family: ${makeFontFamily("consolas")};
    font-size: ${makeRem(11)};
    font-weight: ${makeFontWeight("mulish-medium")};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge {
    margin-top: ${makeSpace(4)};
    display: inline-flex;
    align-items: center;
    gap: ${makeSpace(4)};
    font-size: ${makeRem(10)};
    font-weight: ${makeFontWeight("mulish-semiBold")};
    padding: ${makeSpace(4)} ${makeSpace(8)};
    border-radius: ${makeSpace(4)};

    &.pass {
      background: rgba(0, 0, 0, 0.15);
    }
    &.fail {
      background: rgba(255, 80, 80, 0.3);
    }
  }

  &.unknown {
    background: ${makeColor("neutral-light")};
    color: ${makeColor("neutral", { opacity: 0.5 })};
    font-family: ${makeFontFamily("consolas")};
    font-size: ${makeRem(11)};
    font-style: italic;
  }
`;

function SemanticSwatch({
  label,
  oklch,
  scheme
}: {
  label: string;
  oklch: string | undefined;
  scheme: "light" | "dark";
}) {
  if (!oklch) {
    return (
      <div className={classes(swatchStyles, "unknown")}>
        <span className="scheme">{scheme}</span>
        <span className="token">{label || "—"}</span>
        <span className="badge fail">Unknown token</span>
      </div>
    );
  }

  const textColorName = getAccessibleTextColor(oklch);
  const textHex = textColorName === "white" ? "#ffffff" : "#000000";
  const { compliance } = checker.analyze(textHex, oklch, 14);

  return (
    <div className={swatchStyles} style={{ background: oklch, color: textHex }}>
      <span className="scheme">{scheme}</span>
      <span className="token">{label}</span>
      <span className={classes("badge", compliance.AA ? "pass" : "fail")}>
        {compliance.contrast}:1 {compliance.AA ? "AA ✓" : "AA ✗"}
      </span>
    </div>
  );
}

export function SemanticPreviewContent() {
  const { state } = useConfigurationContext();
  const colorManifest = useMemo(() => buildFlatColorManifest(state.color), [state.color]);
  const entries = Object.values(state.semantic);

  if (entries.length === 0) {
    return (
      <ColorPreviewContainer>
        <div className={emptyStyles}>
          No semantic roles defined yet. Add a role below to get started.
        </div>
      </ColorPreviewContainer>
    );
  }

  return (
    <ColorPreviewContainer>
      <ul className={listStyles}>
        {entries.map((entry) => (
          <li key={entry.role} className={rowStyles}>
            <span className="role-name">{entry.role || "unnamed"}</span>
            <div className="swatches">
              <SemanticSwatch
                label={entry.light}
                oklch={colorManifest[entry.light]}
                scheme="light"
              />
              <SemanticSwatch label={entry.dark} oklch={colorManifest[entry.dark]} scheme="dark" />
            </div>
          </li>
        ))}
      </ul>
    </ColorPreviewContainer>
  );
}
