import fs from "node:fs";

const route = fs.readFileSync("app/api/provider/requests/route.ts", "utf8");
const auth = fs.readFileSync("lib/provider/payload-auth.ts", "utf8");
const workspace = fs.readFileSync("lib/provider/payload-workspace.ts", "utf8");
const workflow = fs.readFileSync("lib/provider/workflow.ts", "utf8");
const config = fs.readFileSync("payload.config.ts", "utf8");
const audit = fs.readFileSync("payload/collections/ProviderAuditEvents.ts", "utf8");

for (const required of ["authenticateProviderActor", "getProviderRequestDetail", "assignProviderRequest", "transitionProviderRequest"]) {
  if (!route.includes(required)) throw new Error("Provider workspace route missing " + required);
}
if (route.includes("providerOrganisationId")) {
  throw new Error("Provider workspace API must not accept client-controlled provider organisation IDs");
}
if (!route.includes("Unexpected provider workspace field")) {
  throw new Error("Provider workspace mutations must reject unexpected client fields");
}
for (const required of ["payload.auth({ headers })", 'role !== "provider_manager" && role !== "provider_staff"', "candidate.active !== true"]) {
  if (!auth.includes(required)) throw new Error("Provider authentication boundary missing: " + required);
}
for (const required of [
  "providerOrganisation: { equals:",
  'actor.role === "provider_staff"',
  "assignedProviderUser: { equals:",
  "active: { equals: true }",
  "organisation: { equals:",
  "beginTransaction",
  "commitTransaction",
  "rollbackTransaction",
  '"request_viewed"',
  '"request_assigned"',
  '"status_changed"',
]) {
  if (!workspace.includes(required)) throw new Error("Provider workspace invariant missing: " + required);
}
for (const forbidden of ["ephemeral", "anonymous-analytics", "temporaryFreeText", "aiReasoning", "safetyTrigger"]) {
  if (workspace.includes(forbidden) || route.includes(forbidden)) {
    throw new Error("Provider workspace must not join anonymous/sensitive internal state: " + forbidden);
  }
}
if (!workflow.includes("assertRequestCanBeAssigned") || !workflow.includes("assertRequestStatusTransition")) {
  throw new Error("Persisted provider workflow must reuse the canonical transition rules");
}
for (const collection of ["ContactRequests", "ProviderAuditEvents"]) {
  if (!config.includes("hiddenSystemCollection(" + collection + ")")) {
    throw new Error(collection + " must remain hidden from direct external Payload access");
  }
}
for (const forbidden of ["contactDetail", "preferredName", "structuredSupportSummary", "optionalNote"]) {
  if (audit.includes(forbidden)) throw new Error("Provider audit collection contains sensitive payload field: " + forbidden);
}

console.log("Production provider workspace boundary checks passed.");
