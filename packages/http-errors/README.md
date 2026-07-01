# @greenflash/http-errors

A typed HTTP error system for server-side Node.js and edge runtimes. Provides a factory class for constructing typed errors, a global serialization handler, and the shared `ErrorResponse` wire type used across `@greenflash/fetchify`.

## Table of contents

- [@greenflash/http-errors](#greenflashhttp-errors)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Core concepts](#core-concepts)
    - [`ErrorResponse`](#errorresponse)
    - [Error hierarchy](#error-hierarchy)
  - [Using `HTTPError`](#using-httperror)
    - [`unauthenticated` — no valid session](#unauthenticated--no-valid-session)
    - [`unauthorized` — signed in but not permitted](#unauthorized--signed-in-but-not-permitted)
    - [`notFound` — DB row doesn't exist](#notfound--db-row-doesnt-exist)
    - [`badRequest` — failed precondition](#badrequest--failed-precondition)
    - [`badRequest` — external service returns a failure](#badrequest--external-service-returns-a-failure)
    - [`serverError` — external service returns null unexpectedly](#servererror--external-service-returns-null-unexpectedly)
    - [`validation` — ZodError from a manual parse](#validation--zoderror-from-a-manual-parse)
    - [`conflict` — resource already exists or state conflict](#conflict--resource-already-exists-or-state-conflict)
    - [`tooManyRequests` — rate limit exceeded](#toomanyrequests--rate-limit-exceeded)
    - [`serviceUnavailable` — service temporarily down](#serviceunavailable--service-temporarily-down)
  - [Using `serializeError`](#using-serializeerror)
  - [Using `deserializeError`](#using-deserializeerror)
  - [Custom error classes](#custom-error-classes)
  - [API reference](#api-reference)
    - [`HTTPError` methods](#httperror-methods)
    - [Error classes](#error-classes)
    - [`ErrorResponse` shape](#errorresponse-shape)
  - [Peer dependencies](#peer-dependencies)

---

## Installation

```bash
npm install @greenflash/http-errors zod
```

---

## Core concepts

### `ErrorResponse`

The standardized error shape that travels over the wire as JSON. The API throws `HTTPError.*`; `serializeError` converts it to this shape; the client receives it as `result.error` from `@greenflash/fetchify`.

```typescript
type ErrorResponse = {
  status: number;
  message: string;
  error_type:
    | "bad_request"
    | "validation"
    | "unauthenticated"
    | "unauthorized"
    | "not_found"
    | "conflict"
    | "too_many_requests"
    | "method_not_allowed"
    | "server_error"
    | "service_unavailable"
    | "unknown";
  // Only present when error_type === "validation":
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};
```

### Error hierarchy

Every `HTTPError.*` factory method returns an `ApiError` subclass instance. They are plain classes — no framework dependency. `serializeError` uses `instanceof ApiError` to distinguish them from other throws.

---

## Using `HTTPError`

`HTTPError` is a factory class for constructing typed errors. Use it on the **server** to throw from route handlers and on the **client** to construct error values to pass to `relay.error()`.

```typescript
import { HTTPError } from "@greenflash/http-errors";
```

| Method                                 | Status | When to use                                            |
| -------------------------------------- | ------ | ------------------------------------------------------ |
| `HTTPError.badRequest(msg?)`           | 400    | Caller error — bad input or failed precondition        |
| `HTTPError.validation(zodError, msg?)` | 400    | Zod parse failed — flattens field errors automatically |
| `HTTPError.unauthenticated(msg?)`      | 401    | No valid session                                       |
| `HTTPError.unauthorized(msg?)`         | 403    | Signed in but not permitted                            |
| `HTTPError.forbidden(msg?)`            | 403    | Access denied (alias for unauthorized)                 |
| `HTTPError.notFound(msg?)`             | 404    | DB row or resource doesn't exist                       |
| `HTTPError.conflict(msg?)`             | 409    | Resource already exists or state conflict              |
| `HTTPError.tooManyRequests(msg?)`      | 429    | Rate limit exceeded                                    |
| `HTTPError.methodNotAllowed(method)`   | 405    | HTTP method not supported                              |
| `HTTPError.serverError(reason)`        | 500    | Our code or integration failed unexpectedly            |
| `HTTPError.serviceUnavailable(msg?)`   | 503    | Service temporarily down — try again later             |
| `HTTPError.unknown(msg?, status?)`     | 500    | Unknown or uncategorised error                         |

### `unauthenticated` — no valid session

Use in auth middleware. Throw immediately — no session means no processing.

```typescript
export const withAuthenticatedSession = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session || !session.user) {
    throw HTTPError.unauthenticated();
    // → 401 { error_type: "unauthenticated", message: "You need to sign in..." }
  }
  c.set("user", session.user);
  c.set("session", session);
  return next();
});
```

### `unauthorized` — signed in but not permitted

The user is known, but this specific action is off-limits. Different from `unauthenticated` — don't redirect to login, show a permission error.

```typescript
app.delete("/:id", async (c) => {
  const session = c.get("session");
  const household = await db.query.households.findFirst({
    where: eq(households.id, params.id),
  });

  if (household.ownerId !== session.user.id) {
    throw HTTPError.unauthorized("Only the household owner can delete it");
    // → 403 { error_type: "unauthorized", message: "Only the household owner..." }
  }

  // proceed with delete
});
```

### `notFound` — DB row doesn't exist

Use after a DB query when the expected row is missing. Include the identifier in the message so the error is debuggable.

```typescript
// GET /api/playlist/:id
app.get("/:id", async (c) => {
  const rows = await db
    .select()
    .from(schema.playlist)
    .where(
      and(
        eq(schema.playlist.id, params.id),
        eq(schema.playlist.householdId, session.activeOrganizationId),
        eq(schema.playlist.isActive, true),
      ),
    )
    .limit(1);

  if (!rows[0]) {
    throw HTTPError.notFound(`Playlist '${params.id}' not found.`);
    // → 404 { error_type: "not_found", message: "Playlist 'abc123' not found." }
  }

  return response.json(c, {
    schema: GetSinglePlaylistResponseSchema,
    data: rows[0],
  });
});
```

### `badRequest` — failed precondition

Use when required context is missing and the request can't proceed — but it's the caller's fault, not a permissions issue.

```typescript
app.get("/:id", async (c) => {
  const session = c.get("session");

  // The client should always have an active household selected — if not, that's a bad request
  if (!session.activeOrganizationId) {
    throw HTTPError.badRequest("No active household selected.");
    // → 400 { error_type: "bad_request", message: "No active household selected." }
  }

  // safe to query using session.activeOrganizationId
});
```

### `badRequest` — external service returns a failure

When a third-party call returns falsy or a recoverable failure. You know the request caused the problem, but not the exact internal reason.

```typescript
// GET /api/onboarding/validate-slug/:slug
app.get("/:slug", async (c) => {
  const slugRes = await tryHandle(
    betterAuth.checkOrganizationSlug({ body: { slug: params.slug } }),
  );

  if (!slugRes.success) {
    throw HTTPError.badRequest(`The slug '${params.slug}' is already taken`);
    // → 400 { error_type: "bad_request", message: "The slug 'my-home' is already taken" }
  }

  return response.json(c, {
    schema: ValidateSlugResponseSchema,
    data: { isAvailable: true },
  });
});
```

### `serverError` — external service returns null unexpectedly

Use when a third-party call succeeds (no exception) but returns `null` where it should always return data. This is an integration problem, not a caller problem.

```typescript
// GET /api/household/:slug
app.get("/:slug", async (c) => {
  const res = await betterAuth.getFullOrganization({
    query: { organizationSlug: params.slug },
    headers: c.req.raw.headers,
  });

  if (!res) {
    throw HTTPError.serverError(
      `Failed to fetch household '${params.slug}' from auth provider.`,
    );
    // → 500 { error_type: "server_error", message: "There was an internal server error: ..." }
  }

  return response.json(c, { schema: GetHouseholdResponseSchema, data: res });
});
```

### `validation` — ZodError from a manual parse

Use when you're manually parsing a request body. `HTTPError.validation()` flattens `fieldErrors` and `formErrors` automatically. If you're using `@hono/zod-validator`, the global error handler takes care of this for you.

```typescript
app.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = CreatePlaylistSchema.safeParse(body);

  if (!parsed.success) {
    throw HTTPError.validation(parsed.error);
    // → 400 { error_type: "validation", fieldErrors: { name: ["Required"] }, formErrors: [] }
  }

  // parsed.data is now safe to use
});
```

### `conflict` — resource already exists or state conflict

Use when a create or update operation fails because of a uniqueness constraint or an incompatible state — not because the input was invalid, but because it conflicts with what already exists.

```typescript
// POST /api/household — user tries to create a second household
app.post("/", async (c) => {
  const session = c.get("session");
  if (session.activeOrganizationId) {
    throw HTTPError.conflict(
      "You already belong to a household. Leave it before creating a new one.",
    );
    // → 409 { error_type: "conflict", message: "You already belong to a household..." }
  }
  // proceed with creation
});

// POST /api/onboarding/validate-slug — slug is taken
app.get("/:slug", async (c) => {
  const existing = await db.query.households.findFirst({
    where: eq(households.slug, params.slug),
  });
  if (existing) {
    throw HTTPError.conflict(`The slug '${params.slug}' is already taken.`);
    // → 409 { error_type: "conflict", message: "The slug 'my-home' is already taken." }
  }
});
```

### `tooManyRequests` — rate limit exceeded

Use when a caller has exceeded a request quota. Typically applied in middleware before the route handler runs.

```typescript
// middleware/rateLimit.middleware.ts
export const withRateLimit = createMiddleware(async (c, next) => {
  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const key = `rate:${ip}`;

  const count = await kv.get(key);
  if (Number(count) > 100) {
    throw HTTPError.tooManyRequests(
      "Rate limit exceeded. Try again in 60 seconds.",
    );
    // → 429 { error_type: "too_many_requests", message: "Rate limit exceeded..." }
  }

  await kv.increment(key, { ttl: 60 });
  return next();
});
```

### `serviceUnavailable` — service temporarily down

Use when the server is intentionally offline (maintenance window) or an upstream dependency is completely unreachable. Signals to the client that retrying later will likely succeed — different from `serverError` (500) which means something crashed.

```typescript
// Maintenance mode middleware
export const withMaintenanceCheck = createMiddleware(async (c, next) => {
  const isUnderMaintenance = await kv.get("maintenance:active");
  if (isUnderMaintenance) {
    throw HTTPError.serviceUnavailable(
      "The service is under maintenance. Please try again in a few minutes.",
    );
    // → 503 { error_type: "service_unavailable", message: "The service is under maintenance..." }
  }
  return next();
});

// Or when a critical upstream (e.g. database) is unreachable
app.use("*", async (c, next) => {
  const dbRes = await tryHandle(createDb().ping());
  if (!dbRes.success) {
    throw HTTPError.serviceUnavailable(
      "Unable to reach the database. Please try again shortly.",
    );
  }
  return next();
});
```

---

## Using `serializeError`

Wire `serializeError` into your framework's global error handler **once**. Every `throw HTTPError.*` in every route flows through it automatically — you never call it manually.

It handles all cases in order:

1. `ZodError` → wraps as a `validation` error with flattened field errors
2. `ApiError` subclass (any `HTTPError.*` result) → calls `.toJson()` to serialize
3. Plain object matching `ErrorResponseSchema` → returns it as-is
4. Anything else → wraps as an `unknown` error

```typescript
import { serializeError } from "@greenflash/http-errors";
import type { ContentfulStatusCode } from "hono/utils/http-status";

app.onError((err, c) => {
  const error = serializeError(err);
  console.error(`[${error.status}] ${error.error_type}: ${error.message}`);
  return c.json(error, error.status as ContentfulStatusCode);
});
```

---

## Using `deserializeError`

`ApiClient` and `tryFetch` return `ErrorResponse` as a plain object — no class methods, no `instanceof`. If you need to branch using the class hierarchy, convert it with `deserializeError`.

```typescript
import {
  deserializeError,
  UnauthenticatedError,
  NotFoundError,
} from "@greenflash/http-errors";

const result = await tryFetch<User>("/api/profile");
if (!result.success) {
  const err = deserializeError(result.error);
  if (err instanceof UnauthenticatedError) return redirect("/login");
  if (err instanceof NotFoundError) return redirect("/onboarding");
  throw err; // re-throw anything unexpected
}
```

> In most cases you don't need this — checking `error.error_type === "unauthenticated"` on the plain object is simpler. Use `deserializeError` when you specifically need the class hierarchy (retry logic, `instanceof` in catch blocks, etc.).

---

## Custom error classes

Extend `ApiError` directly for domain-specific error types:

```typescript
import { ApiError } from "@greenflash/http-errors";

class RateLimitError extends ApiError<"bad_request"> {
  readonly retryAfter: number;

  constructor(retryAfter: number) {
    super({
      error_type: "bad_request",
      status: 429,
      message: "Rate limit exceeded",
    });
    this.retryAfter = retryAfter;
  }
}

throw new RateLimitError(60); // serializeError handles it via instanceof ApiError
```

---

## API reference

### `HTTPError` methods

| Method                                     | Status | `error_type`          |
| ------------------------------------------ | ------ | --------------------- |
| `HTTPError.badRequest(message?)`           | 400    | `bad_request`         |
| `HTTPError.validation(zodError, message?)` | 400    | `validation`          |
| `HTTPError.unauthenticated(message?)`      | 401    | `unauthenticated`     |
| `HTTPError.unauthorized(message?)`         | 403    | `unauthorized`        |
| `HTTPError.forbidden(message?)`            | 403    | `unauthorized`        |
| `HTTPError.notFound(message?)`             | 404    | `not_found`           |
| `HTTPError.conflict(message?)`             | 409    | `conflict`            |
| `HTTPError.tooManyRequests(message?)`      | 429    | `too_many_requests`   |
| `HTTPError.methodNotAllowed(method)`       | 405    | `method_not_allowed`  |
| `HTTPError.serverError(reason)`            | 500    | `server_error`        |
| `HTTPError.serviceUnavailable(message?)`   | 503    | `service_unavailable` |
| `HTTPError.unknown(message?, status?)`     | 500    | `unknown`             |

### Error classes

| Class                     | `error_type`          |
| ------------------------- | --------------------- |
| `BadRequestError`         | `bad_request`         |
| `ValidationError`         | `validation`          |
| `UnauthenticatedError`    | `unauthenticated`     |
| `UnauthorizedError`       | `unauthorized`        |
| `ForbiddenError`          | `unauthorized`        |
| `NotFoundError`           | `not_found`           |
| `ConflictError`           | `conflict`            |
| `TooManyRequestsError`    | `too_many_requests`   |
| `MethodNotAllowedError`   | `method_not_allowed`  |
| `ServerError`             | `server_error`        |
| `ServiceUnavailableError` | `service_unavailable` |
| `UnknownError`            | `unknown`             |

### `ErrorResponse` shape

```typescript
type ErrorResponse = {
  status: number;
  message: string;
  error_type:
    | "bad_request"
    | "validation"
    | "unauthenticated"
    | "unauthorized"
    | "not_found"
    | "conflict"
    | "too_many_requests"
    | "method_not_allowed"
    | "server_error"
    | "service_unavailable"
    | "unknown";
  fieldErrors?: Record<string, string[]>; // validation only
  formErrors?: string[]; // validation only
};
```

---

## Peer dependencies

- `zod >= 4.0.0`
