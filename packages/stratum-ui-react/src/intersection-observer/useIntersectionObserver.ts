import { useEffect, useRef, useState } from "react";

export type UseIntersectionObserverOptions = {
  once?: boolean;
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
};

/**
 * Detects when a ref'd element becomes visible on the page via the
 * Intersection Observer API.
 *
 * @example
 * const [ref, isIntersecting] = useIntersectionObserver();
 * return <div ref={ref}>{isIntersecting ? "visible" : "hidden"}</div>;
 */
export function useIntersectionObserver<T extends HTMLElement>(
  options: UseIntersectionObserverOptions = {}
): [ref: React.MutableRefObject<T | null>, isVisibleOnPage: boolean] {
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
}
