import {
  getApprovedProductionPrivacyConfiguration,
  productionPrivacyConfiguration,
  validateProductionPrivacyConfiguration,
  type ProductionPrivacyConfiguration,
  type ProductionPrivacyNoticeCopy,
} from "../lib/privacy/production-config.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectInvalid(
  configuration: ProductionPrivacyConfiguration,
  now: Date,
  env: NodeJS.ProcessEnv,
  expectedFragment: string,
): void {
  try {
    validateProductionPrivacyConfiguration(configuration, now, env);
  } catch (error) {
    assert(error instanceof Error, "Expected privacy configuration Error");
    assert(
      error.message.includes(expectedFragment),
      'Expected error containing "' + expectedFragment + '", got "' + error.message + '"',
    );
    return;
  }
  throw new Error("Expected invalid production privacy configuration");
}

const now = new Date("2026-09-27T10:00:00.000Z");

delete process.env.TALKPOINT_PRODUCTION_PRIVACY_ENABLED;
try {
  getApprovedProductionPrivacyConfiguration(now);
  throw new Error("Disabled privacy/legal operational gate unexpectedly passed");
} catch (error) {
  assert(error instanceof Error, "Expected disabled privacy-gate Error");
  assert(error.message.includes("gate is disabled"), "Privacy operational gate must default closed");
}

process.env.TALKPOINT_PRODUCTION_PRIVACY_ENABLED = "true";
try {
  getApprovedProductionPrivacyConfiguration(now);
  throw new Error("Unapproved default privacy configuration unexpectedly passed");
} catch (error) {
  assert(error instanceof Error, "Expected unapproved privacy configuration Error");
  assert(
    error.message.includes("review is not approved"),
    "Environment flag must not self-approve privacy/legal review",
  );
}

const copy: ProductionPrivacyNoticeCopy = {
  heading: "CI privacy information",
  summary: "Controlled CI-only approved-text fixture.",
  controllerIdentity: "CI-only controller identity fixture.",
  anonymousExploration: "CI-only anonymous exploration notice.",
  analytics: "CI-only analytics notice.",
  assistedContact: "CI-only assisted-contact notice.",
  assistedContactConsent: "CI-only exact provider-specific consent statement.",
  retention: "CI-only retention notice.",
  rights: "CI-only rights notice.",
  privacyContact: "CI-only privacy contact route.",
  complaintRoute: "CI-only complaint route.",
  transfers: "CI-only transfer notice.",
  automatedDecisionMaking: "CI-only automated-decision statement.",
};

const env: NodeJS.ProcessEnv = {
  ...process.env,
  TALKPOINT_RETENTION_CONTACT_REQUEST_DAYS: "30",
  TALKPOINT_RETENTION_CONSENT_RECORD_DAYS: "60",
  TALKPOINT_RETENTION_PROVIDER_AUDIT_DAYS: "90",
  TALKPOINT_RETENTION_ANONYMOUS_ANALYTICS_DAYS: "120",
};
process.env.TALKPOINT_PRODUCTION_CONSENT_VERSION = "ci-consent-v1";

const validFixture: ProductionPrivacyConfiguration = {
  reviewStatus: "approved",
  version: "ci-privacy-v1",
  consentVersion: "ci-consent-v1",
  approvalReference: "CI-only-authorised-review-fixture",
  reviewedAt: "2026-09-26T10:00:00.000Z",
  nextReviewAt: "2026-10-27T10:00:00.000Z",
  integrationInventoryVersion: "ci-inventory-v1",
  dataSubjectProcedureReference: "ci-procedure-v1",
  approvedRetentionPolicy: {
    contactRequestDays: 30,
    consentRecordDays: 60,
    providerAuditDays: 90,
    anonymousAnalyticsDays: 120,
  },
  notice: { en: copy, el: { ...copy, heading: "CI πληροφορίες απορρήτου" } },
};

const validated = validateProductionPrivacyConfiguration(validFixture, now, env);
assert(validated.version === "ci-privacy-v1", "Valid approved privacy fixture was rejected");

process.env.TALKPOINT_PRODUCTION_CONSENT_VERSION = "different-consent-v2";
expectInvalid(validFixture, now, env, "consent version does not match");
process.env.TALKPOINT_PRODUCTION_CONSENT_VERSION = "ci-consent-v1";

expectInvalid(
  {
    ...validFixture,
    approvedRetentionPolicy: {
      ...validFixture.approvedRetentionPolicy!,
      contactRequestDays: 31,
    },
  },
  now,
  env,
  "Runtime retention values do not match",
);

expectInvalid(
  { ...validFixture, nextReviewAt: "2026-09-27T09:59:59.000Z" },
  now,
  env,
  "approval is stale",
);

expectInvalid(
  {
    ...validFixture,
    notice: {
      ...validFixture.notice!,
      el: { ...validFixture.notice!.el, complaintRoute: "" },
    },
  },
  now,
  env,
  "el complaintRoute",
);

delete process.env.TALKPOINT_PRODUCTION_PRIVACY_ENABLED;
delete process.env.TALKPOINT_PRODUCTION_CONSENT_VERSION;

console.log("Production privacy/legal configuration validation checks passed.");
