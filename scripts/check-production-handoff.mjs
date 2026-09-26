import fs from "node:fs";

const route = fs.readFileSync("app/api/handoff/route.ts", "utf8");
const persistence = fs.readFileSync("lib/handoff/production-persistence.ts", "utf8");
const services = fs.readFileSync("payload/collections/Services.ts", "utf8");
const requests = fs.readFileSync("payload/collections/ContactRequests.ts", "utf8");
const migration = fs.readFileSync("migrations/20260926_190000_production_handoff.ts", "utf8");
const demoRoute = fs.readFileSync("app/api/demo-handoff/route.ts", "utf8");

for (const required of [
  'getRuntimeMode() !== "production"',
  'request.headers.get("Idempotency-Key")',
  "assertExactInputShape",
  "persistProductionHandoff",
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
]) {
  if (route.includes(forbidden)) {
    throw new Error("Production handoff route must not accept client-controlled/internal field " + forbidden);
  }
}

for (const required of [
  "productionHandoffEnabled",
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

if (!services.includes('name: "productionHandoffEnabled"') || !services.includes("defaultValue: false")) {
  throw new Error("Production handoff service gate must default closed");
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
