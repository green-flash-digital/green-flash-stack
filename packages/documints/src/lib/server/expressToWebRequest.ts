import type { Request as ExpressRequest } from "express";

export function expressToWebRequest(expressReq: ExpressRequest): Request {
  const method = expressReq.method;
  const headers = new Headers(expressReq.headers as Record<string, string>);
  const url = `${expressReq.protocol}://${expressReq.get("host")}${
    expressReq.originalUrl
  }`;

  // If the method has a body, include it in the Request
  const body =
    method === "GET" || method === "HEAD"
      ? undefined
      : expressReq.body
      ? JSON.stringify(expressReq.body)
      : undefined;

  return new Request(url, {
    method,
    headers,
    body,
  });
}
