import type { ErrorResponse } from "@greenflash/http-errors";
import type { z } from "zod";

import type { ApiClientResult } from "./ApiClient.js";

type ExtractFieldErrors<E> =
  E extends ReturnType<typeof z.flattenError>
    ? E["fieldErrors"] extends Record<string, string[]> | undefined
      ? E["fieldErrors"]
      : undefined
    : undefined;

/**
 * The standardized shape returned from SSR route handlers (loaders and actions).
 * Only one of `data`, `valError`, or `error` will be set at a time.
 *
 * T — the success data type
 * V — the field errors type (narrowed from the Zod schema when using relay.validationError)
 */
export type RelayResult<
  T,
  V extends Record<string, string[]> | undefined = Record<string, string[]> | undefined
> = {
  data: T | undefined;
  valError: V;
  error: ErrorResponse | undefined;
};

// Overloads defined as a standalone function — TypeScript doesn't support
// overload signatures inside object literal methods.
function fromResult<T>(result: ApiClientResult<T>): RelayResult<T>;
function fromResult<T, U>(result: ApiClientResult<T>, transform: (data: T) => U): RelayResult<U>;
function fromResult<T, U = T>(
  result: ApiClientResult<T>,
  transform?: (data: T) => U
): RelayResult<T> | RelayResult<U> {
  if (!result.success) {
    return { data: undefined, valError: undefined, error: result.error };
  }
  const data = transform ? transform(result.data) : (result.data as unknown as U);
  return { data, valError: undefined, error: undefined };
}

/**
 * Builds a consistent `RelayResult` shape from SSR route handlers (loaders and actions).
 * Wrap any return value so the component always receives the same `{ data, valError, error }`
 * envelope — regardless of whether the handler succeeded, hit an API error, or failed validation.
 */
export const relay = {
  /**
   * Wraps a successful data payload.
   */
  data<T>(data: T): RelayResult<T> {
    return { data, valError: undefined, error: undefined };
  },

  /**
   * Wraps an `ErrorResponse` — from a failed API call or a manually constructed error object.
   */
  error<E extends ErrorResponse>(error: E): RelayResult<never> {
    return { data: undefined, valError: undefined, error } as const;
  },

  /**
   * Wraps Zod form validation errors from `z.flattenError()`.
   * Field errors are narrowed to the exact keys of the validated schema.
   */
  validationError<E extends ReturnType<typeof z.flattenError> | undefined>(
    error: E
  ): RelayResult<never, ExtractFieldErrors<E>> {
    return {
      data: undefined,
      valError: (error?.fieldErrors ?? undefined) as ExtractFieldErrors<E>,
      error: undefined
    } as const;
  },

  /**
   * Unwraps an `ApiClientResult<T>` into a `RelayResult`.
   *
   * Pass an optional `transform` to reshape the success data before relaying —
   * avoids the manual `if (!result.success)` split when you only need to rename
   * or restructure the data.
   */
  fromResult
};
