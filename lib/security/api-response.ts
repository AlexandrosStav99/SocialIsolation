import { NextResponse } from "next/server";
import { HttpRequestError, noStoreHeaders } from "./http-hardening.ts";
import { RateLimitError } from "./rate-limit.ts";
import { operationalLog } from "../operations/operational-logger.ts";

export function securityErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof HttpRequestError) {
    if (error.status >= 500) {
      operationalLog("error", "api_boundary_failure", {
        component: "http_boundary",
        status: "failed",
        errorCode: error.code,
        httpStatus: error.status,
      });
    }
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers: noStoreHeaders },
    );
  }
  if (error instanceof RateLimitError) {
    if (error.status === 429 || error.status >= 500) {
      operationalLog(error.status >= 500 ? "error" : "warn", "api_rate_limit_event", {
        component: "rate_limit",
        status: error.status === 429 ? "limited" : "failed",
        errorCode: error.code,
        httpStatus: error.status,
      });
    }
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
