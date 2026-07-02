import { useCallback, useState } from "react";

/**
 * To use this hook, you can pass an array of items and then utilize
 * the returned currentItem, next, and prev
 * functions to navigate through the array in a carousel-like manner
 */
export const useCarousel = <T extends Record<string, unknown>>(items: T[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  }, [items.length]);

  const currentItem = items[currentIndex];

  return { currentItem, next, prev };
};
