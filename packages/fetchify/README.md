# @greenflash/fetchify

A complete typed HTTP toolkit for building and consuming APIs. It gives you a base class for writing feature-scoped API clients, a typed error system for constructing and serializing errors, and a relay utility for returning consistent responses from SSR route handlers.

## Table of contents

- [@greenflash/fetchify](#greenflashfetchify)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
  - [Core concepts](#core-concepts)
    - [`ApiClientResult<T>`](#apiclientresultt)
    - [`ErrorResponse`](#errorresponse)
    - [`RelayResult<T>`](#relayresultt)
    - [SSR vs Browser context](#ssr-vs-browser-context)
  - [Building API clients](#building-api-clients)
    - [`get<T>(options)` — read data](#gettoptions--read-data)
    - [`mutate<R>(options)` — write data](#mutateroptions--write-data)
    - [Composing multiple clients](#composing-multiple-clients)
    - [Static headers](#static-headers)
    - [Request timeouts](#request-timeouts)
    - [Retrying transient failures](#retrying-transient-failures)
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
  - [Using `relay`](#using-relay)
    - [`relay.data(data)` — success](#relaydatadata--success)
    - [`relay.error(errorResponse)` — API or domain error](#relayerrorerrorresponse--api-or-domain-error)
    - [`relay.validationError(flattenedError)` — form validation](#relayvalidationerrorflattenederror--form-validation)
    - [`relay.fromResult(result, transform?)` — unwrap an `ApiClientResult`](#relayfromresultresult-transform--unwrap-an-apiclientresult)
  - [Recipes](#recipes)
    - [React Router](#react-router)
    - [Loader: fetch a single resource](#loader-fetch-a-single-resource)
    - [Loader: fetch multiple resources in parallel](#loader-fetch-multiple-resources-in-parallel)
    - [Action: form validation only](#action-form-validation-only)
    - [Action: validate a form then call the API](#action-validate-a-form-then-call-the-api)
    - [Action: validate, call API, override the error message](#action-validate-call-api-override-the-error-message)
    - [Action: redirect on success](#action-redirect-on-success)
    - [Action: bail out before hitting the API](#action-bail-out-before-hitting-the-api)
    - [Component: consuming all three cases](#component-consuming-all-three-cases)
    - [Next.js](#nextjs)
    - [Server Component: fetch data](#server-component-fetch-data)
    - [Server Component: fetch multiple in parallel](#server-component-fetch-multiple-in-parallel)
    - [Server Action: validate and call the API](#server-action-validate-and-call-the-api)
    - [Server Action: redirect on success](#server-action-redirect-on-success)
    - [SPA (browser-only)](#spa-browser-only)
    - [Fetch on mount with useState](#fetch-on-mount-with-usestate)
    - [With React Query](#with-react-query)
    - [Event handler: form submit](#event-handler-form-submit)
  - [Advanced](#advanced)
    - [`deserializeError` — `instanceof` checks on errors](#deserializeerror--instanceof-checks-on-errors)
    - [Custom error classes](#custom-error-classes)
    - [`tryFetch` — direct HTTP calls without a client class](#tryfetch--direct-http-calls-without-a-client-class)
    - [`tryHandle` — wrap non-fetch async work](#tryhandle--wrap-non-fetch-async-work)
  - [Testing](#testing)
  - [API reference](#api-reference)
    - [`HTTPError` methods](#httperror-methods)
    - [`ApiClient` protected methods](#apiclient-protected-methods)
      - [`ApiClient` constructor](#apiclient-constructor)
      - [`get<T>(options)`](#gettoptions)
      - [`mutate<R>(options)`](#mutateroptions)
    - [Error classes](#error-classes)
    - [`ErrorResponse` shape](#errorresponse-shape)
  - [Peer dependencies](#peer-dependencies)

---

## Installation

```bash
npm install @greenflash/fetchify zod
```

---

## Getting Started

The core of fetchify is `ApiClient`. You extend it to create a typed client for a specific part of your API.

**Step 1** — Create a client for your feature:

```typescript
import { ApiClient, type ApiClientArgs } from "@greenflash/fetchify";
import { z } from "zod";

const CreatePlaylistSchema = z.object({ name: z.string().min(1) });
type Playlist = { id: string; name: string; description: string | null };

export class PlaylistsClient extends ApiClient {
  constructor(args: ApiClientArgs) {
    super({ baseURL: `${args.baseURL}/api/playlist` });
  }

  getList(request?: Request) {
    return this.get<Playlist[]>({ path: "", request });
  }

  create(body: z.infer<typeof CreatePlaylistSchema>, request?: Request) {
    return this.mutate<Playlist>({ method: "POST", path: "", body: [CreatePlaylistSchema, body], request });
  }

  delete(id: string, request?: Request) {
    return this.mutate<{ message: string }>({ method: "DELETE", path: `/${id}`, request });
  }
}
```

**Step 2** — Call it and handle the result:

```typescript
const client = new PlaylistsClient({ baseURL: "https://api.example.com" });

const result = await client.getList();

if (result.success) {
  console.log(result.data); // Playlist[]
} else {
  console.error(result.error.message); // ErrorResponse
}
```

Every method returns `{ success: true; data: T } | { success: false; error: ErrorResponse }` — it never throws. You always handle both cases explicitly.

**Step 3** — Wire it into a React Router loader:

```typescript
import { relay } from "@greenflash/fetchify";

export async function loader(args: Route.LoaderArgs) {
  const api = new PlaylistsClient({ baseURL: args.context.env.API_URL });
  return relay.fromResult(
    await api.getList(args.request),
    (playlists) => ({ playlists })
  );
}

export default function PlaylistsPage() {
  const { data, error } = useLoaderData<typeof loader>();
  if (error) return <p>Error: {error.message}</p>;
  return <ul>{data!.playlists.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

That's the full pattern. The sections below explain each piece in detail.

---

## Core concepts

### `ApiClientResult<T>`

Every `get` and `mutate` call returns this discriminated union:

```typescript
type ApiClientResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };
```

It never throws. You check `result.success` and TypeScript narrows the type from there. On `true`, you get `result.data`. On `false`, you get `result.error`.

### `ErrorResponse`

The standardized error shape that travels over the wire as JSON. The API sends it; the client receives it.

```typescript
type ErrorResponse = {
  status: number;
  message: string;
  error_type: "bad_request" | "validation" | "unauthenticated" | "unauthorized"
            | "not_found" | "conflict" | "too_many_requests" | "method_not_allowed"
            | "server_error" | "service_unavailable" | "unknown";
  // Only present when error_type === "validation":
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};
```

### `RelayResult<T>`

The standardized shape returned from SSR route handlers. Only one field is set at a time:

```typescript
type RelayResult<T> = {
  data: T | undefined;       // Set on success
  valError: V | undefined;   // Set on form validation error
  error: ErrorResponse | undefined; // Set on API or domain error
};
```

The component always receives this same shape, regardless of what happened in the loader or action.

### SSR vs Browser context

Pass a `Request` in SSR contexts to forward the session cookie. Omit it in the browser — the cookie jar handles auth automatically.

```typescript
// SSR: pass the incoming request
const result = await api.getList(args.request);

// Browser: omit the request
const result = await api.getList();
```

`ApiClient` detects the context from the presence of `request` and handles headers and credentials automatically. No subclassing required.

---

## Building API clients

### `get<T>(options)` — read data

Use for `GET` requests. Specify the path, an optional request for SSR, and optional validated query params.

```typescript
// Simple GET
getList(request?: Request) {
  return this.get<Playlist[]>({ path: "", request });
}

// GET with query params
search(query: { term: string; page: number }, request?: Request) {
  return this.get<Playlist[]>({
    path: "/search",
    query: [SearchQuerySchema, query],
    request,
  });
}
```

### `mutate<R>(options)` — write data

Use for `POST`, `PUT`, `PATCH`, and `DELETE` requests. Accepts a Zod-validated JSON body or FormData.

```typescript
// POST with validated JSON body
create(body: CreatePlaylistRequest, request?: Request) {
  return this.mutate<Playlist>({
    method: "POST",
    path: "",
    body: [CreatePlaylistSchema, body],
    request,
  });
}

// DELETE with no body
delete(id: string, request?: Request) {
  return this.mutate<{ message: string }>({
    method: "DELETE",
    path: `/${id}`,
    request,
  });
}

// PATCH with body + query
update(id: string, body: UpdatePlaylistRequest, request?: Request) {
  return this.mutate<Playlist>({
    method: "PATCH",
    path: `/${id}`,
    body: [UpdatePlaylistSchema, body],
    request,
  });
}
```

### Composing multiple clients

Compose individual feature clients into a single top-level client:

```typescript
export class ApiClientSSR {
  playlists: PlaylistsClient;
  household: HouseholdClient;
  onboarding: OnboardingClient;

  constructor(args: { baseURL: string }) {
    this.playlists = new PlaylistsClient(args);
    this.household = new HouseholdClient(args);
    this.onboarding = new OnboardingClient(args);
  }
}

// In a loader
const api = new ApiClientSSR({ baseURL: env.API_URL });
const result = await api.playlists.getList(args.request);
```

### Static headers

Pass a `headers` map to the constructor to include fixed headers on every request — useful for API keys, tenant IDs, or correlation headers that don't change per call.

```typescript
export class PlaylistsClient extends ApiClient {
  constructor(args: ApiClientArgs) {
    super({
      baseURL: `${args.baseURL}/api/playlist`,
      headers: {
        "X-Api-Key": process.env.INTERNAL_API_KEY!,
        "X-Tenant-Id": "acme",
      },
    });
  }
}
```

Static headers are merged into every `get` and `mutate` call. They are applied after session headers are copied from the incoming `Request`, so they cannot be overridden by the caller.

### Request timeouts

`fetch` has no built-in timeout. Without one, a hanging server can hold a Cloudflare Worker slot indefinitely until the runtime kills it. Set a default timeout (in milliseconds) in the constructor, and override it per call when needed.

```typescript
export class PlaylistsClient extends ApiClient {
  constructor(args: ApiClientArgs) {
    super({
      baseURL: `${args.baseURL}/api/playlist`,
      timeout: 10_000, // 10 seconds for all calls
    });
  }

  // Override per call for endpoints that are expected to be slow
  generateReport(request?: Request) {
    return this.get<Report>({ path: "/report", request, timeout: 30_000 });
  }
}
```

When a `Request` is provided (SSR) and a timeout is set, both are raced using `AbortSignal.any()` — whichever fires first wins. If the React Router runtime cancels the request (user navigates away), that takes effect immediately regardless of the timeout.

### Retrying transient failures

Both `get` and `mutate` accept a `retries` option. When a request fails with `server_error` (500) or `service_unavailable` (503), the client waits 1 second and tries again, up to `retries` times. All other error types — including any 4xx — are not retried.

```typescript
// Retry up to 2 times on transient server errors
getList(request?: Request) {
  return this.get<Playlist[]>({ path: "", request, retries: 2 });
}
```

Use `retries` for read operations against third-party services or your own API behind a cold-start edge worker. Avoid it for mutations unless your endpoint is idempotent.

**AbortSignal is forwarded automatically.** When the user navigates away in React Router, the incoming `Request` carries an `AbortSignal` that cancels the outgoing fetch — no configuration needed. If `request` is omitted (browser context), no signal is set.

```typescript
// SSR: if the user navigates before the response arrives, the outgoing
// fetch is cancelled via request.signal automatically.
const result = await api.playlists.getList(args.request);
```

---

## Using `HTTPError`

`HTTPError` is a factory class for constructing typed errors. Use it on the **server** to throw from route handlers and on the **client** to construct error values to pass to `relay.error()`.

```typescript
import { HTTPError } from "@greenflash/fetchify";
```

| Method | Status | When to use |
|---|---|---|
| `HTTPError.badRequest(msg?)` | 400 | Caller error — bad input or failed precondition |
| `HTTPError.validation(zodError, msg?)` | 400 | Zod parse failed — flattens field errors automatically |
| `HTTPError.unauthenticated(msg?)` | 401 | No valid session |
| `HTTPError.unauthorized(msg?)` | 403 | Signed in but not permitted |
| `HTTPError.forbidden(msg?)` | 403 | Access denied (alias for unauthorized) |
| `HTTPError.notFound(msg?)` | 404 | DB row or resource doesn't exist |
| `HTTPError.conflict(msg?)` | 409 | Resource already exists or state conflict |
| `HTTPError.tooManyRequests(msg?)` | 429 | Rate limit exceeded |
| `HTTPError.methodNotAllowed(method)` | 405 | HTTP method not supported |
| `HTTPError.serverError(reason)` | 500 | Our code or integration failed unexpectedly |
| `HTTPError.serviceUnavailable(msg?)` | 503 | Service temporarily down — try again later |
| `HTTPError.unknown(msg?, status?)` | 500 | Unknown or uncategorised error |

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
    where: eq(households.id, params.id)
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
        eq(schema.playlist.isActive, true)
      )
    )
    .limit(1);

  if (!rows[0]) {
    throw HTTPError.notFound(`Playlist '${params.id}' not found.`);
    // → 404 { error_type: "not_found", message: "Playlist 'abc123' not found." }
  }

  return response.json(c, { schema: GetSinglePlaylistResponseSchema, data: rows[0] });
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
    betterAuth.checkOrganizationSlug({ body: { slug: params.slug } })
  );

  if (!slugRes.success) {
    throw HTTPError.badRequest(`The slug '${params.slug}' is already taken`);
    // → 400 { error_type: "bad_request", message: "The slug 'my-home' is already taken" }
  }

  return response.json(c, { schema: ValidateSlugResponseSchema, data: { isAvailable: true } });
});
```

### `serverError` — external service returns null unexpectedly

Use when a third-party call succeeds (no exception) but returns `null` where it should always return data. This is an integration problem, not a caller problem.

```typescript
// GET /api/household/:slug
app.get("/:slug", async (c) => {
  const res = await betterAuth.getFullOrganization({
    query: { organizationSlug: params.slug },
    headers: c.req.raw.headers
  });

  if (!res) {
    throw HTTPError.serverError(`Failed to fetch household '${params.slug}' from auth provider.`);
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
    throw HTTPError.conflict("You already belong to a household. Leave it before creating a new one.");
    // → 409 { error_type: "conflict", message: "You already belong to a household..." }
  }
  // proceed with creation
});

// POST /api/onboarding/validate-slug — slug is taken
app.get("/:slug", async (c) => {
  const existing = await db.query.households.findFirst({
    where: eq(households.slug, params.slug)
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
    throw HTTPError.tooManyRequests("Rate limit exceeded. Try again in 60 seconds.");
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
    throw HTTPError.serviceUnavailable("The service is under maintenance. Please try again in a few minutes.");
    // → 503 { error_type: "service_unavailable", message: "The service is under maintenance..." }
  }
  return next();
});

// Or when a critical upstream (e.g. database) is unreachable
app.use("*", async (c, next) => {
  const dbRes = await tryHandle(createDb().ping());
  if (!dbRes.success) {
    throw HTTPError.serviceUnavailable("Unable to reach the database. Please try again shortly.");
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
import { serializeError } from "@greenflash/fetchify";
import type { ContentfulStatusCode } from "hono/utils/http-status";

app.onError((err, c) => {
  const error = serializeError(err);
  console.error(`[${error.status}] ${error.error_type}: ${error.message}`);
  return c.json(error, error.status as ContentfulStatusCode);
});
```

---

## Using `relay`

`relay` builds a consistent `{ data, valError, error }` envelope from SSR loaders and actions. The component always receives the same shape — it just checks whichever field it needs.

```typescript
import { relay } from "@greenflash/fetchify";
```

### `relay.data(data)` — success

Wrap any successful result.

```typescript
return relay.data({ playlists, household });
```

### `relay.error(errorResponse)` — API or domain error

Wrap an `ErrorResponse` from a failed API call, or construct one with `HTTPError`.

```typescript
// From a failed API result
if (!result.success) return relay.error(result.error);

// Constructed inline
return relay.error(HTTPError.badRequest("Unable to create playlist"));
```

### `relay.validationError(flattenedError)` — form validation

Wrap Zod form validation errors. Field errors are narrowed to the exact keys of the schema — the component gets typed access to per-field messages.

```typescript
const parsed = CreatePlaylistSchema.safeParse(formData);
if (!parsed.success) return relay.validationError(z.flattenError(parsed.error));
// → { valError: { name: ["Too short"] }, data: undefined, error: undefined }
```

### `relay.fromResult(result, transform?)` — unwrap an `ApiClientResult`

The most common method. Unwraps an `ApiClientResult` into a `RelayResult`. Pass a `transform` callback to rename or reshape the data on the way through — this eliminates the manual `if (!result.success)` split in the common case.

```typescript
// Pass-through — data shape unchanged
return relay.fromResult(await api.playlists.create(body, request));

// With transform — rename the data
return relay.fromResult(
  await api.playlists.getList(request),
  (playlists) => ({ playlists })
);
```

---

## Recipes

### React Router

Pass `args.request` from the loader or action into the client. `ApiClient` reads the session cookie from the request headers for SSR auth, and forwards `request.signal` so navigating away cancels the in-flight fetch automatically.

### Loader: fetch a single resource

```typescript
export async function loader(args: Route.LoaderArgs) {
  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  return relay.fromResult(
    await api.playlists.getSingle(args.params.id, args.request),
    (playlist) => ({ playlist })
  );
}
```

### Loader: fetch multiple resources in parallel

```typescript
export async function loader(args: Route.LoaderArgs) {
  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });

  const [playlistResult, photosResult] = await Promise.all([
    api.playlists.getSingle(args.params.id, args.request),
    api.playlists.getPhotos(args.params.id, args.request),
  ]);

  if (!playlistResult.success) return relay.error(playlistResult.error);
  if (!photosResult.success) return relay.error(photosResult.error);

  return relay.data({
    playlist: playlistResult.data,
    photos: photosResult.data,
  });
}
```

### Action: form validation only

When the action only validates and stores data locally — no API call needed.

```typescript
export async function action(args: Route.ActionArgs) {
  const formRes = await validateFormData(args, SetStepSchema);
  if (!formRes.success) return relay.validationError(formRes.error);
  return relay.data({ step: formRes.data.step });
}
```

### Action: validate a form then call the API

```typescript
export async function action(args: Route.ActionArgs) {
  const formRes = await validateFormData(args, CreatePlaylistSchema);
  if (!formRes.success) return relay.validationError(formRes.error);

  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  return relay.fromResult(await api.playlists.create(formRes.data, args.request));
}
```

### Action: validate, call API, override the error message

When you don't want to expose raw API error detail to the user.

```typescript
export async function action(args: Route.ActionArgs) {
  const formRes = await validateFormData(args, CreatePlaylistSchema);
  if (!formRes.success) return relay.validationError(formRes.error);

  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  const result = await api.playlists.create(formRes.data, args.request);
  if (!result.success) return relay.error(HTTPError.badRequest("Unable to create playlist"));
  return relay.data(result.data);
}
```

### Action: redirect on success

```typescript
export async function action(args: Route.ActionArgs) {
  const formRes = await validateFormData(args, CreatePlaylistSchema);
  if (!formRes.success) return relay.validationError(formRes.error);

  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  const result = await api.playlists.create(formRes.data, args.request);
  if (!result.success) return relay.error(result.error);

  throw redirect(href("/:household_id/:playlist_id", {
    household_id: args.params.household_id,
    playlist_id: result.data.id,
  }));
}
```

### Action: bail out before hitting the API

When a precondition fails on the SSR layer and the API call would fail anyway.

```typescript
export async function loader(args: Route.LoaderArgs) {
  const session = await getSession(args.request);
  if (!session) return relay.error(HTTPError.unauthenticated());

  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  return relay.fromResult(await api.playlists.getList(args.request));
}
```

### Component: consuming all three cases

The component always has the same `{ data, valError, error }` shape — check each independently.

```typescript
export default function PlaylistsPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  // Loader failed — show a page-level error
  if (loaderData.error) {
    return <ErrorBanner message={loaderData.error.message} />;
  }

  return (
    <div>
      <PlaylistList playlists={loaderData.data!.playlists} />

      <Form method="POST">
        <input name="name" />

        {/* Per-field validation error from the action */}
        {actionData?.valError?.name && (
          <p className="error">{actionData.valError.name[0]}</p>
        )}

        {/* API or domain error from the action */}
        {actionData?.error && (
          <p className="error">{actionData.error.message}</p>
        )}

        <button type="submit">Create playlist</button>
      </Form>
    </div>
  );
}
```

---

### Next.js

In Next.js there is no `Request` object available in Server Components or Server Actions. Forward the session cookie by reading it from `next/headers` and constructing a minimal `Request` — `ApiClient` only reads the headers and signal from it, so the URL is irrelevant.

```typescript
import { cookies } from "next/headers";

async function makeAuthRequest() {
  const cookieStore = await cookies();
  return new Request("https://internal", {
    headers: { cookie: cookieStore.toString() }
  });
}
```

`relay` works the same way in Server Actions — the return shape is consumed by `useActionState` on the client.

### Server Component: fetch data

```typescript
import { cookies } from "next/headers";
import { PlaylistsClient } from "@/clients/playlists";

export default async function PlaylistsPage() {
  const cookieStore = await cookies();
  const request = new Request("https://internal", {
    headers: { cookie: cookieStore.toString() },
  });

  const api = new PlaylistsClient({ baseURL: process.env.API_URL! });
  const result = await api.getList(request);

  if (!result.success) return <ErrorBanner message={result.error.message} />;
  return <PlaylistList playlists={result.data} />;
}
```

### Server Component: fetch multiple in parallel

```typescript
export default async function PlaylistDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const request = new Request("https://internal", {
    headers: { cookie: cookieStore.toString() },
  });

  const api = new ApiClientSSR({ baseURL: process.env.API_URL! });
  const [playlistResult, photosResult] = await Promise.all([
    api.playlists.getSingle(params.id, request),
    api.playlists.getPhotos(params.id, request),
  ]);

  if (!playlistResult.success) return <ErrorBanner message={playlistResult.error.message} />;
  if (!photosResult.success) return <ErrorBanner message={photosResult.error.message} />;

  return <PlaylistDetail playlist={playlistResult.data} photos={photosResult.data} />;
}
```

### Server Action: validate and call the API

```typescript
// actions/playlist.ts
"use server";
import { cookies } from "next/headers";
import { relay } from "@greenflash/fetchify";
import { z } from "zod";
import { PlaylistsClient } from "@/clients/playlists";

export async function createPlaylistAction(_: unknown, formData: FormData) {
  const parsed = CreatePlaylistSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return relay.validationError(z.flattenError(parsed.error));

  const cookieStore = await cookies();
  const request = new Request("https://internal", {
    headers: { cookie: cookieStore.toString() },
  });

  const api = new PlaylistsClient({ baseURL: process.env.API_URL! });
  return relay.fromResult(await api.create(parsed.data, request));
}

// Component:
export default function CreatePlaylistPage() {
  const [state, formAction] = useActionState(createPlaylistAction, null);
  return (
    <form action={formAction}>
      <input name="name" />
      {state?.valError?.name && <p className="error">{state.valError.name[0]}</p>}
      {state?.error && <p className="error">{state.error.message}</p>}
      <button type="submit">Create</button>
    </form>
  );
}
```

### Server Action: redirect on success

```typescript
"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPlaylistAction(_: unknown, formData: FormData) {
  const parsed = CreatePlaylistSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return relay.validationError(z.flattenError(parsed.error));

  const cookieStore = await cookies();
  const request = new Request("https://internal", {
    headers: { cookie: cookieStore.toString() },
  });

  const api = new PlaylistsClient({ baseURL: process.env.API_URL! });
  const result = await api.create(parsed.data, request);
  if (!result.success) return relay.error(result.error);

  revalidatePath("/playlists");
  redirect(`/playlists/${result.data.id}`);
}
```

---

### SPA (browser-only)

In a browser-only context omit the `request` argument entirely. `ApiClient` falls back to `credentials: "include"` so the browser's cookie jar handles auth automatically.

### Fetch on mount with useState

```typescript
import { useEffect, useState } from "react";
import type { ErrorResponse } from "@greenflash/fetchify";

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // No request arg — browser cookie jar handles auth
    api.getList().then((result) => {
      if (!controller.signal.aborted) {
        if (result.success) setPlaylists(result.data);
        else setError(result.error);
      }
    });
    return () => controller.abort();
  }, []);

  if (error) return <ErrorBanner message={error.message} />;
  if (!playlists) return <Spinner />;
  return <PlaylistList playlists={playlists} />;
}
```

### With React Query

The cleanest SPA pattern — throw `result.error` so React Query treats it as a query failure. Cast it to `ErrorResponse` in the component since it preserves the serialized shape.

```typescript
import { useQuery } from "@tanstack/react-query";
import type { ErrorResponse } from "@greenflash/fetchify";

export function usePlaylistsQuery() {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const result = await api.getList();
      if (!result.success) throw result.error;
      return result.data;
    },
  });
}

export function PlaylistsPage() {
  const { data: playlists, error } = usePlaylistsQuery();
  if (error) return <ErrorBanner message={(error as ErrorResponse).message} />;
  return <PlaylistList playlists={playlists ?? []} />;
}
```

### Event handler: form submit

```typescript
export function CreatePlaylistForm() {
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = CreatePlaylistSchema.safeParse(data);
    if (!parsed.success) {
      setFieldErrors(z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
      return;
    }

    const result = await api.create(parsed.data);
    if (!result.success) {
      if (result.error.error_type === "validation") {
        setFieldErrors(result.error.fieldErrors ?? {});
      } else {
        setError(result.error);
      }
      return;
    }

    // success — navigate, reset form, etc.
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      {fieldErrors.name && <p className="error">{fieldErrors.name[0]}</p>}
      {error && <p className="error">{error.message}</p>}
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Advanced

### `deserializeError` — `instanceof` checks on errors

`ApiClient` and `tryFetch` return `ErrorResponse` as a plain object — no class methods, no `instanceof`. If you need to branch using the class hierarchy, convert it with `deserializeError`.

```typescript
import { deserializeError, UnauthenticatedError, NotFoundError } from "@greenflash/fetchify";

const result = await tryFetch<User>("/api/profile");
if (!result.success) {
  const err = deserializeError(result.error);
  if (err instanceof UnauthenticatedError) return redirect("/login");
  if (err instanceof NotFoundError) return redirect("/onboarding");
  throw err; // re-throw anything unexpected
}
```

> In most cases you don't need this — checking `error.error_type === "unauthenticated"` on the plain object is simpler. Use `deserializeError` when you specifically need the class hierarchy (retry logic, `instanceof` in catch blocks, etc.).

### Custom error classes

Extend `ApiError` directly for domain-specific error types:

```typescript
import { ApiError } from "@greenflash/fetchify";

class RateLimitError extends ApiError<"bad_request"> {
  readonly retryAfter: number;

  constructor(retryAfter: number) {
    super({ error_type: "bad_request", status: 429, message: "Rate limit exceeded" });
    this.retryAfter = retryAfter;
  }
}

throw new RateLimitError(60); // serializeError handles it via instanceof ApiError
```

### `tryFetch` — direct HTTP calls without a client class

Use when you need to call a URL directly and don't want to build a full client class.

```typescript
import { tryFetch } from "@greenflash/fetchify";

const result = await tryFetch<{ status: string }>("/api/health");
if (!result.success) console.error(result.error.message);
else console.log(result.data.status);
```

### `tryHandle` — wrap non-fetch async work

Wraps any promise in the same discriminated union pattern. Useful for database queries, file I/O, or third-party calls where you want to avoid try/catch.

```typescript
import { tryHandle } from "@greenflash/fetchify";

const result = await tryHandle(
  db.select().from(schema.playlist).where(eq(schema.playlist.id, id)).limit(1)
);

if (!result.success) {
  throw HTTPError.serverError("Database query failed");
}

const [playlist] = result.data;
if (!playlist) throw HTTPError.notFound(`Playlist '${id}' not found`);
```

---

## Testing

The package ships with a Vitest test suite covering all public surface area.

```bash
yarn workspace @greenflash/fetchify test         # run once
yarn workspace @greenflash/fetchify test:watch   # watch mode
yarn workspace @greenflash/fetchify test:coverage
```

**What's covered:**

| File | What it tests |
|---|---|
| `tryHandle.test.ts` | Promise wrapping, error coercion, non-Error rejections |
| `tryFetch.test.ts` | 200/204/text/blob responses, `ErrorResponse` parsing, network failures, `AbortSignal` passthrough |
| `httpError.test.ts` | All factory methods, `.toJson()`, `serializeError`, `deserializeError` round-trips |
| `relay.test.ts` | All four relay methods including `fromResult` transform overload |
| `ApiClient.test.ts` | endpoint construction, query string building, static headers, `AbortSignal` forwarding, retry on `server_error`/`service_unavailable`, no retry on 4xx |

**Testing subclasses in your own packages**

`ApiClient` methods are `protected`, not `private`. To test a subclass, expose the methods you need through a thin test helper:

```typescript
class TestClient extends PlaylistsClient {
  protected _retryDelay = 0; // instant retries — no fake timers needed
}
```

Setting `_retryDelay = 0` removes the 1-second delay between retries so your retry tests run instantly without fake timers.

---

## API reference

### `HTTPError` methods

| Method | Status | `error_type` |
|---|---|---|
| `HTTPError.badRequest(message?)` | 400 | `bad_request` |
| `HTTPError.validation(zodError, message?)` | 400 | `validation` |
| `HTTPError.unauthenticated(message?)` | 401 | `unauthenticated` |
| `HTTPError.unauthorized(message?)` | 403 | `unauthorized` |
| `HTTPError.forbidden(message?)` | 403 | `unauthorized` |
| `HTTPError.notFound(message?)` | 404 | `not_found` |
| `HTTPError.conflict(message?)` | 409 | `conflict` |
| `HTTPError.tooManyRequests(message?)` | 429 | `too_many_requests` |
| `HTTPError.methodNotAllowed(method)` | 405 | `method_not_allowed` |
| `HTTPError.serverError(reason)` | 500 | `server_error` |
| `HTTPError.serviceUnavailable(message?)` | 503 | `service_unavailable` |
| `HTTPError.unknown(message?, status?)` | 500 | `unknown` |

### `ApiClient` protected methods

#### `ApiClient` constructor

| Option | Type | Description |
|---|---|---|
| `baseURL` | `string` | Base URL for all requests |
| `headers` | `Record<string, string>?` | Static headers merged into every request |
| `timeout` | `number?` | Default request timeout in ms. Applied via `AbortSignal.timeout()`. |

#### `get<T>(options)`

| Option | Type | Description |
|---|---|---|
| `path` | `string` | Path appended to `baseURL` |
| `request` | `Request?` | Incoming SSR request — headers and `AbortSignal` forwarded automatically |
| `query` | `[ZodSchema, data]?` | Validated query params |
| `retries` | `number?` | Times to retry on `server_error` / `service_unavailable`. Default: `0` |
| `timeout` | `number?` | Per-call timeout in ms. Overrides the constructor default. |

#### `mutate<R>(options)`

| Option | Type | Description |
|---|---|---|
| `path` | `string` | Path appended to `baseURL` |
| `method` | `"POST" \| "PUT" \| "PATCH" \| "DELETE"` | HTTP method |
| `request` | `Request?` | Incoming SSR request — headers and `AbortSignal` forwarded automatically |
| `body` | `[ZodSchema, data] \| FormData?` | JSON body (Zod-validated) or FormData |
| `query` | `[ZodSchema, data]?` | Validated query params |
| `retries` | `number?` | Times to retry on `server_error` / `service_unavailable`. Default: `0` |
| `timeout` | `number?` | Per-call timeout in ms. Overrides the constructor default. |

### Error classes

| Class | `error_type` |
|---|---|
| `BadRequestError` | `bad_request` |
| `ValidationError` | `validation` |
| `UnauthenticatedError` | `unauthenticated` |
| `UnauthorizedError` | `unauthorized` |
| `ForbiddenError` | `unauthorized` |
| `NotFoundError` | `not_found` |
| `ConflictError` | `conflict` |
| `TooManyRequestsError` | `too_many_requests` |
| `MethodNotAllowedError` | `method_not_allowed` |
| `ServerError` | `server_error` |
| `ServiceUnavailableError` | `service_unavailable` |
| `UnknownError` | `unknown` |

### `ErrorResponse` shape

```typescript
type ErrorResponse = {
  status: number;
  message: string;
  error_type: "bad_request" | "validation" | "unauthenticated" | "unauthorized"
            | "not_found" | "conflict" | "too_many_requests" | "method_not_allowed"
            | "server_error" | "service_unavailable" | "unknown";
  fieldErrors?: Record<string, string[]>; // validation only
  formErrors?: string[];                  // validation only
};
```

---

## Peer dependencies

- `zod >= 4.0.0`
