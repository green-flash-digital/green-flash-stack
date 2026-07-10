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

describe("tryHandle (function-wrapping overload)", () => {
  it("wraps an async function and returns success when it resolves", async () => {
    const fn = async (x: number) => x * 2;
    const result = await tryHandle(fn)(21);
    expect(result).toEqual({ success: true, data: 42 });
  });

  it("wraps an async function and returns failure when it throws", async () => {
    const error = new Error("async fail");
    const fn = async () => {
      throw error;
    };
    const result = await tryHandle(fn)();
    expect(result).toEqual({ success: false, error });
  });

  it("supports being called multiple times from the same wrapped function", async () => {
    let call = 0;
    const fn = async () => {
      call++;
      if (call === 1) throw new Error("first");
      return "ok";
    };
    const safe = tryHandle(fn);
    const r1 = await safe();
    const r2 = await safe();
    expect(r1.success).toBe(false);
    expect(r2).toEqual({ success: true, data: "ok" });
  });

  it("passes arguments through to the wrapped function", async () => {
    const fn = async (a: string, b: number) => `${a}-${b}`;
    const result = await tryHandle(fn)("hello", 42);
    expect(result).toEqual({ success: true, data: "hello-42" });
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
