import { useCallback, useRef } from "react";

/**
 * A custom React hook for managing window event listeners.
 *
 * This hook provides two functions: `addWindowEventListener` and `removeWindowEventListener`.
 * The `addWindowEventListener` function allows you to register event listeners for various
 * window events, while the `removeWindowEventListener` function can be used to remove
 * those listeners when they are no longer needed.
 *
 * @example
 * const { addWindowEventListener, removeWindowEventListener } = useWindowEventListener();
 *
 * useEffect(() => {
 *   const handleScroll = (event) => {
 *     console.log('Scrolled!', event);
 *   };
 *
 *   // Add the scroll event listener
 *   addWindowEventListener('scroll', handleScroll);
 *
 *   // Cleanup function to remove the listener on component unmount
 *   return () => {
 *     removeWindowEventListener('scroll');
 *   };
 * }, [addWindowEventListener, removeWindowEventListener]);
 */
export function useWindowEventListener() {
  // @ts-expect-error Just initializing this to an empty object
  const removeEventRef = useRef<Record<keyof WindowEventMap, () => void>>({});

  const addWindowEventListener = useCallback<
    <K extends keyof WindowEventMap>(
      type: K,
      listener: (this: Window, ev: WindowEventMap[K]) => unknown,
      options?: boolean | AddEventListenerOptions
    ) => void
  >((eventName, handler, options) => {
    // Check if the handler is a function
    if (typeof handler !== "function") {
      console.warn(`Handler for ${eventName} is not a function`);
      return;
    }

    // Add the event listener
    window.addEventListener(eventName, handler, options);

    // Create a cleanup function with the event and handler
    const cleanupFn = () => {
      window.removeEventListener(eventName, handler);
    };

    // set it to a ref
    removeEventRef.current = {
      ...removeEventRef.current,
      [eventName]: cleanupFn,
    };
    return cleanupFn;
  }, []);

  // Return a function that can remove the event listener
  // and then remove it's reference from the ref
  const removeWindowEventListener = useCallback<
    (eventName: keyof WindowEventMap) => void
  >((eventName) => {
    const cleanupFn = removeEventRef.current[eventName];
    cleanupFn();

    // remove the handler
    delete removeEventRef.current[eventName];
  }, []);

  return { addWindowEventListener, removeWindowEventListener };
}
