import type { ForwardedRef } from "react";
import { useImperativeHandle, useRef } from "react";

/**
 * A custom hook that manages an internal ref and forwards it to a parent component.
 *
 * This hook creates a ref that can be used internally within a component while also allowing
 * a parent component to access the current value of the ref via a forwarded reference.
 *
 * @example
 * const MyComponent = forwardRef((props, ref) => {
 *   const internalRef = useForwardedRef(ref);
 *
 *   return <input ref={internalRef} />;
 * });
 */
export function useForwardedRef<T extends HTMLElement>(
  forwardedRef: ForwardedRef<T>
) {
  const internalRef = useRef<T | null>(null);

  // @ts-expect-error mismatch in the internals
  useImperativeHandle(forwardedRef, () => internalRef.current);

  return internalRef;
}
