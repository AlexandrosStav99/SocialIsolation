import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const matrix = read("lib/safety/validated-matrix.ts");
for (const marker of [
  "requires_domain_expert_validation",
  '"approved"',
  "structuralSafetyTriggers",
]) {
  if (!matrix.includes(marker)) throw new Error("Safety matrix marker missing: " + marker);
}

const router = read("lib/safety/router.ts");
for (const marker of [
  "user_requests_help_now",
  "immediate_danger_selected",
  "recent_violence_selected",
  "automaticThirdPartyNotification:false",
]) {
  if (!router.includes(marker)) throw new Error("Version-controlled safety routing marker missing: " + marker);
}
for (const forbidden of ["payload", "collection:", "process.env"]) {
  if (router.includes(forbidden)) {
    throw new Error("Safety routing rules must not become CMS/environment editable: " + forbidden);
  }
}

const configuration = read("lib/safety/production-config.ts");
for (const marker of [
  "matrixStatus: SAFETY_MATRIX_VALIDATION_STATUS",
  'version: "unapproved"',
  "approvalReference: null",
  "presentation: null",
  "validateProductionSafetyConfiguration",
  "requires at least one approved resource",
  "immediateSupportApproved",
  "getApprovedProductionSafetyPresentation",
  "isProductionSafetyEnabled",
]) {
  if (!configuration.includes(marker)) {
    throw new Error("Production safety configuration marker missing: " + marker);
  }
}
if (/productionSafetyConfiguration[\s\S]*https?:\/\//.test(configuration.split("function requiredString")[0])) {
  throw new Error("Default production safety configuration must not contain real or placeholder resources");
}

const page = read("app/(frontend)/check-in/page.jsx");
for (const marker of [
  "getRuntimeMode",
  "tryGetApprovedProductionSafetyPresentation",
  'runtimeMode === "production"',
  "TalkPoint check-in is temporarily unavailable",
  "demoSafetyPresentation",
]) {
  if (!page.includes(marker)) throw new Error("Check-in safety gate marker missing: " + marker);
}

const client = read("components/check-in/IntegratedCheckIn.tsx");
for (const marker of [
  "safetyPresentation: SafetyPresentation",
  "safetyPresentation.resources",
  "resource.informationSource",
  'resource.contact.type === "phone"',
]) {
  if (!client.includes(marker)) throw new Error("Safety presentation rendering marker missing: " + marker);
}
if (client.includes('import { safetyContent }')) {
  throw new Error("Client check-in must receive its safety presentation from the server boundary");
}

const payloadConfig = read("payload.config.ts");
if (/safety[^\n]*(collection|global)/i.test(payloadConfig)) {
  throw new Error("Payload must not become a CMS-editable safety rules engine");
}

const preflight = read("scripts/production-preflight.ts");
if (!preflight.includes("getApprovedProductionSafetyPresentation")) {
  throw new Error("Production preflight must fail closed without approved safety configuration");
}

const env = read(".env.example");
if (!env.includes("TALKPOINT_PRODUCTION_SAFETY_ENABLED=false")) {
  throw new Error("Production safety operational gate must default disabled");
}

const checklist = read("docs/SAFETY-CONTENT-VALIDATION-CHECKLIST.md");
for (const marker of [
  "Not production validated",
  "qualified safeguarding / domain expert",
  "requires_domain_expert_validation",
]) {
  if (!checklist.includes(marker)) throw new Error("Safety external validation boundary missing: " + marker);
}

const runbook = read("docs/PRODUCTION-SAFETY-GATE.md");
for (const marker of [
  "two independent gates",
  "does not self-approve",
  "No real Cyprus immediate-support resource",
  "version-controlled",
  "fails closed",
]) {
  if (!runbook.includes(marker)) throw new Error("Production safety runbook marker missing: " + marker);
}

console.log("Production safety gate checks passed.");
