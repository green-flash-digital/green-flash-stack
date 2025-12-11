import { describe, it, expect } from "vitest";
import { exhaustiveMatchGuard } from "./util.isomorphic.exhaustive-match-guard";

describe("exhaustiveMatchGuard", () => {
  it("should throw an error with the unexpected value", () => {
    expect(() =>
      exhaustiveMatchGuard("unexpected_value" as never)
    ).toThrowError(
      'Forgot to include an "unexpected_value" in the switch statement'
    );
  });

  it("should throw an error for numbers", () => {
    expect(() => exhaustiveMatchGuard(42 as never)).toThrowError(
      'Forgot to include an "42" in the switch statement'
    );
  });

  it("should throw an error for objects", () => {
    expect(() => exhaustiveMatchGuard({ key: "value" } as never)).toThrowError(
      'Forgot to include an "[object Object]" in the switch statement'
    );
  });

  it("should throw an error for `undefined`", () => {
    expect(() => exhaustiveMatchGuard(undefined as never)).toThrowError(
      'Forgot to include an "undefined" in the switch statement'
    );
  });

  it("should throw an error for `null`", () => {
    expect(() => exhaustiveMatchGuard(null as never)).toThrowError(
      'Forgot to include an "null" in the switch statement'
    );
  });
});
