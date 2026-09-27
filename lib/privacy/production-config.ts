import {
  getProductionConsentVersion,
  isProductionPrivacyEnabled,
} from "../config/server.ts";
import {
  readRetentionPolicy,
  type RetentionPolicy,
} from "./retention-policy.ts";

export type PrivacyLanguage = "en" | "el";
export type PrivacyReviewStatus =
  | "requires_privacy_legal_review"
  | "approved";

export type ProductionPrivacyNoticeCopy = {
  heading: string;
  summary: string;
  controllerIdentity: string;
  anonymousExploration: string;
  analytics: string;
  assistedContact: string;
  assistedContactConsent: string;
  retention: string;
  rights: string;
  privacyContact: string;
  complaintRoute: string;
  transfers: string;
  automatedDecisionMaking: string;
};

export type ProductionPrivacyConfiguration = {
  reviewStatus: PrivacyReviewStatus;
  version: string;
  consentVersion: string | null;
  approvalReference: string | null;
  reviewedAt: string | null;
  nextReviewAt: string | null;
  integrationInventoryVersion: string | null;
  dataSubjectProcedureReference: string | null;
  approvedRetentionPolicy: RetentionPolicy | null;
  notice: Record<PrivacyLanguage, ProductionPrivacyNoticeCopy> | null;
};

/**
 * Version-controlled legal/privacy release package.
 *
 * Deliberately unapproved. Engineering must not invent controller roles, lawful
 * bases, retention periods, legal wording, transfer mechanisms or reviewer sign-off.
 */
export const productionPrivacyConfiguration: ProductionPrivacyConfiguration = {
  reviewStatus: "requires_privacy_legal_review",
  version: "unapproved",
  consentVersion: null,
  approvalReference: null,
  reviewedAt: null,
  nextReviewAt: null,
  integrationInventoryVersion: null,
  dataSubjectProcedureReference: null,
  approvedRetentionPolicy: null,
  notice: null,
};

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Production privacy configuration missing " + field);
  }
  return value.trim();
}

function parseDate(value: unknown, field: string): Date {
  const raw = requiredString(value, field);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Production privacy configuration has invalid " + field);
  }
  return parsed;
}

function assertReviewWindow(
  reviewedAtRaw: unknown,
  nextReviewAtRaw: unknown,
  now: Date,
): void {
  const reviewedAt = parseDate(reviewedAtRaw, "reviewedAt");
  const nextReviewAt = parseDate(nextReviewAtRaw, "nextReviewAt");
  if (reviewedAt.getTime() > now.getTime()) {
    throw new Error("Production privacy review date cannot be in the future");
  }
  if (nextReviewAt.getTime() <= reviewedAt.getTime()) {
    throw new Error("Production privacy next review must be after reviewedAt");
  }
  if (nextReviewAt.getTime() <= now.getTime()) {
    throw new Error("Production privacy approval is stale");
  }
}

function assertNoticeCopy(
  copy: ProductionPrivacyNoticeCopy | undefined,
  language: PrivacyLanguage,
): void {
  if (!copy) {
    throw new Error("Production privacy configuration missing " + language + " notice");
  }
  for (const key of [
    "heading",
    "summary",
    "controllerIdentity",
    "anonymousExploration",
    "analytics",
    "assistedContact",
    "assistedContactConsent",
    "retention",
    "rights",
    "privacyContact",
    "complaintRoute",
    "transfers",
    "automatedDecisionMaking",
  ] as const) {
    requiredString(copy[key], language + " " + key);
  }
}

function sameRetentionPolicy(
  expected: RetentionPolicy,
  actual: RetentionPolicy,
): boolean {
  return (
    expected.contactRequestDays === actual.contactRequestDays &&
    expected.consentRecordDays === actual.consentRecordDays &&
    expected.providerAuditDays === actual.providerAuditDays &&
    expected.anonymousAnalyticsDays === actual.anonymousAnalyticsDays
  );
}

export function validateProductionPrivacyConfiguration(
  configuration: ProductionPrivacyConfiguration,
  now = new Date(),
  env: NodeJS.ProcessEnv = process.env,
): ProductionPrivacyConfiguration {
  if (configuration.reviewStatus !== "approved") {
    throw new Error("Production privacy/legal review is not approved");
  }

  const version = requiredString(configuration.version, "version");
  if (/^(unapproved|draft|placeholder|example)$/i.test(version)) {
    throw new Error("Production privacy configuration version is not approved");
  }

  requiredString(configuration.approvalReference, "approvalReference");
  requiredString(
    configuration.integrationInventoryVersion,
    "integrationInventoryVersion",
  );
  requiredString(
    configuration.dataSubjectProcedureReference,
    "dataSubjectProcedureReference",
  );
  assertReviewWindow(configuration.reviewedAt, configuration.nextReviewAt, now);

  const configuredConsentVersion = requiredString(
    configuration.consentVersion,
    "consentVersion",
  );
  const runtimeConsentVersion = getProductionConsentVersion();
  if (configuredConsentVersion !== runtimeConsentVersion) {
    throw new Error(
      "Production consent version does not match the approved privacy configuration",
    );
  }

  if (!configuration.approvedRetentionPolicy) {
    throw new Error("Production privacy configuration missing approvedRetentionPolicy");
  }
  const runtimeRetention = readRetentionPolicy(env);
  if (!sameRetentionPolicy(configuration.approvedRetentionPolicy, runtimeRetention)) {
    throw new Error(
      "Runtime retention values do not match the approved privacy configuration",
    );
  }

  if (!configuration.notice) {
    throw new Error("Production privacy configuration missing bilingual notice");
  }
  assertNoticeCopy(configuration.notice.en, "en");
  assertNoticeCopy(configuration.notice.el, "el");

  return configuration;
}

export function getApprovedProductionPrivacyConfiguration(
  now = new Date(),
  env: NodeJS.ProcessEnv = process.env,
): ProductionPrivacyConfiguration {
  if (!isProductionPrivacyEnabled()) {
    throw new Error("Production privacy/legal gate is disabled");
  }
  return validateProductionPrivacyConfiguration(
    productionPrivacyConfiguration,
    now,
    env,
  );
}

export function tryGetApprovedProductionPrivacyConfiguration(
  now = new Date(),
): ProductionPrivacyConfiguration | null {
  try {
    return getApprovedProductionPrivacyConfiguration(now);
  } catch {
    return null;
  }
}
