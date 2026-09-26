import { getPublicAppOrigin, getRuntimeMode } from "../config/server.ts";

export class HttpRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpRequestError";
  }
}

export const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function contentLength(request: Request): number | null {
  const raw = request.headers.get("content-length");
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) {
    throw new HttpRequestError(400, "invalid_content_length", "Content-Length is invalid");
  }
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new HttpRequestError(400, "invalid_content_length", "Content-Length is invalid");
  }
  return parsed;
}

function assertJsonContentType(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new HttpRequestError(
      415,
      "unsupported_media_type",
      "Content-Type must be application/json",
    );
  }
}

export async function readJsonBodyLimited(
  request: Request,
  maxBytes: number,
): Promise<unknown> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new Error("maxBytes must be a positive safe integer");
  }
  assertJsonContentType(request);

  const declaredLength = contentLength(request);
  if (declaredLength !== null && declaredLength > maxBytes) {
    throw new HttpRequestError(413, "request_too_large", "Request body is too large");
  }

  if (!request.body) {
    throw new HttpRequestError(400, "invalid_json", "Request body must be valid JSON");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // The size boundary has already failed closed.
        }
        throw new HttpRequestError(413, "request_too_large", "Request body is too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    throw new HttpRequestError(400, "invalid_json", "Request body must be valid UTF-8 JSON");
  }
  if (!text.trim()) {
    throw new HttpRequestError(400, "invalid_json", "Request body must be valid JSON");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpRequestError(400, "invalid_json", "Request body must be valid JSON");
  }
}

function expectedOrigin(request: Request): string {
  if (getRuntimeMode() === "production") return getPublicAppOrigin();
  return new URL(request.url).origin;
}

export function assertAllowedBrowserOrigin(
  request: Request,
  options: { requireForCookieAuth?: boolean } = {},
): void {
  const origin = request.headers.get("origin");
  const hasCookie = Boolean(request.headers.get("cookie"));

  if (!origin) {
    if (options.requireForCookieAuth && hasCookie) {
      throw new HttpRequestError(
        403,
        "origin_required",
        "A same-origin browser request is required",
      );
    }
    return;
  }

  let normalized: string;
  try {
    normalized = new URL(origin).origin;
  } catch {
    throw new HttpRequestError(403, "origin_not_allowed", "Request origin is not allowed");
  }

  if (normalized !== expectedOrigin(request)) {
    throw new HttpRequestError(403, "origin_not_allowed", "Request origin is not allowed");
  }
}
