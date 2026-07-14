import { type FC, type SVGProps, useCallback, useEffect, useRef, useState } from "react";

import {
  makeColor,
  makeFontFamily,
  makeRem,
  makeReset
} from "@documints/tokens";
import { css } from "@linaria/core";
import type { PagefindUI } from "@pagefind/default-ui";

function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const triggerStyles = css`
  ${makeReset("button")};
  display: flex;
  align-items: center;
  gap: ${makeRem(8)};
  height: ${makeRem(32)};
  padding: 0 ${makeRem(10)};
  border-radius: ${makeRem(6)};
  border: ${makeRem(1)} solid ${makeColor("neutral-100")};
  background: ${makeColor("neutral-50", { opacity: 0.5 })};
  color: ${makeColor("neutral-600")};
  font-family: ${makeFontFamily("source-sans-3")};
  font-size: ${makeRem(13)};
  cursor: pointer;
  transition: all 0.15s ease-in-out;

  &:hover {
    border-color: ${makeColor("neutral-200")};
    color: ${makeColor("neutral-800")};
  }
`;

const kbdStyles = css`
  display: inline-flex;
  align-items: center;
  padding: 0 ${makeRem(5)};
  height: ${makeRem(18)};
  border-radius: ${makeRem(4)};
  border: ${makeRem(1)} solid ${makeColor("neutral-200")};
  font-size: ${makeRem(11)};
  font-family: ${makeFontFamily("source-sans-3")};
  color: ${makeColor("neutral-500")};
`;

const backdropStyles = css`
  position: fixed;
  inset: 0;
  background: ${makeColor("neutral-900", { opacity: 0.5 })};
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
`;

const panelStyles = css`
  width: min(90vw, ${makeRem(640)});
  max-height: 70vh;
  overflow: auto;
  background: ${makeColor("background")};
  border-radius: ${makeRem(12)};
  box-shadow: 0 ${makeRem(24)} ${makeRem(48)} ${makeColor("neutral", { opacity: 0.25 })};
  padding: ${makeRem(16)};
`;

export const LayoutHeaderSearch: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pagefindUIRef = useRef<PagefindUI | null>(null);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((wasOpen) => !wasOpen);
        return;
      }
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Deferred until the modal actually opens, not imported eagerly with the
  // rest of the header - most visits never open search. Opens the same way
  // in `documints dev`, even though Pagefind only indexes the *built* output
  // (see `Documints.writeSearchIndex`) - there's no index to query yet, so
  // it just shows no results, which is enough to check layout/styling here.
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    let cancelled = false;
    void import("@pagefind/default-ui/css/ui.css");
    void import("@pagefind/default-ui").then(({ PagefindUI: PagefindUIClass }) => {
      if (cancelled || !containerRef.current) return;
      pagefindUIRef.current = new PagefindUIClass({
        element: containerRef.current,
        showSubResults: true,
        autofocus: true
      });
    });

    return () => {
      cancelled = true;
      pagefindUIRef.current?.destroy();
      pagefindUIRef.current = null;
    };
  }, [isOpen]);

  return (
    <>
      <button type="button" className={triggerStyles} onClick={() => setIsOpen(true)} title="Search">
        <IconSearch />
        Search
        <kbd className={kbdStyles}>⌘K</kbd>
      </button>
      {isOpen && (
        <div className={backdropStyles} onClick={close}>
          <div className={panelStyles} onClick={(event) => event.stopPropagation()}>
            <div ref={containerRef} />
          </div>
        </div>
      )}
    </>
  );
};
