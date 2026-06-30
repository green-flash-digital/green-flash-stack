# @greenflash/fetchify — Agent Implementation Guide

This document is the authoritative reference for writing code that uses `@greenflash/fetchify`. Follow it exactly. Do not invent fetch utilities, custom error classes, or response shapes — everything you need is already in this package.

---

## Core mental model

Every HTTP interaction flows through three layers:

1. **`ApiClient` subclass** — wraps one feature area of the API. Lives at `packages/webapp/app/clients/`.
2. **`relay`** — standardizes what loaders and actions return. The component always receives `{ data, valError, error }`.
3. **`HTTPError` / `serializeError`** — the server-side half. Throw typed errors in route handlers; `serializeError` converts them to wire JSON.

Never bypass any of these layers. Never use `fetch` directly in a loader or component. Never create custom error shapes.

---

## Building an API client

### ALWAYS subclass `ApiClient`

```typescript
// packages/webapp/app/clients/playlists.client.ts
import { ApiClient, type ApiClientArgs } from "@greenflash/fetchify";
import { z } from "zod";

const CreatePlaylistSchema = z.object({ name: z.string().min(1) });
type Playlist = { id: string; name: string };

export class PlaylistsClient extends ApiClient {
  constructor(args: ApiClientArgs) {
    super({ baseURL: `${args.baseURL}/api/playlist` });
  }

  getList(request?: Request) {
    return this._get<Playlist[]>({ path: "", request });
  }

  getSingle(id: string, request?: Request) {
    return this._get<Playlist>({ path: `/${id}`, request });
  }

  create(body: z.infer<typeof CreatePlaylistSchema>, request?: Request) {
    return this._mutate<Playlist>({
      method: "POST",
      path: "",
      body: [CreatePlaylistSchema, body],
      request,
    });
  }

  delete(id: string, request?: Request) {
    return this._mutate<void>({ method: "DELETE", path: `/${id}`, request });
  }
}
```

### ALWAYS compose feature clients into a top-level SSR client

```typescript
// packages/webapp/app/clients/index.ts
export class ApiClientSSR {
  playlists: PlaylistsClient;
  household: HouseholdClient;

  constructor(args: { baseURL: string }) {
    this.playlists = new PlaylistsClient(args);
    this.household = new HouseholdClient(args);
  }
}
```

### NEVER do any of these

```typescript
// ❌ Don't call fetch directly
const res = await fetch(`${baseURL}/api/playlists`);

// ❌ Don't create standalone async functions instead of a client class
async function getPlaylists(request: Request) { ... }

// ❌ Don't call _get / _mutate from outside the class
const client = new ApiClient({ baseURL: "..." });
await client._get({ path: "/playlists" }); // _get is protected

// ❌ Don't try to access result.data without checking success first
const result = await api.getList(request);
doSomethingWith(result.data); // data may not exist
```

---

## Result handling

Every `_get` and `_mutate` call returns a discriminated union. ALWAYS check `result.success` before accessing `result.data`.

```typescript
const result = await api.playlists.getList(request);

// ✅ Correct
if (!result.success) return relay.error(result.error);
return relay.data({ playlists: result.data });

// ✅ Also correct — shorthand via fromResult
return relay.fromResult(result, (playlists) => ({ playlists }));

// ❌ Wrong — result.data is undefined when success is false
if (result.error) return relay.error(result.error);
return relay.data({ playlists: result.data }); // data may be undefined here
```

---

## React Router patterns

### Loaders

Pass `args.request` into every client call. This forwards the session cookie for SSR auth and the abort signal for cancellation.

```typescript
// ✅ Correct
export async function loader(args: Route.LoaderArgs) {
  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  return relay.fromResult(
    await api.playlists.getList(args.request),
    (playlists) => ({ playlists })
  );
}

// ❌ Wrong — no request forwarding, no relay
export async function loader(args: Route.LoaderArgs) {
  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  const result = await api.playlists.getList();
  return { playlists: result.data };
}
```

**Parallel fetch:**
```typescript
export async function loader(args: Route.LoaderArgs) {
  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  const [playlistResult, photosResult] = await Promise.all([
    api.playlists.getSingle(args.params.id, args.request),
    api.playlists.getPhotos(args.params.id, args.request),
  ]);

  if (!playlistResult.success) return relay.error(playlistResult.error);
  if (!photosResult.success) return relay.error(photosResult.error);
  return relay.data({ playlist: playlistResult.data, photos: photosResult.data });
}
```

**Early bail-out:**
```typescript
export async function loader(args: Route.LoaderArgs) {
  const session = await getSession(args.request);
  if (!session) return relay.error(HTTPError.unauthenticated());
  // proceed
}
```

### Actions

```typescript
// ✅ Validate first, then call API
export async function action(args: Route.ActionArgs) {
  const formRes = await validateFormData(args, CreatePlaylistSchema);
  if (!formRes.success) return relay.validationError(formRes.error);

  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  return relay.fromResult(await api.playlists.create(formRes.data, args.request));
}

// ✅ Redirect on success
export async function action(args: Route.ActionArgs) {
  const formRes = await validateFormData(args, CreatePlaylistSchema);
  if (!formRes.success) return relay.validationError(formRes.error);

  const api = new ApiClientSSR({ baseURL: args.context.env.API_URL });
  const result = await api.playlists.create(formRes.data, args.request);
  if (!result.success) return relay.error(result.error);

  throw redirect(href("/playlists/:id", { id: result.data.id }));
}

// ❌ Wrong — don't throw errors in loaders/actions, return them
export async function action(args: Route.ActionArgs) {
  const result = await api.playlists.create(body, args.request);
  if (!result.success) throw new Error(result.error.message); // wrong
}

// ❌ Wrong — don't return raw data
export async function loader(args: Route.LoaderArgs) {
  const result = await api.playlists.getList(args.request);
  return { playlists: result.data }; // skips error handling, loses type safety
}
```

### Components

```typescript
// Loader data — check error first, then access data
export default function PlaylistsPage() {
  const { data, error } = useLoaderData<typeof loader>();
  if (error) return <ErrorBanner message={error.message} />;
  return <PlaylistList playlists={data!.playlists} />;
}

// Action data — error and valError are independent fields
export default function CreatePage() {
  const actionData = useActionData<typeof action>();
  return (
    <Form method="POST">
      <input name="name" />
      {actionData?.valError?.name && <p>{actionData.valError.name[0]}</p>}
      {actionData?.error && <p>{actionData.error.message}</p>}
      <button type="submit">Create</button>
    </Form>
  );
}
```

---

## Next.js patterns

There is no `Request` object in Next.js Server Components or Server Actions. Build a minimal one from `next/headers`:

```typescript
import { cookies } from "next/headers";

async function makeAuthRequest() {
  const cookieStore = await cookies();
  return new Request("https://internal", {
    headers: { cookie: cookieStore.toString() },
  });
}
```

**Server Component:**
```typescript
export default async function PlaylistsPage() {
  const api = new PlaylistsClient({ baseURL: process.env.API_URL! });
  const result = await api.getList(await makeAuthRequest());
  if (!result.success) return <ErrorBanner message={result.error.message} />;
  return <PlaylistList playlists={result.data} />;
}
```

**Server Action:**
```typescript
"use server";
export async function createPlaylistAction(_: unknown, formData: FormData) {
  const parsed = CreatePlaylistSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return relay.validationError(z.flattenError(parsed.error));

  const api = new PlaylistsClient({ baseURL: process.env.API_URL! });
  return relay.fromResult(await api.create(parsed.data, await makeAuthRequest()));
}
// Consumed via useActionState(createPlaylistAction, null)
```

---

## SPA (browser-only) patterns

Omit the `request` argument. `ApiClient` sends `credentials: "include"` automatically so the cookie jar handles auth.

**With React Query (preferred):**
```typescript
export function usePlaylistsQuery() {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const result = await api.getList(); // no request arg
      if (!result.success) throw result.error;
      return result.data;
    },
  });
}
```

**Event handler:**
```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const parsed = CreatePlaylistSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
  if (!parsed.success) {
    setFieldErrors(z.flattenError(parsed.error).fieldErrors as Record<string, string[]>);
    return;
  }
  const result = await api.create(parsed.data); // no request arg
  if (!result.success) { setError(result.error); return; }
  // handle success
}
```

---

## Server-side error handling (API routes)

### ALWAYS throw `HTTPError.*` in route handlers

```typescript
import { HTTPError } from "@greenflash/fetchify";

// ✅ Correct
app.get("/:id", async (c) => {
  const row = await db.query.playlists.findFirst({ where: eq(playlists.id, params.id) });
  if (!row) throw HTTPError.notFound(`Playlist '${params.id}' not found`);
  return c.json(row);
});

// ❌ Wrong — don't throw plain errors or return non-standard shapes
app.get("/:id", async (c) => {
  const row = await db.query.playlists.findFirst(...);
  if (!row) return c.json({ error: "not found" }, 404); // wrong shape
});
```

### ALWAYS wire `serializeError` into the global error handler — once, never per-route

```typescript
import { serializeError } from "@greenflash/fetchify";

app.onError((err, c) => {
  const error = serializeError(err);
  return c.json(error, error.status as ContentfulStatusCode);
});
```

### Error type reference

| Situation | Method |
|---|---|
| No valid session | `HTTPError.unauthenticated()` |
| Signed in but not permitted | `HTTPError.unauthorized(msg)` |
| DB row missing | `HTTPError.notFound(msg)` |
| Bad input / failed precondition | `HTTPError.badRequest(msg)` |
| ZodError from manual parse | `HTTPError.validation(zodError)` |
| Resource already exists | `HTTPError.conflict(msg)` |
| Our code or integration failed | `HTTPError.serverError(reason)` |
| Maintenance / upstream down | `HTTPError.serviceUnavailable()` |
| Rate limit exceeded | `HTTPError.tooManyRequests()` |

---

## Common agent mistakes to avoid

| Mistake | Correct approach |
|---|---|
| `fetch(url)` directly in a loader | Extend `ApiClient`, call `this._get` |
| `try { } catch (e) { }` around API calls | Check `result.success`; `_get`/`_mutate` never throw |
| `return new Response(...)` from a loader | `return relay.data(...)` or `return relay.error(...)` |
| `throw new Error(...)` in a loader | `return relay.error(HTTPError.badRequest(...))` |
| `if (result.error)` to check failure | `if (!result.success)` — `result.error` doesn't exist on success |
| Inventing `{ success, message }` shapes | Use `ErrorResponse` — `error_type` + `status` + `message` |
| Skipping `args.request` in SSR | Always pass it — session cookie lives there |
| `deserializeError` everywhere | Only use it when you need `instanceof` checks; plain `error_type` comparison is simpler |
| Checking `error.status === 404` | Check `error.error_type === "not_found"` — status codes are unreliable over the wire |
| Custom error classes | Use `HTTPError.*` factory methods; extend `ApiError` only for domain-specific types |
