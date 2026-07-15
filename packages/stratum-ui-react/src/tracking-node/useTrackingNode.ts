import type { MutableRefObject } from "react";
import { useCallback, useEffect, useRef } from "react";

export type UseTrackingNodeCallback<TrackingNode, ObservedNode> = (
  observedNode: ObservedNode,
  trackingNode: TrackingNode
) => void;

/**
 * Observes DOM mutations within a parent element and invokes a callback
 * whenever a child matching `querySelector` is detected or updated —
 * useful for moving a "tracking" node (e.g. an animated tab indicator) to
 * follow whichever descendant currently matches, without re-rendering React
 * state on every mutation.
 *
 * @example
 * // Moves a tab's active-indicator div to sit under whichever anchor
 * // currently has the `.active` class.
 * const moveNode = useCallback<UseTrackingNodeCallback<HTMLDivElement, HTMLAnchorElement>>(
 *   (anchor, div) => {
 *     const rect = anchor.getBoundingClientRect();
 *     div.style.left = `${rect.left}px`;
 *     div.style.width = `${rect.width}px`;
 *   },
 *   []
 * );
 * const divRef = useTrackingNode<HTMLDivElement, HTMLAnchorElement>(navRef, "a.active", moveNode, {
 *   attributeFilter: ["class"]
 * });
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

    const observer = new MutationObserver(() => {
      if (!parentRef.current || !trackingRef.current) return;
      runCallback();
    });

    observer.observe(parentRef.current, {
      attributes: true,
      subtree: true,
      attributeFilter: options?.attributeFilter
    });

    // run the callback on the first render
    runCallback();

    return () => {
      observer.disconnect();
    };
  }, [querySelector, callback, options?.attributeFilter, parentRef, runCallback]);

  return trackingRef;
}
