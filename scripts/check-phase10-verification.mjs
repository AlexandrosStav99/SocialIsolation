import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const routing = read("lib/routing/discovery.ts");
const queue = read("lib/provider/queue.ts");
const logger = read("lib/security/redacted-logger.ts");
const withdrawal = read("lib/handoff/withdrawal.ts");
const ai = read("lib/ai/openai-provider.ts");
const evidence = read("docs/PHASE-10-VALIDATION-EVIDENCE.md");
const limits = read("docs/PHASE-10-LIMITATIONS.md");
const readiness = read("docs/FINAL-MVP-READINESS.md");
const matrix = read("docs/VALIDATION-EVIDENCE-MATRIX.md");
const accessibilityProtocol = read("docs/MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md");
const usabilityTemplate = read("docs/USABILITY-SESSION-RECORD-TEMPLATE.md");
const legalChecklist = read("docs/PRIVACY-LEGAL-VALIDATION-CHECKLIST.md");
const providerChecklist = read("docs/PROVIDER-VALIDATION-CHECKLIST.md");
const academicTemplate = read("docs/ACADEMIC-CLOSURE-TEMPLATE.md");

for (const recovery of ["change_area", "change_preferences", "browse_directory"]) {
  if (!routing.includes(recovery)) throw new Error("Missing no-match recovery: " + recovery);
}

if (!queue.includes("providerOrganisationId!==actor.organisationId")) {
  throw new Error("Organisation isolation guard missing");
}

for (const key of ["freeText", "preferredName", "structuredSupportSummary", "email", "phone"]) {
  if (!logger.includes(key)) throw new Error("Logging redaction key missing: " + key);
}

if (!withdrawal.includes("requestDeleted:true") || !withdrawal.includes("withdrawnAt")) {
  throw new Error("Withdrawal/deletion contract missing");
}

if (!ai.includes('content.type==="output_text"') || ai.includes("data.output_text")) {
  throw new Error("Raw Responses API parsing regression");
}

for (const boundary of ["NOT COMPLETE", "adults aged 18–30", "Green CI proves tested implementation properties"]) {
  if (!evidence.includes(boundary)) throw new Error("Human validation gate not explicit: " + boundary);
}

if (!limits.includes("no compliance certification")) {
  throw new Error("Accessibility claim boundary missing");
}

if (!limits.includes("Payload/PostgreSQL runtime integration is implemented and CI-verified")) {
  throw new Error("Current Payload/PostgreSQL runtime evidence missing from limitations");
}

if (limits.includes("Payload CMS runtime integration remains future implementation work")) {
  throw new Error("Stale Payload runtime limitation reintroduced");
}

for (const statement of [
  "controlled implementation technically complete; full frozen Definition of Done not yet satisfied",
  "Payload CMS + PostgreSQL runtime integration",
  "Do **not** call TalkPoint fully MVP-DONE or production-ready",
]) {
  if (!readiness.includes(statement)) throw new Error("MVP readiness boundary missing: " + statement);
}

for (const gate of [
  "Problem validation",
  "End-to-end validation",
  "Routing validation",
  "Safety validation",
  "Privacy/security validation",
  "Target-user validation",
  "Academic evaluation",
]) {
  if (!matrix.includes(gate)) throw new Error("Validation matrix gate missing: " + gate);
}

for (const marker of ["PARTIAL EVIDENCE", "IMPLEMENTED / AUTOMATED EVIDENCE PRESENT", "NOT COMPLETE"]) {
  if (!matrix.includes(marker)) throw new Error("Validation matrix status missing: " + marker);
}

for (const required of [
  [accessibilityProtocol, "Screen-reader desktop journey"],
  [accessibilityProtocol, "Zoom and reflow"],
  [usabilityTemplate, "Research integrity rule"],
  [legalChecklist, "Status: **not legally validated**"],
  [providerChecklist, "not validated for a real-provider pilot"],
  [academicTemplate, "Definition-of-Done decision"],
]) {
  if (!required[0].includes(required[1])) throw new Error("Validation evidence template boundary missing: " + required[1]);
}

console.log("Phase 10 verification checks passed.");
