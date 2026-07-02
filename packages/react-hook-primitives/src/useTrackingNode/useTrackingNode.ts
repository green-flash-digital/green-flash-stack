import type { MutableRefObject } from "react";
import { useRef, useCallback, useEffect } from "react";

export type UseTrackingNodeCallback<TrackingNode, ObservedNode> = (
  observedNode: ObservedNode,
  trackingNode: TrackingNode
) => void;
/**
 * Hook to observe changes in the DOM within a parent element and execute a callback when
 * a child element matching a specific query selector is detected or updated.
 *
 * This is useful for scenarios where you need to track and react to DOM changes in a specific
 * area of the document, such as dynamically updating elements or attributes.
 * 
 * @example
 * // This is moving a tab active indicator to the anchor element when the classList
 * // on the anchor has .active class
 * export const NavTabs = forwardRef<HTMLElement, NavTabsProps>(function NavTabs(
  { children, className, ...restProps },
  forwardedRef
) {
  const navRef = useForwardedRef(forwardedRef);

  const moveNode = useCallback<
    UseTrackingNodeCallback<HTMLDivElement, HTMLAnchorElement>
  >((anchor, div) => {
    if (!navRef.current) return;

    const rect = anchor.getBoundingClientRect();
    div.style.left = makePx(rect.left - navRef.current.offsetLeft);
    div.style.width = makePx(rect.width);
  }, []);

  const divRef = useTrackingNode<HTMLDivElement, HTMLAnchorElement>(
    navRef,
    "a.active",
    moveNode,
    { attributeFilter: ["class"] }
  );

  return (
    <nav {...restProps} className={classes(styles, className)} ref={navRef}>
      <div ref={divRef} className={divStyles} />
      {children}
    </nav>
  );
});
 */
export function useTrackingNode<
  TrackingNode extends HTMLElement,
  ObservedNode extends HTMLElement = HTMLElement
>(
  parentRef: MutableRefObject<HTMLElement | null>,
  querySelector: string,
  callback: UseTrackingNodeCallback<TrackingNode, ObservedNode>,
  options?: {
    attributeFilter?: string[];
  }
) {
  const trackingRef = useRef<TrackingNode | null>(null);

  const runCallback = useCallback(() => {
    if (!parentRef.current || !trackingRef.current) return;
    const node = parentRef.current.querySelector<ObservedNode>(querySelector);
    if (!node) return;
    callback(node, trackingRef.current);
  }, [callback, parentRef, querySelector]);

  useEffect(() => {
    if (!parentRef.current) return;

    const Observer = new MutationObserver(() => {
      if (!parentRef.current || !trackingRef.current) return;
      runCallback();
    });

    Observer.observe(parentRef.current, {
      attributes: true,
      subtree: true,
      attributeFilter: options?.attributeFilter,
    });

    // run the callback on the first render
    runCallback();

    return () => {
      Observer.disconnect();
    };
  }, [
    querySelector,
    callback,
    options?.attributeFilter,
    parentRef,
    runCallback,
  ]);

  return trackingRef;
}
