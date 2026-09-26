import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const hardening = read("lib/security/http-hardening.ts");
for (const marker of [
  "Content-Type must be application/json",
  "request.body.getReader()",
  "request_too_large",
  "TextDecoder",
  "assertAllowedBrowserOrigin",
  "getPublicAppOrigin",
]) {
  if (!hardening.includes(marker)) throw new Error("HTTP hardening marker missing: " + marker);
}
if (hardening.includes("request.json()")) {
  throw new Error("Bounded JSON helper must not delegate to unbounded request.json()");
}

const limiter = read("lib/security/rate-limit.ts");
for (const marker of [
  'createHmac("sha256"',
  "getTrustedClientIpHeaderName",
  'INSERT INTO "api_rate_limit_buckets"',
  'ON CONFLICT ("bucket_key") DO UPDATE',
  '"request_count" = "api_rate_limit_buckets"."request_count" + 1',
  "rate_limit_store_unavailable",
  "retryAfterSeconds",
]) {
  if (!limiter.includes(marker)) throw new Error("Rate-limit marker missing: " + marker);
}
for (const forbidden of ['"client_ip"', '"ip_address"', "remoteAddress"]) {
  if (limiter.includes(forbidden)) {
    throw new Error("Rate-limit persistence must not store raw network identifiers: " + forbidden);
  }
}

const nextConfig = read("next.config.ts");
for (const marker of [
  "X-Content-Type-Options",
  "Referrer-Policy",
  "X-Frame-Options",
  "Permissions-Policy",
  "Content-Security-Policy",
  "frame-ancestors 'none'",
]) {
  if (!nextConfig.includes(marker)) throw new Error("Security header missing: " + marker);
}

const bodyRoutes = [
  "app/api/demo-handoff/route.ts",
  "app/api/handoff/preview/route.ts",
  "app/api/handoff/route.ts",
  "app/api/handoff/manage/withdraw/route.ts",
  "app/api/provider/requests/route.ts",
];
for (const path of bodyRoutes) {
  const source = read(path);
  if (!source.includes("readJsonBodyLimited")) {
    throw new Error(path + " must use bounded JSON parsing");
  }
  if (source.includes("request.json()")) {
    throw new Error(path + " still contains unbounded request.json()");
  }
}

for (const path of [
  "app/api/demo-handoff/route.ts",
  "app/api/handoff/preview/route.ts",
  "app/api/handoff/route.ts",
  "app/api/handoff/manage/withdraw/route.ts",
  "app/api/provider/requests/route.ts",
  "app/api/directory/route.ts",
]) {
  if (!read(path).includes("consumeRateLimit")) {
    throw new Error(path + " is missing abuse-rate enforcement");
  }
}

const provider = read("app/api/provider/requests/route.ts");
if (!provider.includes("requireForCookieAuth: true")) {
  throw new Error("Provider browser mutation must require same-origin evidence for cookie auth");
}
if (!provider.includes('"provider-user:" + actor.userId')) {
  throw new Error("Provider rate limiting must bind to authenticated provider identity");
}

const config = read("lib/config/server.ts");
for (const marker of [
  "TALKPOINT_PUBLIC_APP_ORIGIN",
  "TALKPOINT_TRUSTED_CLIENT_IP_HEADER",
  "TALKPOINT_RATE_LIMIT_HASH_SECRET",
]) {
  if (!config.includes(marker)) throw new Error("Production security configuration missing: " + marker);
}

const migration = read("migrations/20260926_220000_api_abuse_hardening.ts");
for (const marker of [
  'CREATE TABLE "api_rate_limit_buckets"',
  '"bucket_key" varchar NOT NULL',
  '"expires_at" timestamp',
]) {
  if (!migration.includes(marker)) throw new Error("Rate-limit migration marker missing: " + marker);
}
if (!read("migrations/index.ts").includes("20260926_220000_api_abuse_hardening")) {
  throw new Error("API abuse-hardening migration must be registered");
}
if (!read("payload.config.ts").includes("apiRateLimitBuckets")) {
  throw new Error("Payload schema must preserve the custom rate-limit table");
}

console.log("Production API and abuse hardening checks passed.");
