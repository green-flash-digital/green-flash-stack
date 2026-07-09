import { useCallback, useRef, useState } from "react";
import type { UseTrackingNodeCallback } from "react-hook-primitives";
import { useTrackingNode } from "react-hook-primitives";

import { makeSpace, makeColor, makeFontWeight, makeRem, makePx } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { CodeBlock } from "~/components/CodeBlock";

const codeSampleLinaria = `import { css } from "@linaria/core";
import { makeColor, makeSpace, makeFontVariant, makeSemanticColor } from "~/.chamfer";
\n
const styles = css\`
  font: \${makeFontVariant("heading")};
  background: \${makeColor("primary", { opacity: 0.2 })};
  padding: \${makeSpace(16)};
  border-radius: \${makeSpace(8)};
\`;
\n
export function Card() {
  return <div className={styles}>Hello, Chamfer</div>;
}`;

const codeSampleCompiled = `import { styled } from "@compiled/react";
import { makeColor, makeSpace, makeFontVariant, makeSemanticColor } from "~/.chamfer";
\n
const Card = styled.div\`
  font: \${makeFontVariant("heading")};
  background: \${makeColor("primary", { opacity: 0.2 })};
  padding: \${makeSpace(16)};
  border-radius: \${makeSpace(8)};
  color: \${makeSemanticColor("text-primary")};
\`;
\n
export function CardExample() {
  return <Card>Hello, Chamfer</Card>;
}`;

const codeSampleStyleX = `import * as stylex from "@stylexjs/stylex";
import { makeColor, makeSpace, makeFontVariant, makeSemanticColor } from "~/.chamfer";
\n
const styles = stylex.create({
  card: {
    font: makeFontVariant("heading"),
    background: makeColor("primary", { opacity: 0.2 }),
    padding: makeSpace(16),
    borderRadius: makeSpace(8),
    color: makeSemanticColor("text-primary")
  }
});
\n
export function Card() {
  return <div {...stylex.props(styles.card)}>Hello, Chamfer</div>;
}`;

const codeSamplePanda = `import { css } from "styled-system/css";
import { makeColor, makeSpace, makeFontVariant, makeSemanticColor } from "~/.chamfer";
\n
const cardStyles = css({
  font: makeFontVariant("heading"),
  background: makeColor("primary", { opacity: 0.2 }),
  padding: makeSpace(16),
  borderRadius: makeSpace(8),
  color: makeSemanticColor("text-primary")
});
\n
export function Card() {
  return <div className={cardStyles}>Hello, Chamfer</div>;
}`;

const codeSampleVanillaExtract = `// card.css.ts
import { style } from "@vanilla-extract/css";
import { makeColor, makeSpace, makeFontVariant, makeSemanticColor } from "~/.chamfer";
\n
export const card = style({
  font: makeFontVariant("heading"),
  background: makeColor("primary", { opacity: 0.2 }),
  padding: makeSpace(16),
  borderRadius: makeSpace(8),
  color: makeSemanticColor("text-primary")
});
\n
// Card.tsx
import { card } from "./card.css";
\n
export function Card() {
  return <div className={card}>Hello, Chamfer</div>;
}`;

const codeSamplePigment = `import { styled } from "@pigment-css/react";
import { makeColor, makeSpace, makeFontVariant, makeSemanticColor } from "~/.chamfer";
\n
const Card = styled("div")\`
  font: \${makeFontVariant("heading")};
  background: \${makeColor("primary", { opacity: 0.2 })};
  padding: \${makeSpace(16)};
  border-radius: \${makeSpace(8)};
  color: \${makeSemanticColor("text-primary")};
\`;
\n
export function CardExample() {
  return <Card>Hello, Chamfer</Card>;
}`;

const libraries = [
  { id: "linaria", label: "Linaria", code: codeSampleLinaria },
  { id: "compiled", label: "Compiled", code: codeSampleCompiled },
  { id: "stylex", label: "StyleX", code: codeSampleStyleX },
  { id: "panda", label: "Panda CSS", code: codeSamplePanda },
  { id: "vanilla-extract", label: "Vanilla Extract", code: codeSampleVanillaExtract },
  { id: "pigment", label: "Pigment CSS", code: codeSamplePigment }
] as const;

const tabBarStyles = css`
  display: flex;
  position: relative;
  gap: ${makeSpace(4)};
  padding: ${makeSpace(4)};
  border-radius: ${makeSpace(8)};
  border: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.12 })};

  .tracker {
    position: absolute;
    top: ${makeSpace(4)};
    bottom: ${makeSpace(4)};
    background: ${makeColor("primary", { opacity: 0.15 })};
    border-radius: ${makeSpace(4)};
    transition: all 0.2s ease-in-out;
    z-index: 1;
  }

  button {
    position: relative;
    z-index: 2;
    padding: ${makeSpace(8)} ${makeSpace(12)};
    border: none;
    background: none;
    font-size: ${makeRem(13)};
    font-weight: ${makeFontWeight("mulish-medium")};
    color: ${makeColor("neutral", { opacity: 0.6 })};
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.15s ease-in-out;

    &:hover {
      color: ${makeColor("neutral-dark")};
    }

    &.active {
      color: ${makeColor("primary-700")};
      font-weight: ${makeFontWeight("mulish-bold")};
    }
  }
`;

const panelStyles = css`
  height: 300px;
  width: 100%;
  overflow: auto;
  margin-top: ${makeSpace(16)};
  display: none;

  &.active {
    display: block;
  }
`;

export function HomeCodeSampleTabs() {
  const [activeId, setActiveId] = useState<(typeof libraries)[number]["id"]>("linaria");
  const tabListRef = useRef<HTMLDivElement>(null);

  const moveTracker = useCallback<UseTrackingNodeCallback<HTMLDivElement, HTMLButtonElement>>(
    (button, tracker) => {
      if (!tabListRef.current) return;
      const containerRect = tabListRef.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      tracker.style.left = makePx(buttonRect.left - containerRect.left);
      tracker.style.width = makePx(buttonRect.width);
    },
    []
  );

  const trackerRef = useTrackingNode<HTMLDivElement, HTMLButtonElement>(
    tabListRef,
    "button.active",
    moveTracker,
    { attributeFilter: ["class"] }
  );

  return (
    <div>
      <div className={tabBarStyles} role="tablist" ref={tabListRef}>
        <div className="tracker" ref={trackerRef} />
        {libraries.map((library) => (
          <button
            key={library.id}
            type="button"
            role="tab"
            id={`home-code-sample-tab-${library.id}`}
            aria-selected={activeId === library.id}
            aria-controls={`home-code-sample-panel-${library.id}`}
            className={classes({ active: activeId === library.id })}
            onClick={() => setActiveId(library.id)}
          >
            {library.label}
          </button>
        ))}
      </div>
      {libraries.map((library) => (
        <CodeBlock
          key={library.id}
          role="tabpanel"
          id={`home-code-sample-panel-${library.id}`}
          aria-labelledby={`home-code-sample-tab-${library.id}`}
          className={classes(panelStyles, { active: activeId === library.id })}
          dxCode={library.code}
          dxOptions={{ lang: "tsx" }}
        />
      ))}
    </div>
  );
}
