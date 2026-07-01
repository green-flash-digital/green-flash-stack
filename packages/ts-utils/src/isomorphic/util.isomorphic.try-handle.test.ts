import { describe, it, expect } from "vitest";

import { tryHandle, tryHandleSync } from "./util.isomorphic.try-handle.js";

describe("tryHandle", () => {
  it("returns success when the promise resolves", async () => {
    const result = await tryHandle(Promise.resolve("hello"));
    expect(result).toEqual({ success: true, data: "hello" });
  });

  it("returns failure when the promise rejects with an Error", async () => {
    const error = new Error("something went wrong");
    const result = await tryHandle(Promise.reject(error));
    expect(result).toEqual({ success: false, error });
  });

  it("wraps a non-Error rejection in an Error", async () => {
    const result = await tryHandle(Promise.reject("raw string"));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("raw string");
    }
  });

  it("works with complex resolved values", async () => {
    const data = { id: 1, tags: ["a", "b"] };
    const result = await tryHandle(Promise.resolve(data));
    expect(result).toEqual({ success: true, data });
  });
});

describe("tryHandleSync", () => {
  it("returns success when the function returns a value", () => {
    const result = tryHandleSync((n: number) => n * 2)(21);
    expect(result).toEqual({ success: true, data: 42 });
  });

  it("returns failure when the function throws an Error", () => {
    const error = new Error("Sync failure");
    const result = tryHandleSync(() => {
      throw error;
    })();
    expect(result).toEqual({ success: false, error });
  });

  it("wraps a non-Error throw in an Error", () => {
    const result = tryHandleSync(() => {
      throw "raw string";
    })();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("raw string");
    }
  });

  it("works with complex return values", () => {
    const data = { id: 1, tags: ["a", "b"] };
    const result = tryHandleSync(() => data)();
    expect(result).toEqual({ success: true, data });
  });
});
