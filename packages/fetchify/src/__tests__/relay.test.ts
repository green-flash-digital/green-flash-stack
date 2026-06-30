import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { relay } from "../relay.js";
import type { ErrorResponse } from "../error.js";

const mockError: ErrorResponse = {
  error_type: "bad_request",
  status: 400,
  message: "Invalid input",
};

describe("relay.data()", () => {
  it("wraps data and sets valError and error to undefined", () => {
    expect(relay.data({ name: "test" })).toEqual({
      data: { name: "test" },
      valError: undefined,
      error: undefined,
    });
  });

  it("works with primitive values", () => {
    expect(relay.data(42)).toEqual({ data: 42, valError: undefined, error: undefined });
  });
});

describe("relay.error()", () => {
  it("wraps an ErrorResponse and sets data and valError to undefined", () => {
    expect(relay.error(mockError)).toEqual({
      data: undefined,
      valError: undefined,
      error: mockError,
    });
  });
});

describe("relay.validationError()", () => {
  it("extracts fieldErrors from a z.flattenError result", () => {
    const schema = z.object({ name: z.string().min(1), email: z.string().email() });
    const parsed = schema.safeParse({ name: "", email: "not-valid" });
    const flattened = z.flattenError((parsed as { success: false; error: z.ZodError }).error);
    const result = relay.validationError(flattened);

    expect(result.data).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(result.valError?.name).toBeDefined();
    expect(result.valError?.email).toBeDefined();
  });

  it("handles undefined input gracefully", () => {
    const result = relay.validationError(undefined);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(result.valError).toBeUndefined();
  });
});

describe("relay.fromResult()", () => {
  it("wraps a successful result as data", () => {
    const result = relay.fromResult({ success: true, data: { id: "1" } });
    expect(result).toEqual({ data: { id: "1" }, valError: undefined, error: undefined });
  });

  it("wraps a failed result as error", () => {
    const result = relay.fromResult({ success: false, error: mockError });
    expect(result).toEqual({ data: undefined, valError: undefined, error: mockError });
  });

  it("applies transform on success and wraps the result", () => {
    const result = relay.fromResult(
      { success: true, data: [{ id: "1" }, { id: "2" }] },
      (items) => ({ items, count: items.length })
    );
    expect(result).toEqual({
      data: { items: [{ id: "1" }, { id: "2" }], count: 2 },
      valError: undefined,
      error: undefined,
    });
  });

  it("does not call transform on failure", () => {
    const transform = vi.fn();
    relay.fromResult({ success: false, error: mockError }, transform);
    expect(transform).not.toHaveBeenCalled();
  });

  it("passes the error through unchanged when transform is provided but result failed", () => {
    const result = relay.fromResult(
      { success: false, error: mockError },
      () => ({ transformed: true })
    );
    expect(result.error).toBe(mockError);
    expect(result.data).toBeUndefined();
  });
});
