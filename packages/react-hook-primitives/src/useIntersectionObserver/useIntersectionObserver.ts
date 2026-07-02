import { useEffect, useRef, useState } from "react";

type IntersectionObserverOptions = {
  once?: boolean;
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
};

/**
 * A custom React hook that uses the Intersection Observer API to detect when a specified
 * ref element becomes visible on the page.
 *
 * @example
 * // Usage example in a React component:
 *
 * import React from 'react';
 * import useIntersectionObserver from './useIntersectionObserver';
 *
 * const MyComponent = () => {
 *   const [ref, isIntersecting] = useIntersectionObserver();
 *
 *   useEffect(() => {
 *     console.log('isIntersecting:', isIntersecting);
 *   }, [isIntersecting]);
 *
 *   return (
 *     <div>
 *       <div style={{ height: '100vh' }}>Scroll down</div>
 *       <div ref={ref} style={{ background: isIntersecting ? 'green' : 'red', height: '200px' }}>
 *         This element becomes green when it is visible on the page.
 *       </div>
 *     </div>
 *   );
 * };
 *
 * export default MyComponent;
 */
export const useIntersectionObserver = <T extends HTMLElement>(
  options: IntersectionObserverOptions = {}
): [ref: React.MutableRefObject<T | null>, isVisibleOnPage: boolean] => {
  const once = options?.once ?? false;
  const root = options?.root ?? null;
  const rootMargin = options?.rootMargin ?? "0px";
  const threshold = options?.threshold ?? 0.5;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasIntersectedRef = useRef(false);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const observerRef = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once && hasIntersectedRef.current) return;
        if (entry.isIntersecting) {
          hasIntersectedRef.current = true;
        }
        setIsIntersecting(entry.isIntersecting);
      },
      {
        root,
        rootMargin,
        threshold
      }
    );

    if (observerRef) {
      observer.observe(observerRef);
    }

    return () => {
      if (observerRef) {
        observer.unobserve(observerRef);
      }
    };
  }, [once, root, rootMargin, threshold]);

  return [ref, isIntersecting];
};
