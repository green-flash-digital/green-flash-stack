import { useCallback, useState } from "react";

/**
 * Cycles through an array of items in a carousel-like manner via the
 * returned `currentItem`, `next`, and `prev`.
 */
export function useCarousel<T extends Record<string, unknown>>(items: T[]) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  }, [items.length]);

  const currentItem = items[currentIndex];

  return { currentItem, next, prev };
}
