import {
  makeColor,
  makeCustom,
  makeFontWeight,
  makeRem,
  makeReset,
} from "@buttery/tokens/docs";
import { css } from "@linaria/core";
import type { Toc as TableOfContents } from "@stefanprobst/rehype-extract-toc";
import { type FC, type MouseEventHandler, useCallback, useMemo } from "react";

import { LayoutTextOverline } from "./LayoutTextOverline.js";

const layoutBodyStyles = css`
  grid-area: layout-toc;
  background: ${makeColor("background")};

  & > div {
    padding: ${makeRem(32)};
    position: sticky;
    top: ${makeCustom("layout-header-height")};

    &:before {
      content: "";
      display: block;
      left: 0;
      position: absolute;
      top: ${makeRem(32)};
      bottom: ${makeRem(32)};
      width: ${makeRem(1)};
      border-left: ${makeRem(1)} solid
        ${makeColor("neutral-50", { opacity: 0.5 })};
    }
  }
`;

const ulStyles = css`
  ${makeReset("ul")};

  & ul {
    padding-left: ${makeRem(16)};
  }

  li {
    a {
      ${makeReset("anchor")};
      display: flex;
      align-items: center;
      height: ${makeRem(32)};
      color: ${makeColor("neutral")};
      transition: all 0.15s ease-in-out;
      font-size: ${makeRem(14)};

      &:not(.active) {
        &:hover {
          color: ${makeColor("secondary")};
          text-decoration: underline;
        }
      }

      &.active {
        color: ${makeColor("secondary")};
        font-weight: ${makeFontWeight("Source Sans 3-semiBold")};
      }
    }
  }
`;

const overlineStyles = css`
  margin-bottom: ${makeRem(16)};
`;

export function ContentsNode({
  tableOfContents,
}: {
  tableOfContents: TableOfContents;
}) {
  const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>((e) => {
    e.preventDefault();
    const anchorHash = e.currentTarget.hash;
    window.history.replaceState(null, "", anchorHash);
    // get the heading with the ID of hash
    const headingWithIdOfAnchorHash =
      document.querySelector<HTMLHeadingElement>(anchorHash);
    const header = document.querySelector<HTMLElement>("header");
    if (!headingWithIdOfAnchorHash || !header) return;
    const offset =
      headingWithIdOfAnchorHash.offsetTop - header.offsetHeight + 64;

    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  }, []);

  return tableOfContents.map((toc, i) => {
    if (toc.depth > 3) return null;
    const tocChildren = toc.children ?? [];
    return (
      <li key={toc.id}>
        <a href={`#${toc.id}`} onClick={handleClick} className="contents-link">
          {toc.value}
        </a>
        {tocChildren.length > 0 && (
          <ul key={`group-${toc.depth}-${i}`}>
            <ContentsNode tableOfContents={tocChildren} />
          </ul>
        )}
      </li>
    );
  });
}

export type LayoutBodyTOCProps = {
  tableOfContents: TableOfContents | null;
};

export const LayoutBodyTOC: FC<LayoutBodyTOCProps> = ({ tableOfContents }) => {
  return (
    <article className={layoutBodyStyles}>
      <div>
        {useMemo(
          () => (
            <LayoutTextOverline className={overlineStyles}>
              on this page
            </LayoutTextOverline>
          ),
          []
        )}
        <ul className={ulStyles}>
          <ContentsNode
            tableOfContents={tableOfContents?.[0]?.children ?? []}
          />
        </ul>
      </div>
    </article>
  );
};
