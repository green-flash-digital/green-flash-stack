import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { ApiClient } from "../ApiClient.js";

// ─── Test subclass ─────────────────────────────────────────────────────────────
// Expose protected methods for testing without polluting the public API.
// Internal helpers are now # private and are covered indirectly through callGet/callMutate.

class TestClient extends ApiClient {
  // Zero-delay retries so tests don't need fake timers or sleeps.
  protected _retryDelay = 0;

  callGet(
    path: string,
    opts: {
      request?: Request;
      retries?: number;
      timeout?: number;
      query?: [z.ZodType, unknown];
    } = {}
  ) {
    return this.get({
      path,
      request: opts.request,
      retries: opts.retries ?? 0,
      timeout: opts.timeout,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query: opts.query as any,
    });
  }

  callMutate(
    path: string,
    opts: {
      method?: "POST" | "PUT" | "PATCH" | "DELETE";
      request?: Request;
      retries?: number;
      timeout?: number;
    } = {}
  ) {
    return this.mutate({
      path,
      method: opts.method ?? "POST",
      request: opts.request,
      retries: opts.retries,
      timeout: opts.timeout,
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function makeResponse(
  body: unknown,
  { status = 200, contentType = "application/json" }: { status?: number; contentType?: string } = {}
): Response {
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  return new Response(bodyStr, { status, headers: { "Content-Type": contentType } });
}

function mockFetchWith(response: Response) {
  const fn = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => vi.restoreAllMocks());

// ─── Endpoint construction ─────────────────────────────────────────────────────
// Internal helpers are # private; endpoint behavior is verified via the URL passed to fetch.

describe("endpoint construction", () => {
  const client = new TestClient({ baseURL: "https://api.example.com" });

  it("appends a path to baseURL", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    await client.callGet("/tags");
    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.example.com/tags");
  });

  it("handles an empty path", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    await client.callGet("");
    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.example.com");
  });

  it("strips a trailing slash from baseURL", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    const c = new TestClient({ baseURL: "https://api.example.com/" });
    await c.callGet("/tags");
    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.example.com/tags");
  });

  it("prefixes path with / if missing", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    await client.callGet("tags");
    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.example.com/tags");
  });
});

// ─── Query string construction ─────────────────────────────────────────────────
// Verified via the URL passed to fetch.

describe("query string construction", () => {
  const client = new TestClient({ baseURL: "https://api.example.com" });
  const Schema = z.object({ page: z.number(), tag: z.string().optional() });

  it("omits query string when no query is provided", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    await client.callGet("/tags");
    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain("?");
  });

  it("omits query string when data is undefined", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    await client.callGet("/tags", { query: [Schema, undefined] });
    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain("?");
  });

  it("serializes defined fields into the URL", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    await client.callGet("/tags", { query: [Schema, { page: 2 }] });
    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.example.com/tags?page=2");
  });

  it("omits undefined optional fields from the URL", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    await client.callGet("/tags", { query: [Schema, { page: 1, tag: undefined }] });
    const [url] = mock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("page=1");
    expect(new URL(url).searchParams.has("tag")).toBe(false);
  });
});

// ─── Static headers ───────────────────────────────────────────────────────────

describe("constructor headers option", () => {
  it("includes static headers in GET requests", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    const client = new TestClient({
      baseURL: "https://api.example.com",
      headers: { "X-Api-Key": "secret123", "X-Tenant": "acme" },
    });

    await client.callGet("/test");

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("X-Api-Key")).toBe("secret123");
    expect(headers.get("X-Tenant")).toBe("acme");
  });

  it("includes static headers in mutate requests", async () => {
    const mock = mockFetchWith(makeJsonResponse({ id: 1 }));
    const client = new TestClient({
      baseURL: "https://api.example.com",
      headers: { Authorization: "Bearer token" },
    });

    await client.callMutate("/test", { method: "POST" });

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token");
  });

  it("works without static headers (defaults to empty object)", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    const client = new TestClient({ baseURL: "https://api.example.com" });
    await client.callGet("/test");
    expect(mock).toHaveBeenCalledTimes(1);
  });
});

// ─── AbortSignal forwarding ───────────────────────────────────────────────────

describe("AbortSignal forwarding", () => {
  it("passes request.signal to the underlying fetch call", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    const controller = new AbortController();
    const request = new Request("https://app.example.com/loader", {
      signal: controller.signal,
      headers: { Cookie: "session=abc" },
    });

    const client = new TestClient({ baseURL: "https://api.example.com" });
    await client.callGet("/test", { request });

    // Compare against request.signal — Node's Request constructor creates a linked
    // but structurally distinct AbortSignal, so we can't use the controller's signal directly.
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(request.signal);
  });

  it("passes no signal when no request is provided (browser context)", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    const client = new TestClient({ baseURL: "https://api.example.com" });
    await client.callGet("/test");

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBeUndefined();
  });
});

// ─── Retry logic ──────────────────────────────────────────────────────────────
// TestClient sets _retryDelay = 0 so retries resolve instantly without fake timers.

describe("retry logic", () => {
  it("retries on server_error and succeeds on the next attempt", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        makeJsonResponse({ error_type: "server_error", status: 500, message: "Crash" }, 500)
      )
      .mockResolvedValueOnce(makeJsonResponse({ id: 1 }));
    vi.stubGlobal("fetch", mockFetch);

    const client = new TestClient({ baseURL: "https://api.example.com" });
    const result = await client.callGet("/test", { retries: 1 });

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("retries on service_unavailable", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        makeJsonResponse({ error_type: "service_unavailable", status: 503, message: "Down" }, 503)
      )
      .mockResolvedValueOnce(makeJsonResponse({ id: 1 }));
    vi.stubGlobal("fetch", mockFetch);

    const client = new TestClient({ baseURL: "https://api.example.com" });
    const result = await client.callGet("/test", { retries: 1 });

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("does not retry on bad_request (4xx errors are not transient)", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        makeJsonResponse({ error_type: "bad_request", status: 400, message: "Bad" }, 400)
      );
    vi.stubGlobal("fetch", mockFetch);

    const client = new TestClient({ baseURL: "https://api.example.com" });
    const result = await client.callGet("/test", { retries: 3 });

    expect(result.success).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("does not retry on not_found", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        makeJsonResponse({ error_type: "not_found", status: 404, message: "Gone" }, 404)
      );
    vi.stubGlobal("fetch", mockFetch);

    const client = new TestClient({ baseURL: "https://api.example.com" });
    const result = await client.callGet("/test", { retries: 3 });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
  });

  it("makes no retry attempts when retries is 0 (default)", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(
        makeJsonResponse({ error_type: "server_error", status: 500, message: "Crash" }, 500)
      );
    vi.stubGlobal("fetch", mockFetch);

    const client = new TestClient({ baseURL: "https://api.example.com" });
    const result = await client.callGet("/test");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
  });
});

// ─── Timeout ─────────────────────────────────────────────────────────────────

describe("timeout", () => {
  it("passes an AbortSignal when a constructor timeout is set", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");

    const client = new TestClient({ baseURL: "https://api.example.com", timeout: 5000 });
    await client.callGet("/test");

    expect(timeoutSpy).toHaveBeenCalledWith(5000);
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("per-call timeout overrides the constructor default", async () => {
    mockFetchWith(makeJsonResponse({ ok: true }));
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");

    const client = new TestClient({ baseURL: "https://api.example.com", timeout: 5000 });
    await client.callGet("/test", { timeout: 2000 });

    expect(timeoutSpy).toHaveBeenCalledWith(2000);
    expect(timeoutSpy).not.toHaveBeenCalledWith(5000);
  });

  it("races request signal and timeout when both are present", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    const anySpy = vi.spyOn(AbortSignal, "any");

    const controller = new AbortController();
    const request = new Request("https://app.example.com/loader", {
      signal: controller.signal,
    });

    const client = new TestClient({ baseURL: "https://api.example.com", timeout: 5000 });
    await client.callGet("/test", { request });

    expect(anySpy).toHaveBeenCalled();
    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("passes no signal when no timeout is set and no request is provided", async () => {
    const mock = mockFetchWith(makeJsonResponse({ ok: true }));
    const client = new TestClient({ baseURL: "https://api.example.com" });
    await client.callGet("/test");

    const [, init] = mock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBeUndefined();
  });
});

// ─── Response parsing ─────────────────────────────────────────────────────────

describe("response parsing", () => {
  const client = new TestClient({ baseURL: "https://api.example.com" });

  it("returns parsed JSON on 200", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse({ id: 1, name: "test" })));
    const result = await client.callGet("/test");
    expect(result).toEqual({ success: true, data: { id: 1, name: "test" } });
  });

  it("returns undefined data on 204 No Content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    const result = await client.callGet("/test");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("returns undefined data when Content-Length is 0", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 200, headers: { "Content-Length": "0" } }))
    );
    const result = await client.callGet("/test");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("returns text on text/plain response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse("hello world", { contentType: "text/plain" }))
    );
    const result = await client.callGet<string>("/test");
    expect(result).toEqual({ success: true, data: "hello world" });
  });

  it("returns a Blob on image/png response", async () => {
    const blob = new Blob(["fake-image-bytes"], { type: "image/png" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(blob, { headers: { "Content-Type": "image/png" } }))
    );
    const result = await client.callGet<Blob>("/photo");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBeInstanceOf(Blob);
  });

  it("returns an ErrorResponse on non-ok JSON error body", async () => {
    const errorBody = { error_type: "not_found", status: 404, message: "Playlist not found" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(errorBody, { status: 404 })));
    const result = await client.callGet("/test");
    expect(result).toEqual({ success: false, error: errorBody });
  });

  it("returns unknown error on non-ok non-JSON body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse("Not found", { status: 404, contentType: "text/plain" }))
    );
    const result = await client.callGet("/test");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.error_type).toBe("unknown");
      expect(result.error.status).toBe(404);
    }
  });

  it("returns unknown error when error body is not a valid ErrorResponse", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ message: "oops" }, { status: 500 }))
    );
    const result = await client.callGet("/test");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.error_type).toBe("unknown");
      expect(result.error.message).toContain("oops");
    }
  });

  it("returns server_error when fetch throws (network down)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network unreachable")));
    const result = await client.callGet("/test");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.error_type).toBe("server_error");
      expect(result.error.message).toContain("Network error");
    }
  });
});
