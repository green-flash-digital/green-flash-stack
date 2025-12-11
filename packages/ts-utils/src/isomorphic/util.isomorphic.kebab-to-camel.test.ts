import { describe, it, expect } from "vitest";
import { kebabToCamel } from "./util.isomorphic.kebab-to-camel";

describe("kebabToCamel", () => {
  it("should convert a simple kebab-case string to camelCase", () => {
    expect(kebabToCamel("hello-world")).toBe("helloWorld");
  });

  it("should convert multiple hyphens in a string to camelCase", () => {
    expect(kebabToCamel("this-is-a-test")).toBe("thisIsATest");
  });

  it("should handle kebab-case with numbers", () => {
    expect(kebabToCamel("version-2-feature")).toBe("version2Feature");
  });

  it("should return an empty string if input is empty", () => {
    expect(kebabToCamel("")).toBe("");
  });

  it("should return the same string if there are no hyphens", () => {
    expect(kebabToCamel("simpleword")).toBe("simpleword");
  });

  it("should handle strings that start with a hyphen", () => {
    expect(kebabToCamel("-leading-hyphen")).toBe("LeadingHyphen");
  });

  it("should not modify an already camelCase string", () => {
    expect(kebabToCamel("alreadyCamelCase")).toBe("alreadyCamelCase");
  });
});
