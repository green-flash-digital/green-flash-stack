import { describe, it, expect } from "vitest";
import { tryHandle, tryHandleSync } from "./util.isomorphic.try-handle";

describe("tryHandle (Async)", () => {
  it("should return data when the function resolves successfully", async () => {
    const asyncFn = async (num: number) => num * 2;
    const handle = tryHandle(asyncFn);
    const result = await handle(5);

    expect(result.hasError).toBe(false);
    expect(result.data).toBe(10);
    expect(result.error).toBeUndefined();
  });

  it("should return an error when the function throws", async () => {
    const asyncErrorFn = async () => {
      throw new Error("Async failure");
    };
    const handle = tryHandle(asyncErrorFn);
    const result = await handle();

    expect(result.hasError).toBe(true);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Async failure");
  });

  it("should handle non-Error thrown values correctly", async () => {
    const asyncThrowString = async () => {
      throw "Some error";
    };
    const handle = tryHandle(asyncThrowString);
    const result = await handle();

    expect(result.hasError).toBe(true);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Some error");
  });

  it("should work with synchronous functions", async () => {
    const syncFn = (text: string) => text.toUpperCase();
    const handle = tryHandle(syncFn);
    const result = await handle("hello");

    expect(result.hasError).toBe(false);
    expect(result.data).toBe("HELLO");
    expect(result.error).toBeUndefined();
  });
});

describe("tryHandleSync (Synchronous)", () => {
  it("should return data when the function executes successfully", () => {
    const syncFn = (num: number) => num * 3;
    const handle = tryHandleSync(syncFn);
    const result = handle(4);

    expect(result.hasError).toBe(false);
    expect(result.data).toBe(12);
    expect(result.error).toBeUndefined();
  });

  it("should return an error when the function throws", () => {
    const syncErrorFn = () => {
      throw new Error("Sync failure");
    };
    const handle = tryHandleSync(syncErrorFn);
    const result = handle();

    expect(result.hasError).toBe(true);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Sync failure");
  });

  it("should handle non-Error thrown values correctly", () => {
    const syncThrowString = () => {
      throw "Some sync error";
    };
    const handle = tryHandleSync(syncThrowString);
    const result = handle();

    expect(result.hasError).toBe(true);
    expect(result.data).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe("Some sync error");
  });

  it("should work with functions that return objects", () => {
    const syncFn = () => ({ success: true, value: 42 });
    const handle = tryHandleSync(syncFn);
    const result = handle();

    expect(result.hasError).toBe(false);
    expect(result.data).toEqual({ success: true, value: 42 });
    expect(result.error).toBeUndefined();
  });
});
