import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const providers = read("payload/collections/Providers.ts");
for (const marker of [
  "productionDirectoryVerified",
  "productionDirectorySuppressed",
  "productionDirectorySourceType",
  "productionDirectoryNextReviewAt",
  "isSuperAdminUser",
]) {
  if (!providers.includes(marker)) throw new Error("Provider onboarding gate missing: " + marker);
}

const services = read("payload/collections/Services.ts");
for (const marker of [
  "productionDirectoryVerified",
  "productionDirectorySuppressed",
  "productionDirectorySourceType",
  "productionDirectoryNextReviewAt",
  "productionDirectoryEnabled",
  "isSuperAdminUser",
]) {
  if (!services.includes(marker)) throw new Error("Service onboarding gate missing: " + marker);
}

const metadata = read("lib/directory/production-metadata.ts");
for (const marker of [
  "productionDirectoryVerified !== true",
  "productionDirectorySuppressed !== false",
  "SYNTHETIC_DIRECTORY_SOURCE",
  "nextReviewAt.getTime() <= now.getTime()",
  "nextReviewAt.getTime() <= checkedAt.getTime()",
  "productionDirectoryEnabled === true",
]) {
  if (!metadata.includes(marker)) throw new Error("Production directory metadata rule missing: " + marker);
}

const loader = read("lib/directory/production-directory.ts");
for (const marker of [
  "isProductionProviderDirectoryEligible",
  "isProductionServiceDirectoryEligible",
  "eligibleProviderIds",
  "providerIdsWithServices",
]) {
  if (!loader.includes(marker)) throw new Error("Production directory loader rule missing: " + marker);
}

const route = read("app/api/directory/route.ts");
for (const marker of [
  "loadProductionDirectory",
  'source: "payload_postgres_production"',
  'error: "directory_unavailable"',
]) {
  if (!route.includes(marker)) throw new Error("Production directory route marker missing: " + marker);
}
if (route.includes('runtimeMode === "production" ? null : await loadPayloadDemoDirectory()')) {
  throw new Error("Legacy production-null directory branch should be replaced by verified production loader");
}

const handoff = read("lib/handoff/production-persistence.ts");
for (const marker of [
  "isProductionServiceDirectoryEligible",
  "isProductionProviderDirectoryEligible",
  "service_directory_unavailable",
  "provider_directory_unavailable",
]) {
  if (!handoff.includes(marker)) throw new Error("Production handoff directory gate missing: " + marker);
}

const migration = read("migrations/20260927_132000_production_directory_onboarding.ts");
for (const marker of [
  "production_directory_verified",
  "production_directory_suppressed",
  "production_directory_source_type",
  "production_directory_next_review_at",
  "production_directory_enabled",
]) {
  if (!migration.includes(marker)) throw new Error("Production directory migration marker missing: " + marker);
}

const seed = read("scripts/seed-demo-directory.ts");
for (const forbidden of [
  "productionDirectoryVerified: true",
  "productionDirectoryEnabled: true",
]) {
  if (seed.includes(forbidden)) {
    throw new Error("Synthetic demo seed must not self-publish into production: " + forbidden);
  }
}

const runbook = read("docs/PRODUCTION-DIRECTORY-ONBOARDING.md");
for (const marker of [
  "does not imply a partnership",
  "Directory-only",
  "next recheck",
  "fails closed",
  "productionHandoffEnabled",
  "No real provider records",
]) {
  if (!runbook.includes(marker)) throw new Error("Production directory runbook marker missing: " + marker);
}

console.log("Production directory onboarding checks passed.");
