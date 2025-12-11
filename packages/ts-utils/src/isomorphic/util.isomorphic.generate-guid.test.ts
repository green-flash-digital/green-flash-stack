import { describe, it, expect } from "vitest";
import { generateGUID } from "./util.isomorphic.generate-guid";

describe("generateGUID", () => {
  it("should generate a valid UUID format", () => {
    const guid = generateGUID();
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(guid).toMatch(uuidV4Regex);
  });

  it("should generate unique GUIDs", () => {
    const guids = new Set(
      Array.from({ length: 1000 }, () => generateGUID()) // Generate 1000 GUIDs
    );

    expect(guids.size).toBe(1000); // Ensure all are unique
  });

  it("should always have '4' in the 14th character position", () => {
    const guid = generateGUID();
    expect(guid[14]).toBe("4");
  });

  it("should always have '8', '9', 'a', or 'b' in the 19th character position", () => {
    const guid = generateGUID();
    expect(["8", "9", "a", "b"]).toContain(guid[19]);
  });
});
