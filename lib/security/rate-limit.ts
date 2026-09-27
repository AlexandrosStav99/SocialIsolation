import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { sql } from "@payloadcms/db-postgres/drizzle";
import type { Payload } from "payload";
import {
  getRateLimitHashSecret,
  getRuntimeMode,
  getTrustedClientIpHeaderName,
} from "../config/server.ts";

export type RateLimitPolicy = {
  scope: string;
  limit: number;
  windowSeconds: number;
};

export const rateLimitPolicies = {
  directoryRead: { scope: "directory_read", limit: 240, windowSeconds: 60 },
  productionPreview: { scope: "production_handoff_preview", limit: 30, windowSeconds: 60 },
  productionHandoff: { scope: "production_handoff_submit", limit: 12, windowSeconds: 60 },
  productionWithdrawal: { scope: "production_withdrawal", limit: 12, windowSeconds: 60 },
  productionRequestAccess: { scope: "production_request_access", limit: 12, windowSeconds: 60 },
  providerRead: { scope: "provider_workspace_read", limit: 240, windowSeconds: 60 },
  providerMutation: { scope: "provider_workspace_mutation", limit: 120, windowSeconds: 60 },
} as const satisfies Record<string, RateLimitPolicy>;

export class RateLimitError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

function normalizeClientIp(raw: string | null, headerName: string): string | null {
  if (!raw) return null;
  const candidate =
    headerName === "x-forwarded-for" ? raw.split(",", 1)[0].trim() : raw.trim();
  return isIP(candidate) ? candidate : null;
}

export function publicRateLimitSubject(request: Request): string {
  const headerName = getTrustedClientIpHeaderName();
  const clientIp = normalizeClientIp(request.headers.get(headerName), headerName);
  if (clientIp) return "client-ip:" + clientIp;

  if (getRuntimeMode() === "production") {
    throw new RateLimitError(
      503,
      "trusted_client_ip_unavailable",
      "Trusted client network identity is unavailable",
    );
  }
  return "nonproduction-unattributed-client";
}

function bucketKey(
  secret: string,
  policy: RateLimitPolicy,
  subject: string,
  windowStartedAtMs: number,
): string {
  return createHmac("sha256", secret)
    .update(
      [
        "talkpoint-rate-limit-v1",
        policy.scope,
        String(windowStartedAtMs),
        subject,
      ].join(":"),
      "utf8",
    )
    .digest("hex");
}

type DrizzleExecuteResult = {
  rows?: Array<Record<string, unknown>>;
};

function returnedCount(result: unknown): number {
  const rows = (result as DrizzleExecuteResult)?.rows;
  const value = rows?.[0]?.request_count;
  const count = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(count) || count <= 0) {
    throw new RateLimitError(
      503,
      "rate_limit_store_unavailable",
      "Rate-limit persistence returned an invalid counter",
    );
  }
  return count;
}

export async function consumeRateLimit(
  payload: Payload,
  policy: RateLimitPolicy,
  subject: string,
  now = new Date(),
): Promise<{ limit: number; remaining: number; retryAfterSeconds: number }> {
  if (
    !policy.scope ||
    !Number.isSafeInteger(policy.limit) ||
    policy.limit <= 0 ||
    !Number.isSafeInteger(policy.windowSeconds) ||
    policy.windowSeconds <= 0 ||
    !subject
  ) {
    throw new Error("Invalid rate-limit policy");
  }

  const windowMs = policy.windowSeconds * 1000;
  const windowStartedAtMs = Math.floor(now.getTime() / windowMs) * windowMs;
  const windowStartedAt = new Date(windowStartedAtMs);
  const windowEndsAt = new Date(windowStartedAtMs + windowMs);
  const expiresAt = new Date(windowStartedAtMs + windowMs * 2);
  const key = bucketKey(
    getRateLimitHashSecret(),
    policy,
    subject,
    windowStartedAtMs,
  );

  let result: unknown;
  try {
    result = await payload.db.drizzle.execute(sql`
      INSERT INTO "api_rate_limit_buckets"
        ("bucket_key", "scope", "request_count", "window_started_at", "expires_at", "updated_at", "created_at")
      VALUES
        (${key}, ${policy.scope}, 1, ${windowStartedAt.toISOString()}, ${expiresAt.toISOString()}, now(), now())
      ON CONFLICT ("bucket_key") DO UPDATE
        SET "request_count" = "api_rate_limit_buckets"."request_count" + 1,
            "updated_at" = now()
      RETURNING "request_count";
    `);
  } catch {
    throw new RateLimitError(
      503,
      "rate_limit_store_unavailable",
      "Rate-limit persistence is unavailable",
    );
  }

  const count = returnedCount(result);
  if (count === 1) {
    try {
      await payload.db.drizzle.execute(sql`
        DELETE FROM "api_rate_limit_buckets"
        WHERE "expires_at" <= ${now.toISOString()}
          AND "bucket_key" <> ${key};
      `);
    } catch {
      // Cleanup is best-effort; enforcement already used the shared persistent counter.
    }
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowEndsAt.getTime() - now.getTime()) / 1000),
  );
  if (count > policy.limit) {
    throw new RateLimitError(
      429,
      "rate_limited",
      "Too many requests",
      retryAfterSeconds,
    );
  }

  return {
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - count),
    retryAfterSeconds,
  };
}
