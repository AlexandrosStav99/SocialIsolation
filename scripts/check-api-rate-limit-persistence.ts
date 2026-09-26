import { randomUUID } from "node:crypto";
import { sql } from "@payloadcms/db-postgres/drizzle";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import {
  consumeRateLimit,
  RateLimitError,
  type RateLimitPolicy,
} from "../lib/security/rate-limit.ts";

type QueryResult = {
  rows?: Array<Record<string, unknown>>;
};

function rows(result: unknown): Array<Record<string, unknown>> {
  const candidate = (result as QueryResult)?.rows;
  if (!Array.isArray(candidate)) throw new Error("Expected PostgreSQL rows");
  return candidate;
}

async function main() {
  const payload = await getPayload({ config });
  const scope = "ci_" + randomUUID().replaceAll("-", "");
  const subject = "client-ip:203.0.113.44";
  const policy: RateLimitPolicy = { scope, limit: 2, windowSeconds: 60 };
  const now = new Date("2026-09-27T00:00:30.000Z");

  await payload.db.drizzle.execute(sql`
    DELETE FROM "api_rate_limit_buckets" WHERE "scope" = ${scope};
  `);

  const first = await consumeRateLimit(payload, policy, subject, now);
  if (first.remaining !== 1) throw new Error("First request should leave one request");

  const second = await consumeRateLimit(payload, policy, subject, now);
  if (second.remaining !== 0) throw new Error("Second request should exhaust the window");

  let limited = false;
  try {
    await consumeRateLimit(payload, policy, subject, now);
  } catch (error) {
    if (
      error instanceof RateLimitError &&
      error.status === 429 &&
      error.code === "rate_limited" &&
      typeof error.retryAfterSeconds === "number" &&
      error.retryAfterSeconds > 0
    ) {
      limited = true;
    } else {
      throw error;
    }
  }
  if (!limited) throw new Error("Third request should be rate limited");

  const persisted = rows(
    await payload.db.drizzle.execute(sql`
      SELECT "bucket_key", "scope", "request_count"
      FROM "api_rate_limit_buckets"
      WHERE "scope" = ${scope}
      ORDER BY "created_at" ASC;
    `),
  );
  if (persisted.length !== 1) throw new Error("Expected one fixed-window bucket");
  if (Number(persisted[0].request_count) !== 3) {
    throw new Error("Shared counter did not persist all attempts");
  }
  const bucketKey = persisted[0].bucket_key;
  if (typeof bucketKey !== "string" || !/^[a-f0-9]{64}$/.test(bucketKey)) {
    throw new Error("Rate-limit bucket key must be an HMAC digest");
  }
  if (JSON.stringify(persisted).includes(subject) || JSON.stringify(persisted).includes("203.0.113.44")) {
    throw new Error("Raw client network identity must not be persisted");
  }

  const nextWindow = new Date(now.getTime() + 60_000);
  const reopened = await consumeRateLimit(payload, policy, subject, nextWindow);
  if (reopened.remaining !== 1) throw new Error("A new fixed window should accept requests");

  const afterWindow = rows(
    await payload.db.drizzle.execute(sql`
      SELECT "bucket_key"
      FROM "api_rate_limit_buckets"
      WHERE "scope" = ${scope};
    `),
  );
  if (afterWindow.length !== 2) throw new Error("Expected independent fixed-window buckets");

  await payload.db.drizzle.execute(sql`
    DELETE FROM "api_rate_limit_buckets" WHERE "scope" = ${scope};
  `);

  console.log("PostgreSQL API rate-limit persistence checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
