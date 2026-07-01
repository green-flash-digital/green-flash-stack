import { tryHandle } from "@green-flash/ts-utils/isomorphic";
import { ErrorResponseSchema, type ErrorResponse } from "@greenflash/http-errors";
import type { z, ZodType } from "zod";

export type ApiClientArgs = {
  baseURL: string;
  /** Static headers merged into every request — useful for API keys, tenant IDs, correlation headers. */
  headers?: Record<string, string>;
  /**
   * Default request timeout in milliseconds, applied via AbortSignal.timeout().
   * Can be overridden per call via the `timeout` option on `get` / `mutate`.
   * When a request with an existing signal is provided, both are raced via AbortSignal.any().
   */
  timeout?: number;
};

export type ApiClientResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };

// Extend RequestInit with credentials since it's not present in all runtimes (e.g. Cloudflare Workers)
type FetchInit = RequestInit & {
  credentials?: "omit" | "same-origin" | "include";
};

function getContentType(headers: Headers): "json" | "text" | "blob" | "unknown" {
  const mimeType = (headers.get("Content-Type") ?? "").split(";")[0].trim().toLowerCase();
  if (mimeType === "application/json" || mimeType.endsWith("+json")) return "json";
  if (mimeType.startsWith("text/")) return "text";
  if (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/") ||
    mimeType === "application/octet-stream" ||
    mimeType === "application/pdf" ||
    mimeType === "application/zip"
  )
    return "blob";
  return "unknown";
}

const RETRYABLE_ERRORS = new Set<ErrorResponse["error_type"]>([
  "server_error",
  "service_unavailable"
]);

export class ApiClient {
  #baseURL: string;
  #staticHeaders: Record<string, string>;
  #timeout: number | undefined;
  /** Delay in ms between retry attempts. Override to 0 in test subclasses to avoid fake timers. */
  protected _retryDelay = 1000;

  constructor({ baseURL, headers = {}, timeout }: ApiClientArgs) {
    this.#baseURL = baseURL;
    this.#staticHeaders = headers;
    this.#timeout = timeout;
  }

  #makeHeaders(request: Request): Headers {
    const headers = new Headers();
    request.headers.forEach((value, key) => headers.set(key, value));
    return headers;
  }

  #prepareHeaders(request?: Request): Headers {
    const headers = request ? this.#makeHeaders(request) : new Headers();
    for (const [key, value] of Object.entries(this.#staticHeaders)) {
      headers.set(key, value);
    }
    return headers;
  }

  #getRequestInitOptions(request?: Request): Partial<FetchInit> {
    return request ? {} : { credentials: "include" };
  }

  #makeSignal(request?: Request, timeout?: number): AbortSignal | undefined {
    const ms = timeout ?? this.#timeout;
    if (request?.signal !== undefined && ms !== undefined) {
      return AbortSignal.any([request.signal, AbortSignal.timeout(ms)]);
    }
    if (request?.signal !== undefined) return request.signal;
    if (ms !== undefined) return AbortSignal.timeout(ms);
    return undefined;
  }

  async #withRetry<T>(
    fn: () => Promise<ApiClientResult<T>>,
    retries: number
  ): Promise<ApiClientResult<T>> {
    const result = await fn();
    if (!result.success && retries > 0 && RETRYABLE_ERRORS.has(result.error.error_type)) {
      await new Promise<void>((resolve) => setTimeout(resolve, this._retryDelay));
      return this.#withRetry(fn, retries - 1);
    }
    return result;
  }

  #makeQueryString<Q extends ZodType = ZodType>(
    query?: [schema: Q, data: z.infer<Q> | undefined]
  ): string {
    if (!query) return "";
    const [schema, value] = query;
    if (value === undefined) return "";

    const validated = schema.parse(value);
    const searchParams = new URLSearchParams();

    if (validated && typeof validated === "object" && !Array.isArray(validated)) {
      Object.entries(validated as Record<string, unknown>).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            val.forEach((item) => {
              if (item !== undefined && item !== null) searchParams.append(key, String(item));
            });
          } else {
            searchParams.append(key, String(val));
          }
        }
      });
    }

    return searchParams.toString();
  }

  #makeEndpoint(args: { path: string; queryString: string }): string {
    let relativePath = args.path;
    if (args.queryString) {
      const separator = args.path.includes("?") ? "&" : "?";
      relativePath = `${args.path}${separator}${args.queryString}`;
    }

    const baseURL = this.#baseURL.endsWith("/") ? this.#baseURL.slice(0, -1) : this.#baseURL;
    const normalizedPath =
      relativePath === "" || relativePath.startsWith("?")
        ? relativePath
        : relativePath.startsWith("/")
          ? relativePath
          : `/${relativePath}`;

    return `${baseURL}${normalizedPath}`;
  }

  #makeBody<B extends ZodType = ZodType>(
    body?: [schema: B, data: z.infer<B>] | FormData
  ): string | FormData | undefined {
    if (!body) return undefined;
    if (body instanceof FormData) return body;
    const [schema, value] = body;
    return JSON.stringify(schema.parse(value));
  }

  async #fetch<R>(url: string, init: FetchInit): Promise<ApiClientResult<R>> {
    const fetchRes = await tryHandle(fetch(url, init as RequestInit));

    if (!fetchRes.success) {
      const msg = fetchRes.error instanceof Error ? fetchRes.error.message : String(fetchRes.error);
      return {
        success: false,
        error: {
          error_type: "server_error",
          status: 500,
          message: `Network error while fetching ${url}: ${msg}`
        }
      };
    }

    const res = fetchRes.data;
    const contentType = getContentType(res.headers);
    const contentLength = res.headers.get("Content-Length");

    if (!res.ok && contentType === "json") {
      const jsonErr = await tryHandle(res.json());
      if (jsonErr.success) {
        const parsed = ErrorResponseSchema.safeParse(jsonErr.data);
        if (parsed.success) return { success: false, error: parsed.data };
        // Body is already consumed — use what we parsed rather than calling res.text()
        const msg = typeof jsonErr.data === "string" ? jsonErr.data : JSON.stringify(jsonErr.data);
        return {
          success: false,
          error: { error_type: "unknown", status: res.status, message: msg }
        };
      }
      // res.json() itself failed (content-type lied); body may still be readable — fall through
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      return {
        success: false,
        error: { error_type: "unknown", status: res.status, message: text }
      };
    }

    if (contentLength === "0" || res.status === 204) {
      return { success: true, data: undefined as R };
    }

    switch (contentType) {
      case "blob": {
        const result = await tryHandle<Blob>(res.blob());
        if (!result.success)
          return {
            success: false,
            error: {
              error_type: "server_error",
              status: 500,
              message: `Failed to read blob response from ${url}`
            }
          };
        return { success: true, data: result.data as R };
      }
      case "text": {
        const result = await tryHandle<string>(res.text());
        if (!result.success)
          return {
            success: false,
            error: {
              error_type: "server_error",
              status: 500,
              message: `Failed to read text response from ${url}`
            }
          };
        return { success: true, data: result.data as R };
      }
      case "json": {
        const result = await tryHandle<unknown>(res.json());
        if (!result.success)
          return {
            success: false,
            error: {
              error_type: "server_error",
              status: 500,
              message: `Failed to parse JSON response from ${url}`
            }
          };
        return { success: true, data: result.data as R };
      }
      case "unknown":
        return {
          success: false,
          error: {
            error_type: "server_error",
            status: 500,
            message: `Unrecognized content type "${res.headers.get("Content-Type")}" from ${url}`
          }
        };
    }
  }

  protected async get<T = unknown, Q extends ZodType = ZodType>({
    path,
    query,
    request,
    retries = 0,
    timeout
  }: {
    path: string;
    query?: [schema: Q, data: z.infer<Q> | undefined];
    request?: Request;
    /** Number of times to retry on transient failures (server_error, service_unavailable). Default: 0. */
    retries?: number;
    /** Request timeout in ms. Overrides the constructor default for this call. */
    timeout?: number;
  }): Promise<ApiClientResult<T>> {
    const queryString = this.#makeQueryString(query);
    const endpoint = this.#makeEndpoint({ path, queryString });
    const headers = this.#prepareHeaders(request);
    const signal = this.#makeSignal(request, timeout);
    const additionalOptions = this.#getRequestInitOptions(request);

    return this.#withRetry(
      () => this.#fetch<T>(endpoint, { headers, signal, ...additionalOptions }),
      retries
    );
  }

  protected async mutate<R = unknown, B extends ZodType = ZodType, Q extends ZodType = ZodType>({
    path,
    method,
    body,
    query,
    request,
    retries = 0,
    timeout
  }: {
    path: string;
    method: "POST" | "PUT" | "PATCH" | "DELETE";
    body?: [schema: B, data: z.infer<B>] | FormData;
    query?: [schema: Q, data: z.infer<Q> | undefined];
    request?: Request;
    /** Number of times to retry on transient failures (server_error, service_unavailable). Default: 0. */
    retries?: number;
    /** Request timeout in ms. Overrides the constructor default for this call. */
    timeout?: number;
  }): Promise<ApiClientResult<R>> {
    const queryString = this.#makeQueryString(query);
    const endpoint = this.#makeEndpoint({ path, queryString });
    const requestBody = this.#makeBody(body);
    const headers = this.#prepareHeaders(request);
    const signal = this.#makeSignal(request, timeout);
    const additionalOptions = this.#getRequestInitOptions(request);

    // Set Content-Type for JSON bodies only; let the browser set it for FormData (boundary required)
    if (requestBody !== undefined && typeof requestBody === "string") {
      headers.set("Content-Type", "application/json");
    }

    return this.#withRetry(
      () =>
        this.#fetch<R>(endpoint, {
          method,
          headers,
          body: requestBody,
          signal,
          ...additionalOptions
        }),
      retries
    );
  }
}
