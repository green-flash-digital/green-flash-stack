import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  ApiError,
  HTTPError,
  ValidationError,
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  ServerError,
  ServiceUnavailableError,
  serializeError,
  deserializeError,
} from "../httpError.js";

// ─── HTTPError factory ────────────────────────────────────────────────────────

describe("HTTPError factory methods", () => {
  it.each([
    ["badRequest", HTTPError.badRequest("bad"), 400, "bad_request"],
    ["unauthenticated", HTTPError.unauthenticated(), 401, "unauthenticated"],
    ["unauthorized", HTTPError.unauthorized(), 403, "unauthorized"],
    ["forbidden", HTTPError.forbidden(), 403, "unauthorized"],
    ["notFound", HTTPError.notFound("missing"), 404, "not_found"],
    ["conflict", HTTPError.conflict("taken"), 409, "conflict"],
    ["tooManyRequests", HTTPError.tooManyRequests(), 429, "too_many_requests"],
    ["methodNotAllowed", HTTPError.methodNotAllowed("TRACE"), 405, "method_not_allowed"],
    ["serverError", HTTPError.serverError("crash"), 500, "server_error"],
    ["serviceUnavailable", HTTPError.serviceUnavailable(), 503, "service_unavailable"],
    ["unknown", HTTPError.unknown(), 500, "unknown"],
  ])("%s() returns the correct status and error_type", (_, err, status, errorType) => {
    expect(err.status).toBe(status);
    expect(err.error_type).toBe(errorType);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(Error);
  });

  it("validation() flattens a ZodError into fieldErrors", () => {
    const schema = z.object({ name: z.string().min(1), age: z.number() });
    const parsed = schema.safeParse({ name: "", age: "not-a-number" });
    expect(parsed.success).toBe(false);
    const err = HTTPError.validation((parsed as { success: false; error: z.ZodError }).error);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.error_type).toBe("validation");
    expect(err.status).toBe(400);
    expect(err.fieldErrors).toBeDefined();
  });

  it("specific error classes pass instanceof checks", () => {
    expect(HTTPError.badRequest()).toBeInstanceOf(BadRequestError);
    expect(HTTPError.unauthenticated()).toBeInstanceOf(UnauthenticatedError);
    expect(HTTPError.unauthorized()).toBeInstanceOf(UnauthorizedError);
    expect(HTTPError.notFound()).toBeInstanceOf(NotFoundError);
    expect(HTTPError.conflict()).toBeInstanceOf(ConflictError);
    expect(HTTPError.tooManyRequests()).toBeInstanceOf(TooManyRequestsError);
    expect(HTTPError.serverError("x")).toBeInstanceOf(ServerError);
    expect(HTTPError.serviceUnavailable()).toBeInstanceOf(ServiceUnavailableError);
  });
});

// ─── ApiError.toJson ──────────────────────────────────────────────────────────

describe("ApiError.toJson()", () => {
  it("serializes to a valid ErrorResponse shape", () => {
    const json = HTTPError.notFound("Playlist not found").toJson();
    expect(json).toEqual({ error_type: "not_found", status: 404, message: "Playlist not found" });
  });

  it("includes fieldErrors and formErrors for validation errors", () => {
    const err = new ValidationError({ name: ["Required"] }, ["Form invalid"], "Bad input");
    const json = err.toJson();
    expect(json.error_type).toBe("validation");
    if (json.error_type === "validation") {
      expect(json.fieldErrors).toEqual({ name: ["Required"] });
      expect(json.formErrors).toEqual(["Form invalid"]);
    }
  });
});

// ─── serializeError ───────────────────────────────────────────────────────────

describe("serializeError()", () => {
  it("serializes an ApiError via .toJson()", () => {
    const result = serializeError(HTTPError.notFound("Gone"));
    expect(result).toEqual({ error_type: "not_found", status: 404, message: "Gone" });
  });

  it("serializes a ZodError as a validation error", () => {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse({ email: "not-valid" });
    const result = serializeError((parsed as { success: false; error: z.ZodError }).error);
    expect(result.error_type).toBe("validation");
    expect(result.status).toBe(400);
  });

  it("passes through a plain object that matches ErrorResponseSchema", () => {
    const raw = { error_type: "not_found" as const, status: 404, message: "Gone" };
    expect(serializeError(raw)).toEqual(raw);
  });

  it("wraps an unknown Error as unknown error_type", () => {
    const result = serializeError(new Error("Something exploded"));
    expect(result.error_type).toBe("unknown");
    expect(result.message).toBe("Something exploded");
  });

  it("wraps a non-Error thrown value", () => {
    const result = serializeError("string was thrown");
    expect(result.error_type).toBe("unknown");
    expect(result.message).toBe("string was thrown");
  });
});

// ─── deserializeError ─────────────────────────────────────────────────────────

describe("deserializeError()", () => {
  it("returns the same ApiError instance if one is passed directly", () => {
    const err = HTTPError.badRequest("already typed");
    expect(deserializeError(err)).toBe(err);
  });

  it("round-trips all error types back to their ApiError subclass", () => {
    const cases = [
      HTTPError.badRequest("bad"),
      HTTPError.unauthenticated(),
      HTTPError.unauthorized(),
      HTTPError.notFound("gone"),
      HTTPError.conflict("taken"),
      HTTPError.tooManyRequests(),
      HTTPError.serverError("crash"),
      HTTPError.serviceUnavailable(),
    ];

    for (const original of cases) {
      const restored = deserializeError(original.toJson());
      expect(restored).toBeInstanceOf(ApiError);
      expect(restored.error_type).toBe(original.error_type);
      expect(restored.message).toBe(original.message);
    }
  });

  it("round-trips a validation error including fieldErrors", () => {
    const original = new ValidationError({ name: ["Required"] }, [], "Validation failed");
    const restored = deserializeError(original.toJson());
    expect(restored).toBeInstanceOf(ValidationError);
    expect((restored as ValidationError).fieldErrors).toEqual({ name: ["Required"] });
  });

  it("returns a server_error for an unrecognised payload shape", () => {
    const result = deserializeError({ not: "a valid error response" });
    expect(result.error_type).toBe("server_error");
  });
});
