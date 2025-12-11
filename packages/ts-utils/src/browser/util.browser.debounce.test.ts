import { describe, it, expect, vi } from "vitest";
import { debounce } from "./util.browser.debounce";

describe("debounce", () => {
  it("should call the function after the specified delay", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled(); // Ensure it's not called immediately

    await new Promise((resolve) => setTimeout(resolve, 110)); // Wait slightly longer than the delay

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should call the function with the correct arguments", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn("hello", 42);

    await new Promise((resolve) => setTimeout(resolve, 110));

    expect(mockFn).toHaveBeenCalledWith("hello", 42);
  });

  it("should reset the timer if called multiple times within the delay", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    setTimeout(() => debouncedFn(), 50);
    setTimeout(() => debouncedFn(), 80);

    await new Promise((resolve) => setTimeout(resolve, 200)); // Wait long enough to ensure function execution

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should execute the function only once after multiple calls within the delay", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    await new Promise((resolve) => setTimeout(resolve, 110));

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should work with multiple independent debounced functions", async () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();

    const debouncedFn1 = debounce(mockFn1, 100);
    const debouncedFn2 = debounce(mockFn2, 200);

    debouncedFn1();
    debouncedFn2();

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).not.toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockFn2).toHaveBeenCalledTimes(1);
  });

  it("should not execute if canceled before delay", async () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    setTimeout(() => debouncedFn(), 50); // Reset timer
    setTimeout(() => debouncedFn(), 80); // Reset again

    await new Promise((resolve) => setTimeout(resolve, 90)); // Before the final execution

    expect(mockFn).not.toHaveBeenCalled();
  });
});
