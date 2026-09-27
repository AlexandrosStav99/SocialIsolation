import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const env = read(".env.example");
for (const name of [
  "TALKPOINT_RUNTIME_MODE",
  "TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK",
  "DATABASE_URL",
  "PAYLOAD_SECRET",
  "TALKPOINT_PRODUCTION_CONSENT_VERSION",
  "TALKPOINT_HANDOFF_CREDENTIAL_SECRET",
  "TALKPOINT_PUBLIC_APP_ORIGIN",
  "TALKPOINT_TRUSTED_CLIENT_IP_HEADER",
  "TALKPOINT_RATE_LIMIT_HASH_SECRET",
  "TALKPOINT_RETENTION_CONTACT_REQUEST_DAYS",
  "TALKPOINT_RETENTION_CONSENT_RECORD_DAYS",
  "TALKPOINT_RETENTION_PROVIDER_AUDIT_DAYS",
  "TALKPOINT_RETENTION_ANONYMOUS_ANALYTICS_DAYS",
  "TALKPOINT_RETENTION_AUTOMATION_ENABLED",
]) {
  if (!env.includes(name + "=")) {
    throw new Error("Deployment environment inventory missing: " + name);
  }
}

const preflight = read("scripts/production-preflight.ts");
for (const marker of [
  'getRuntimeMode() !== "production"',
  "validateRuntimeConfiguration",
  "checkApplicationReadiness",
  "deployment_preflight_ready",
  "deployment_preflight_failed",
]) {
  if (!preflight.includes(marker)) throw new Error("Deployment preflight marker missing: " + marker);
}
if (preflight.includes("error.message") || preflight.includes("DATABASE_URL")) {
  throw new Error("Production preflight must not log sensitive failure details");
}

const verify = read("scripts/verify-production-deployment.mjs");
for (const marker of [
  'parsed.protocol !== "https:"',
  'redirect: "error"',
  "AbortSignal.timeout",
  '"/api/health/live"',
  '"/api/health/ready"',
  '"no-store"',
  '"x-content-type-options"',
  'deploymentVerification: "passed"',
]) {
  if (!verify.includes(marker)) throw new Error("Post-deploy verifier marker missing: " + marker);
}
for (const forbidden of ["Authorization", "Cookie", "DATABASE_URL", "PAYLOAD_SECRET"]) {
  if (verify.includes(forbidden)) {
    throw new Error("Post-deploy verifier must not use sensitive credentials: " + forbidden);
  }
}

const runbook = read("docs/PRODUCTION-DEPLOYMENT-RUNBOOK.md");
for (const marker of [
  "Environment separation",
  "Migration-before-start",
  "Post-deploy verification",
  "Rollback",
  "Do not automatically run down migrations",
  "HSTS",
  "production deployment has succeeded",
]) {
  if (!runbook.includes(marker)) throw new Error("Deployment runbook marker missing: " + marker);
}

const migration = read("docs/DATABASE-MIGRATION-OWNERSHIP.md");
for (const marker of [
  "migration-before-start",
  "backward-compatible",
  "down migrations",
]) {
  if (!migration.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error("Migration deployment boundary missing: " + marker);
  }
}

console.log("Production deployment-readiness checks passed.");
