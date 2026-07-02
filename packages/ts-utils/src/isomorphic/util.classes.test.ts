import { describe, it, expect } from "vitest";

import { classes } from "./util.classes.js";

describe("classes", () => {
  describe("strings", () => {
    it("returns a single string unchanged", () => {
      expect(classes("foo")).toBe("foo");
    });

    it("joins multiple strings with a space", () => {
      expect(classes("foo", "bar", "baz")).toBe("foo bar baz");
    });

    it("ignores empty strings", () => {
      expect(classes("foo", "", "bar")).toBe("foo bar");
    });
  });

  describe("numbers", () => {
    it("converts numbers to strings", () => {
      expect(classes(42)).toBe("42");
    });

    it("mixes numbers and strings", () => {
      expect(classes("foo", 42)).toBe("foo 42");
    });
  });

  describe("falsy values", () => {
    it("ignores false", () => {
      expect(classes("foo", false, "bar")).toBe("foo bar");
    });

    it("ignores null", () => {
      expect(classes("foo", null, "bar")).toBe("foo bar");
    });

    it("ignores undefined", () => {
      expect(classes("foo", undefined, "bar")).toBe("foo bar");
    });

    it("returns empty string when all args are falsy", () => {
      expect(classes(false, null, undefined)).toBe("");
    });
  });

  describe("objects", () => {
    it("includes keys whose value is true", () => {
      expect(classes({ foo: true, bar: true })).toBe("foo bar");
    });

    it("excludes keys whose value is false", () => {
      expect(classes({ foo: true, bar: false })).toBe("foo");
    });

    it("excludes keys whose value is null or undefined", () => {
      expect(classes({ foo: true, bar: null, baz: undefined })).toBe("foo");
    });

    it("mixes objects with strings", () => {
      expect(classes("base", { active: true, disabled: false })).toBe("base active");
    });
  });

  describe("arrays", () => {
    it("flattens a string array", () => {
      expect(classes(["foo", "bar"])).toBe("foo bar");
    });

    it("ignores falsy entries inside arrays", () => {
      expect(classes(["foo", false, null, undefined, "bar"])).toBe("foo bar");
    });

    it("handles objects inside arrays", () => {
      expect(classes(["foo", { bar: true, baz: false }])).toBe("foo bar");
    });

    it("ignores empty arrays", () => {
      expect(classes("foo", [], "bar")).toBe("foo bar");
    });
  });

  describe("combined", () => {
    it("handles a realistic component usage pattern", () => {
      const isActive = true;
      const isDisabled = false;
      expect(classes("btn", { "btn--active": isActive, "btn--disabled": isDisabled })).toBe(
        "btn btn--active"
      );
    });

    it("handles nested arrays with objects", () => {
      expect(classes(["foo", { bar: true }], "baz")).toBe("foo bar baz");
    });
  });
});
