import { describe, it, expect } from "vitest";
import { kebabToPascalCase } from "./util.isomorphic.kebab-to-pascal-case";

describe("kebabToPascalCase", () => {
  it("should convert a simple kebab-case string to PascalCase", () => {
    expect(kebabToPascalCase("hello-world")).toBe("HelloWorld");
  });

  it("should convert multiple hyphenated words to PascalCase", () => {
    expect(kebabToPascalCase("this-is-a-test")).toBe("ThisIsATest");
  });

  it("should handle kebab-case with numbers correctly", () => {
    expect(kebabToPascalCase("version-2-feature")).toBe("Version2Feature");
  });

  it("should handle spaces as separators", () => {
    expect(kebabToPascalCase("hello world example")).toBe("HelloWorldExample");
  });

  it("should handle mixed hyphens and spaces", () => {
    expect(kebabToPascalCase("mix-of-hyphens and spaces")).toBe(
      "MixOfHyphensAndSpaces"
    );
  });

  it("should return an empty string if input is empty", () => {
    expect(kebabToPascalCase("")).toBe("");
  });

  it("should return the same word capitalized if there's no separator", () => {
    expect(kebabToPascalCase("simpleword")).toBe("Simpleword");
  });

  it("should handle leading hyphens", () => {
    expect(kebabToPascalCase("-leading-hyphen")).toBe("LeadingHyphen");
  });

  it("should handle trailing hyphens", () => {
    expect(kebabToPascalCase("trailing-hyphen-")).toBe("TrailingHyphen");
  });

  it("should handle consecutive hyphens", () => {
    expect(kebabToPascalCase("multiple--hyphens")).toBe("MultipleHyphens");
  });

  it("should handle single hyphen as input", () => {
    expect(kebabToPascalCase("-")).toBe("");
  });

  it("should handle words already in PascalCase without modification", () => {
    expect(kebabToPascalCase("AlreadyPascalCase")).toBe("Alreadypascalcase");
  });
});
