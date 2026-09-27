import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const live = read("app/api/health/live/route.ts");
for (const marker of ['{ status: "ok" }', "noStoreHeaders", 'dynamic = "force-dynamic"']) {
  if (!live.includes(marker)) throw new Error("Liveness endpoint marker missing: " + marker);
}

const ready = read("app/api/health/ready/route.ts");
for (const marker of [
  "checkApplicationReadiness",
  '{ status: ready ? "ready" : "not_ready" }',
  "status: ready ? 200 : 503",
  '{ status: "not_ready" }',
]) {
  if (!ready.includes(marker)) throw new Error("Readiness endpoint marker missing: " + marker);
}
for (const forbidden of ["DATABASE_URL", "error.message", "stack", "provider"]) {
  if (ready.includes(forbidden)) {
    throw new Error("Readiness endpoint must not expose internals: " + forbidden);
  }
}

const health = read("lib/operations/health.ts");
for (const marker of [
  "validateRuntimeConfiguration",
  'FROM "contact_requests" LIMIT 0',
  'FROM "api_rate_limit_buckets" LIMIT 0',
  "readiness_check_failed",
]) {
  if (!health.includes(marker)) throw new Error("Readiness dependency marker missing: " + marker);
}

const logger = read("lib/operations/operational-logger.ts");
for (const marker of [
  "allowedMetadataKeys",
  "sanitiseOperationalMetadata",
  "JSON.stringify(record)",
]) {
  if (!logger.includes(marker)) throw new Error("Operational logger marker missing: " + marker);
}
for (const forbidden of [
  "contactDetail",
  "preferredName",
  "structuredSupportSummary",
  "freeText",
  "email",
  "phone",
  "requestId",
  "providerId",
]) {
  if (logger.includes(forbidden)) {
    throw new Error("Operational logger must not accept identifiable metadata: " + forbidden);
  }
}

const response = read("lib/security/api-response.ts");
for (const marker of ["api_boundary_failure", "api_rate_limit_event", "operationalLog"]) {
  if (!response.includes(marker)) throw new Error("API observability marker missing: " + marker);
}

const retention = read("scripts/run-retention.ts");
if (!retention.includes("retention_run_complete") || !retention.includes("retention_run_failed")) {
  throw new Error("Retention automation must emit operational lifecycle events");
}
if (retention.includes("error.message")) {
  throw new Error("Retention failure logs must not emit raw exception messages");
}

const runbook = read("docs/PRODUCTION-OPERATIONS-RUNBOOK.md");
for (const marker of [
  "/api/health/live",
  "/api/health/ready",
  "Incident response",
  "Backup and restore expectations",
  "RPO",
  "RTO",
]) {
  if (!runbook.includes(marker)) throw new Error("Operations runbook marker missing: " + marker);
}

console.log("Production observability and operations checks passed.");
