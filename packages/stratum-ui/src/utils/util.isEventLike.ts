export type EventLike = {
  preventDefault: () => void;
  currentTarget: unknown;
};

/**
 * Type guard that checks if a value is "event-like".
 *
 * Determines whether the provided value is an object with a `preventDefault` method
 * and a `currentTarget` property, as found on DOM Events and similar.
 */
export function isEventLike(v: unknown): v is EventLike {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as EventLike).preventDefault === "function" &&
    "currentTarget" in (v as EventLike)
  );
}
