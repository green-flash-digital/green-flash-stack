import { describe, it, expect } from "vitest";
import { hashString } from "./util.node.hash-string";

describe("hashString", () => {
  it("should return a consistent hash for the same input", () => {
    const input = "consistent_string";
    const hash1 = hashString(input);
    const hash2 = hashString(input);

    expect(hash1).toBe(hash2);
  });

  it("should return different hashes for different inputs", () => {
    const hashA = hashString("inputA");
    const hashB = hashString("inputB");

    expect(hashA).not.toBe(hashB);
  });

  it("should return a valid SHA-256 hash (64 hex characters)", () => {
    const hash = hashString("test_string");

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should return a hash for an empty string", () => {
    const hash = hashString("");

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should handle large strings correctly", () => {
    const longString = "a".repeat(10000);
    const hash = hashString(longString);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
