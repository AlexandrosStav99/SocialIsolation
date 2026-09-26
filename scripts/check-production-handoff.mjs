import fs from "node:fs";

const route = fs.readFileSync("app/api/handoff/route.ts", "utf8");
const previewRoute = fs.readFileSync("app/api/handoff/preview/route.ts", "utf8");
const persistence = fs.readFileSync("lib/handoff/production-persistence.ts", "utf8");
const services = fs.readFileSync("payload/collections/Services.ts", "utf8");
const requests = fs.readFileSync("payload/collections/ContactRequests.ts", "utf8");
const migration = fs.readFileSync("migrations/20260926_190000_production_handoff.ts", "utf8");
const config = fs.readFileSync("lib/config/server.ts", "utf8");
const demoRoute = fs.readFileSync("app/api/demo-handoff/route.ts", "utf8");

for (const required of [
  'getRuntimeMode() !== "production"',
  'request.headers.get("Idempotency-Key")',
  "assertExactInputShape",
  "persistProductionHandoff",
  '"previewToken"',
]) {
  if (!route.includes(required)) throw new Error("Production handoff route missing: " + required);
}

for (const forbidden of [
  '"providerOrganisationId"',
  '"structuredSupportSummary"',
  '"sessionId"',
  '"candidateSignals"',
  '"safetyRoutingState"',
  '"aiReasoning"',
  '"consentVersion"',
]) {
  if (route.includes(forbidden)) {
    throw new Error("Production handoff route must not accept client-controlled/internal field " + forbidden);
  }
}

for (const required of [
  "productionHandoffEnabled",
  "createProductionHandoffPreview",
  "previewTokenFor",
  "timingSafeEqual",
  "preview_token_invalid_or_stale",
  "SYNTHETIC_DIRECTORY_SOURCE",
  "beginTransaction",
  "commitTransaction",
  "rollbackTransaction",
  'collection: "contact-requests"',
  'collection: "consent-records"',
  "idempotencyKeyHash",
  "idempotencyPayloadHash",
  'createHmac("sha256"',
  "serviceMatchesSupportContext",
  "createStructuredSupportSummary",
  "unsupported_preferences",
  "management_credential_key_mismatch",
]) {
  if (!persistence.includes(required)) throw new Error("Production handoff invariant missing: " + required);
}

for (const forbidden of [
  "temporaryFreeText",
  "candidateSignals",
  "safetyRoutingState",
  "anonymous-analytics",
  "ephemeral-sessions",
  "openai",
]) {
  if (persistence.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error("Production handoff must not join anonymous/AI state: " + forbidden);
  }
}

for (const required of [
  'getRuntimeMode() !== "production"',
  "createProductionHandoffPreview",
  "assertExactInputShape",
]) {
  if (!previewRoute.includes(required)) throw new Error("Production Sharing Preview route missing: " + required);
}
for (const forbidden of ['"providerOrganisationId"', '"structuredSupportSummary"', '"consentAccepted"', '"previewToken"', '"consentVersion"']) {
  if (previewRoute.includes(forbidden)) throw new Error("Sharing Preview route accepts forbidden field " + forbidden);
}

if (!services.includes('name: "productionHandoffEnabled"') || !services.includes("defaultValue: false")) {
  throw new Error("Production handoff service gate must default closed");
}
if (!services.includes("isSuperAdminUser") || !services.includes("access: { create:")) {
  throw new Error("Production handoff activation must be restricted to super admins");
}
if (!config.includes("getProductionConsentVersion") || !config.includes("TALKPOINT_PRODUCTION_CONSENT_VERSION")) {
  throw new Error("Production consent version must be server-configured");
}
for (const required of ['name:"idempotencyKeyHash"', "unique:true", 'name:"idempotencyPayloadHash"']) {
  if (!requests.includes(required)) throw new Error("ContactRequest idempotency schema missing: " + required);
}
for (const required of [
  '"production_handoff_enabled"',
  '"idempotency_key_hash"',
  '"idempotency_payload_hash"',
  "CREATE UNIQUE INDEX",
]) {
  if (!migration.includes(required)) throw new Error("Production handoff migration missing: " + required);
}

if (demoRoute.includes("/api/handoff") || demoRoute.includes("persistProductionHandoff")) {
  throw new Error("Controlled demo handoff must remain separate from production persistence");
}

console.log("Production handoff boundary checks passed.");
