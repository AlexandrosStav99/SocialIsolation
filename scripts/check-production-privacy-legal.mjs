import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const configuration = read("lib/privacy/production-config.ts");
for (const marker of [
  'reviewStatus: "requires_privacy_legal_review"',
  'version: "unapproved"',
  "approvalReference: null",
  "approvedRetentionPolicy: null",
  "notice: null",
  "getApprovedProductionPrivacyConfiguration",
  "TALKPOINT_PRODUCTION_PRIVACY_ENABLED",
  "Runtime retention values do not match the approved privacy configuration",
  "Production consent version does not match the approved privacy configuration",
]) {
  if (!configuration.includes(marker)) {
    throw new Error("Production privacy configuration marker missing: " + marker);
  }
}

const env = read(".env.example");
if (!env.includes("TALKPOINT_PRODUCTION_PRIVACY_ENABLED=false")) {
  throw new Error("Production privacy/legal operational gate must default disabled");
}

const page = read("app/(frontend)/check-in/page.jsx");
for (const marker of [
  "tryGetApprovedProductionPrivacyConfiguration",
  "production && !privacyConfiguration",
  "privacyNotice={privacyConfiguration?.notice ?? null}",
]) {
  if (!page.includes(marker)) throw new Error("Production check-in privacy gate missing: " + marker);
}

const client = read("components/check-in/IntegratedCheckIn.tsx");
for (const marker of [
  'privacyNotice: ProductionPrivacyConfiguration["notice"]',
  "privacyNotice[language].controllerIdentity",
  "privacyNotice[language].rights",
  "privacyNotice[language].complaintRoute",
]) {
  if (!client.includes(marker)) throw new Error("Approved privacy notice rendering marker missing: " + marker);
}

for (const path of [
  "app/api/handoff/preview/route.ts",
  "app/api/handoff/route.ts",
]) {
  const source = read(path);
  if (!source.includes("getApprovedProductionPrivacyConfiguration")) {
    throw new Error(path + " must require the approved privacy package");
  }
  if (source.includes("getProductionConsentVersion")) {
    throw new Error(path + " must source consent version through the approved privacy package");
  }
}

const preview = read("app/api/handoff/preview/route.ts");
for (const marker of [
  "privacyNoticeVersion",
  "consentStatements",
  "assistedContactConsent",
]) {
  if (!preview.includes(marker)) throw new Error("Sharing Preview privacy evidence missing: " + marker);
}

const accessRoute = read("app/api/handoff/manage/access/route.ts");
for (const marker of [
  "exportProductionRequestData",
  "readJsonBodyLimited",
  "consumeRateLimit",
  "productionRequestAccess",
  "noStoreHeaders",
]) {
  if (!accessRoute.includes(marker)) throw new Error("Request-access API marker missing: " + marker);
}

const retention = read("lib/privacy/retention-executor.ts");
for (const marker of [
  "request-copy-v1",
  "anonymousExplorationLinked: false",
  "anonymousAnalyticsLinked: false",
  "providerInternalAuditIncluded: false",
  "request_not_found_or_credential_invalid",
]) {
  if (!retention.includes(marker)) {
    throw new Error("Self-service request-copy boundary missing: " + marker);
  }
}
const copyStart = retention.indexOf("export async function exportProductionRequestData");
const copyEnd = retention.indexOf("export async function withdrawProductionRequest", copyStart);
if (copyStart < 0 || copyEnd <= copyStart) {
  throw new Error("Self-service request copy implementation boundary not found");
}
const copyImplementation = retention.slice(copyStart, copyEnd);
for (const forbidden of [
  "managementTokenEnvelope:",
  "idempotencyKeyHash:",
  "idempotencyPayloadHash:",
]) {
  if (copyImplementation.includes(forbidden)) {
    throw new Error("Self-service request copy must not return internal credential/idempotency material: " + forbidden);
  }
}

const preflight = read("scripts/production-preflight.ts");
if (!preflight.includes("getApprovedProductionPrivacyConfiguration")) {
  throw new Error("Production preflight must require approved privacy/legal configuration");
}

const inventory = read("docs/PRODUCTION-INTEGRATION-INVENTORY.md");
for (const marker of [
  "technical inventory only",
  "Payload CMS + PostgreSQL",
  "OpenAI Responses API",
  "Mapbox browser assets",
  "Hosting / reverse proxy / CDN / DNS",
  "does not decide controller/processor/sub-processor roles",
]) {
  if (!inventory.includes(marker)) throw new Error("Technical integration inventory marker missing: " + marker);
}

const runbook = read("docs/PRODUCTION-PRIVACY-LEGAL-GATE.md");
for (const marker of [
  "engineering gate implemented; final privacy/legal review is not complete",
  "Two independent gates",
  "cannot self-approve",
  "Self-service request data copy",
  "not a legal determination",
  "not defensible to say",
  "GDPR compliant",
]) {
  if (!runbook.includes(marker)) throw new Error("Privacy/legal runbook marker missing: " + marker);
}

const checklist = read("docs/PRIVACY-LEGAL-VALIDATION-CHECKLIST.md");
if (!checklist.includes("Status: **not legally validated**")) {
  throw new Error("Privacy/legal external validation status must remain open");
}

console.log("Production privacy/legal engineering-gate checks passed.");
