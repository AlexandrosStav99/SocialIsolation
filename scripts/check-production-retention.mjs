import fs from "node:fs";

const route = fs.readFileSync("app/api/handoff/manage/withdraw/route.ts", "utf8");
const executor = fs.readFileSync("lib/privacy/retention-executor.ts", "utf8");
const policy = fs.readFileSync("lib/privacy/retention-policy.ts", "utf8");
const runner = fs.readFileSync("scripts/run-retention.ts", "utf8");
const consents = fs.readFileSync("payload/collections/ConsentRecords.ts", "utf8");
const requests = fs.readFileSync("payload/collections/ContactRequests.ts", "utf8");
const audit = fs.readFileSync("payload/collections/ProviderAuditEvents.ts", "utf8");
const migration = fs.readFileSync("migrations/20260926_203000_retention_deletion.ts", "utf8");

for (const required of [
  'getRuntimeMode() !== "production"',
  "withdrawProductionRequest",
  "request_not_found_or_credential_invalid",
  "allowedFields",
  '"requestId"',
  '"managementId"',
]) {
  if (!route.includes(required)) throw new Error("Withdrawal route missing: " + required);
}

for (const forbidden of [
  '"providerOrganisationId"',
  '"contactDetail"',
  '"consentVersion"',
  '"sessionId"',
]) {
  if (route.includes(forbidden)) throw new Error("Withdrawal route accepts/exposes forbidden field: " + forbidden);
}

for (const required of [
  "timingSafeEqual",
  "publicRequestId",
  "managementTokenHash",
  "deleteRequestPreservingConsentEvidence",
  '"user_withdrawal"',
  '"retention"',
  "requestDeletedAt",
  "withdrawnAt",
  "beginTransaction",
  "commitTransaction",
  "rollbackTransaction",
  '"closed"',
  "closedAt",
  '"ephemeral-sessions"',
  '"anonymous-analytics-events"',
  '"provider-audit-events"',
]) {
  if (!executor.includes(required)) throw new Error("Retention/deletion invariant missing: " + required);
}

for (const forbidden of [
  "temporaryFreeText:",
  "candidateSignals:",
  "safetyRoutingState:",
  "contactDetail:",
]) {
  if (executor.includes(forbidden)) throw new Error("Retention executor must not copy sensitive content: " + forbidden);
}

for (const name of [
  "TALKPOINT_RETENTION_CONTACT_REQUEST_DAYS",
  "TALKPOINT_RETENTION_CONSENT_RECORD_DAYS",
  "TALKPOINT_RETENTION_PROVIDER_AUDIT_DAYS",
  "TALKPOINT_RETENTION_ANONYMOUS_ANALYTICS_DAYS",
]) {
  if (!policy.includes(name)) throw new Error("Retention policy variable missing: " + name);
}
if (/\?\?\s*["']\d+["']/.test(policy) || /parseDays\([^)]*,[^)]*,/.test(policy)) {
  throw new Error("Retention policy must not embed default legal retention durations");
}
if (!runner.includes("TALKPOINT_RETENTION_AUTOMATION_ENABLED") || !runner.includes("explicitly true")) {
  throw new Error("Retention runner must require an explicit enable flag");
}

if (consents.includes('name:"request",type:"relationship",relationTo:"contact-requests",required:true')) {
  throw new Error("Consent evidence must remain valid after request deletion");
}
for (const required of ['name:"requestDeletedAt"', 'name:"deletionReason"', "user_withdrawal", "retention"]) {
  if (!consents.includes(required)) throw new Error("Consent deletion lifecycle field missing: " + required);
}
if (!requests.includes('name:"closedAt", type:"date", index:true')) {
  throw new Error("Closed request retention field must be indexed");
}
if (!audit.includes('name:"occurredAt",type:"date",required:true,index:true')) {
  throw new Error("Audit retention field must be indexed");
}
for (const required of [
  '"public_request_id"',
  '"contact_requests_public_request_id_idx"',
  'ALTER COLUMN "request_id" DROP NOT NULL',
  '"request_deleted_at"',
  '"deletion_reason"',
  '"contact_requests_closed_at_idx"',
  '"provider_audit_events_occurred_at_idx"',
]) {
  if (!migration.includes(required)) throw new Error("Retention migration missing: " + required);
}

console.log("Production retention and deletion boundary checks passed.");
