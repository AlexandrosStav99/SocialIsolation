import { NextResponse } from "next/server";
import { HttpRequestError, noStoreHeaders } from "./http-hardening.ts";
import { RateLimitError } from "./rate-limit.ts";

export function securityErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof HttpRequestError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers: noStoreHeaders },
    );
  }
  if (error instanceof RateLimitError) {
    const headers: Record<string, string> = { ...noStoreHeaders };
    if (error.retryAfterSeconds !== undefined) {
      headers["Retry-After"] = String(error.retryAfterSeconds);
    }
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers },
    );
  }
  return null;
}
