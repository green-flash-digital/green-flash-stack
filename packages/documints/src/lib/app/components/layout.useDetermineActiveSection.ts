import { useCallback, useEffect, useRef } from "react";

/**
 * Custom hook to determine and set the active section based on the current pathname.
 * It uses IntersectionObserver to track which heading is currently in view and updates
 * the corresponding anchor link to an active state.
 */
export function useDetermineActiveSection(pathname: string) {
  const headingsRef = useRef<NodeListOf<HTMLHeadingElement> | null>(null);
  const anchorsRef = useRef<NodeListOf<HTMLAnchorElement> | null>(null);
  const activeHashRef = useRef<string | null>(null);

  const getHeadings = useCallback(() => {
    if (!headingsRef.current) {
      headingsRef.current =
        document.querySelectorAll<HTMLHeadingElement>(".heading");
    }
    return headingsRef.current;
  }, []);

  const getAnchors = useCallback(() => {
    if (!anchorsRef.current) {
      anchorsRef.current =
        document.querySelectorAll<HTMLAnchorElement>(".contents-link");
    }
    return anchorsRef.current;
  }, []);

  // doing this because I think prop drilling and the stateful way of doing this
  // is going to a be a bit too much
  const setActiveAnchor = useCallback<(activeHash: string) => void>(
    (activeHash) => {
      const anchors = getAnchors();
      // biome-ignore lint/complexity/noForEach: Using a native iterator on the prototype
      anchors.forEach((anchor) => {
        const anchorHash = anchor.hash;

        if (anchorHash === activeHash && !anchor.classList.contains("active")) {
          anchor.classList.add("active");
        }

        if (anchorHash !== activeHash) {
          anchor.classList.remove("active");
        }
      });
    },
    [getAnchors]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want this to change anytime the page is changed
  useEffect(() => {
    if (typeof window === "undefined") return;

    const headings = getHeadings();

    function handleScroll() {
      // biome-ignore lint/complexity/noForEach: <explanation>
      headings.forEach((heading) => {
        const headingHash = `#${heading.id}`;
        const top = heading.getBoundingClientRect().top;
        if (top < 65 && top > 0 && activeHashRef.current !== headingHash) {
          activeHashRef.current = headingHash;
          setActiveAnchor(headingHash);
        }
      });
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [getHeadings, pathname, setActiveAnchor]);
}
