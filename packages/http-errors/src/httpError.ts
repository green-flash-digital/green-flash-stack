import { z, ZodError } from "zod";

import { ErrorResponseSchema } from "./error.js";
import type { ErrorResponse } from "./error.js";

export class ApiError<
  T extends ErrorResponse["error_type"] = ErrorResponse["error_type"]
> extends Error {
  readonly error_type: T;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly formErrors?: string[];

  constructor(opts: {
    error_type: T;
    status: number;
    message: string;
    fieldErrors?: T extends "validation" ? Record<string, string[]> : never;
    formErrors?: T extends "validation" ? string[] : never;
  }) {
    super(opts.message);
    this.name = this.constructor.name;
    this.error_type = opts.error_type;
    this.status = opts.status;

    if (opts.error_type === "validation") {
      this.fieldErrors = opts.fieldErrors || {};
      this.formErrors = opts.formErrors || [];
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJson(): ErrorResponse {
    const payload = {
      error_type: this.error_type,
      status: this.status,
      message: this.message,
      ...(this.error_type === "validation"
        ? {
            fieldErrors: this.fieldErrors || {},
            formErrors: this.formErrors || []
          }
        : {})
    };
    return ErrorResponseSchema.parse(payload);
  }
}

export class ValidationError extends ApiError<"validation"> {
  constructor(
    fieldErrors: Record<string, string[]>,
    formErrors: string[] = [],
    message = "Validation failed"
  ) {
    super({
      error_type: "validation",
      message,
      status: 400,
      fieldErrors,
      formErrors
    });
  }
}

export class BadRequestError extends ApiError<"bad_request"> {
  constructor(message = "Bad request") {
    super({ error_type: "bad_request", message, status: 400 });
  }
}

export class UnauthenticatedError extends ApiError<"unauthenticated"> {
  constructor(message = "You need to sign in to access this resource.") {
    super({ error_type: "unauthenticated", message, status: 401 });
  }
}

export class UnauthorizedError extends ApiError<"unauthorized"> {
  constructor(message = "Not authorized") {
    super({ error_type: "unauthorized", message, status: 403 });
  }
}

export class ForbiddenError extends ApiError<"unauthorized"> {
  constructor(message = "Forbidden") {
    super({ error_type: "unauthorized", message, status: 403 });
  }
}

export class NotFoundError extends ApiError<"not_found"> {
  constructor(message = "The requested resource does not exist") {
    super({ error_type: "not_found", message, status: 404 });
  }
}

export class MethodNotAllowedError extends ApiError<"method_not_allowed"> {
  constructor(method: string) {
    super({
      error_type: "method_not_allowed",
      message: `"${method}" is not allowed.`,
      status: 405
    });
  }
}

export class ServerError extends ApiError<"server_error"> {
  constructor(message: string) {
    super({ error_type: "server_error", message, status: 500 });
  }
}

export class ConflictError extends ApiError<"conflict"> {
  constructor(message = "Conflict") {
    super({ error_type: "conflict", message, status: 409 });
  }
}

export class TooManyRequestsError extends ApiError<"too_many_requests"> {
  constructor(message = "Too many requests. Please try again later.") {
    super({ error_type: "too_many_requests", message, status: 429 });
  }
}

export class ServiceUnavailableError extends ApiError<"service_unavailable"> {
  constructor(message = "Service temporarily unavailable. Please try again later.") {
    super({ error_type: "service_unavailable", message, status: 503 });
  }
}

export class UnknownError extends ApiError<"unknown"> {
  constructor(message = "An unknown error occurred", status = 500) {
    super({ error_type: "unknown", message, status });
  }
}

/**
 * Factory for constructing typed HTTP errors. Use on both the server (throw it)
 * and the client (pass to relay.error()).
 */
export class HTTPError {
  static validation(error: ZodError, message?: string): ValidationError {
    const flattened = z.flattenError(error);
    const fieldErrors: Record<string, string[]> = {};
    if (flattened.fieldErrors) {
      for (const [key, value] of Object.entries(flattened.fieldErrors)) {
        if (Array.isArray(value)) fieldErrors[key] = value;
      }
    }
    return new ValidationError(
      fieldErrors,
      flattened.formErrors || [],
      message || "Validation failed"
    );
  }

  static badRequest(message = "Bad request"): BadRequestError {
    return new BadRequestError(message);
  }

  static unauthenticated(
    message = "You need to sign in to access this resource."
  ): UnauthenticatedError {
    return new UnauthenticatedError(message);
  }

  static unauthorized(message = "Not authorized"): UnauthorizedError {
    return new UnauthorizedError(message);
  }

  static forbidden(message = "Forbidden"): ForbiddenError {
    return new ForbiddenError(message);
  }

  static notFound(message = "The requested resource does not exist"): NotFoundError {
    return new NotFoundError(message);
  }

  static methodNotAllowed(method: string): MethodNotAllowedError {
    return new MethodNotAllowedError(method);
  }

  static conflict(message = "Conflict"): ConflictError {
    return new ConflictError(message);
  }

  static tooManyRequests(
    message = "Too many requests. Please try again later."
  ): TooManyRequestsError {
    return new TooManyRequestsError(message);
  }

  static serviceUnavailable(
    message = "Service temporarily unavailable. Please try again later."
  ): ServiceUnavailableError {
    return new ServiceUnavailableError(message);
  }

  static serverError(reason: string): ServerError {
    return new ServerError(`There was an internal server error: ${reason}`);
  }

  static unknown(message = "An unknown error occurred", status = 500): UnknownError {
    return new UnknownError(message, status);
  }
}

/**
 * Converts any thrown value into a typed ErrorResponse payload.
 * Use in your API framework's global error handler (e.g. Hono's app.onError).
 */
export function serializeError(error: unknown): ErrorResponse {
  if (error instanceof ZodError) return HTTPError.validation(error).toJson();
  if (error instanceof ApiError) return error.toJson();

  if (typeof error === "object" && error !== null) {
    const parsed = ErrorResponseSchema.safeParse(error);
    if (parsed.success) return parsed.data;
  }

  return HTTPError.unknown(error instanceof Error ? error.message : String(error)).toJson();
}

/**
 * Converts a received ErrorResponse JSON payload back into a typed ApiError instance.
 * Useful when you need instanceof checks on error responses from an API.
 */
export function deserializeError(errorJson: unknown, method?: string): ApiError {
  if (errorJson instanceof ApiError) return errorJson;

  const parsed = ErrorResponseSchema.safeParse(errorJson);
  if (!parsed.success) return HTTPError.serverError("Unknown error format received from server");

  const error = parsed.data;
  switch (error.error_type) {
    case "validation":
      return new ValidationError(error.fieldErrors, error.formErrors, error.message);
    case "unauthenticated":
      return HTTPError.unauthenticated(error.message);
    case "unauthorized":
      return HTTPError.unauthorized(error.message);
    case "not_found":
      return HTTPError.notFound(error.message);
    case "method_not_allowed":
      return HTTPError.methodNotAllowed(method || "UNKNOWN");
    case "bad_request":
      return HTTPError.badRequest(error.message);
    case "conflict":
      return HTTPError.conflict(error.message);
    case "too_many_requests":
      return HTTPError.tooManyRequests(error.message);
    case "server_error":
      return new ServerError(error.message);
    case "service_unavailable":
      return HTTPError.serviceUnavailable(error.message);
    case "unknown":
    default:
      return HTTPError.unknown(error.message);
  }
}
