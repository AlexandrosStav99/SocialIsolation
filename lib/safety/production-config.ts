import { isProductionSafetyEnabled } from "../config/server.ts";
import type {
  SafetyLanguage,
  SafetyPresentation,
  SafetyPresentationCopy,
  SafetyResource,
} from "./presentation.ts";
import {
  SAFETY_MATRIX_VALIDATION_STATUS,
  type SafetyMatrixValidationStatus,
} from "./validated-matrix.ts";

export type ProductionSafetyConfiguration = {
  matrixStatus: SafetyMatrixValidationStatus;
  version: string;
  approvalReference: string | null;
  reviewedAt: string | null;
  nextReviewAt: string | null;
  presentation: SafetyPresentation | null;
};

/**
 * Version-controlled production safety configuration.
 *
 * This deliberately ships unapproved and empty. Do not add real Cyprus
 * immediate-support resources or mark the matrix approved until the qualified
 * external review in docs/SAFETY-CONTENT-VALIDATION-CHECKLIST.md has real
 * evidence.
 */
export const productionSafetyConfiguration: ProductionSafetyConfiguration = {
  matrixStatus: SAFETY_MATRIX_VALIDATION_STATUS,
  version: "unapproved",
  approvalReference: null,
  reviewedAt: null,
  nextReviewAt: null,
  presentation: null,
};

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Production safety configuration missing " + field);
  }
  return value.trim();
}

function dateValue(value: unknown, field: string): Date {
  const raw = requiredString(value, field);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Production safety configuration has invalid " + field);
  }
  return parsed;
}

function assertReviewedWindow(
  reviewedAtRaw: unknown,
  nextReviewAtRaw: unknown,
  now: Date,
  prefix: string,
): void {
  const reviewedAt = dateValue(reviewedAtRaw, prefix + " reviewedAt");
  const nextReviewAt = dateValue(nextReviewAtRaw, prefix + " nextReviewAt");
  if (reviewedAt.getTime() > now.getTime()) {
    throw new Error(prefix + " review date cannot be in the future");
  }
  if (nextReviewAt.getTime() <= reviewedAt.getTime()) {
    throw new Error(prefix + " next review must be after the checked/reviewed date");
  }
  if (nextReviewAt.getTime() <= now.getTime()) {
    throw new Error(prefix + " approval/resource review is stale");
  }
}

function assertCopy(copy: SafetyPresentationCopy | undefined, language: SafetyLanguage): void {
  if (!copy) throw new Error("Production safety configuration missing " + language + " copy");
  for (const key of [
    "action",
    "heading",
    "notice",
    "continueAction",
    "resourcesHeading",
    "sourceLabel",
    "checkedLabel",
  ] as const) {
    requiredString(copy[key], language + " " + key);
  }
}

function assertSafeResource(resource: SafetyResource, now: Date, seenIds: Set<string>): void {
  const id = requiredString(resource.id, "resource id");
  if (!/^[a-z0-9][a-z0-9._-]{0,79}$/i.test(id) || seenIds.has(id)) {
    throw new Error("Production safety resource id is invalid or duplicated");
  }
  seenIds.add(id);

  for (const language of ["en", "el"] as const) {
    requiredString(resource.name?.[language], id + " " + language + " name");
    requiredString(resource.description?.[language], id + " " + language + " description");
    requiredString(resource.scope?.[language], id + " " + language + " scope");
    requiredString(
      resource.audienceEligibility?.[language],
      id + " " + language + " audience eligibility",
    );
    requiredString(resource.availability?.[language], id + " " + language + " availability");
  }

  if (
    !Array.isArray(resource.languages) ||
    resource.languages.length === 0 ||
    resource.languages.some((value) => value !== "en" && value !== "el")
  ) {
    throw new Error("Production safety resource languages are invalid");
  }
  if (resource.immediateSupportApproved !== true) {
    throw new Error("Production safety resource lacks explicit immediate-support approval");
  }

  if (resource.contact.type === "phone") {
    if (
      !/^[+0-9 ()-]{6,32}$/.test(resource.contact.value) ||
      !resource.contact.display.trim()
    ) {
      throw new Error("Production safety phone contact is invalid");
    }
  } else if (resource.contact.type === "url") {
    let parsed: URL;
    try {
      parsed = new URL(resource.contact.value);
    } catch {
      throw new Error("Production safety URL contact is invalid");
    }
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      !resource.contact.display.trim()
    ) {
      throw new Error("Production safety URL contact must be a public HTTPS URL");
    }
  } else {
    throw new Error("Production safety resource contact type is unsupported");
  }

  let source: URL;
  try {
    source = new URL(requiredString(resource.informationSource, id + " information source"));
  } catch {
    throw new Error("Production safety resource information source is invalid");
  }
  if (source.protocol !== "https:" || source.username || source.password) {
    throw new Error("Production safety resource information source must be public HTTPS");
  }

  assertReviewedWindow(
    resource.informationCheckedAt,
    resource.nextReviewAt,
    now,
    "Production safety resource " + id,
  );
}

export function validateProductionSafetyConfiguration(
  configuration: ProductionSafetyConfiguration,
  now = new Date(),
): SafetyPresentation {
  if (configuration.matrixStatus !== "approved") {
    throw new Error("Production safety matrix is not externally approved");
  }

  const version = requiredString(configuration.version, "version");
  if (/^(unapproved|draft|placeholder|example)$/i.test(version)) {
    throw new Error("Production safety configuration version is not approved");
  }
  requiredString(configuration.approvalReference, "approval reference");
  assertReviewedWindow(
    configuration.reviewedAt,
    configuration.nextReviewAt,
    now,
    "Production safety configuration",
  );

  const presentation = configuration.presentation;
  if (!presentation) {
    throw new Error("Production safety presentation is not configured");
  }
  assertCopy(presentation.copy?.en, "en");
  assertCopy(presentation.copy?.el, "el");

  if (!Array.isArray(presentation.resources) || presentation.resources.length === 0) {
    throw new Error("Production safety configuration requires at least one approved resource");
  }
  const seenIds = new Set<string>();
  for (const resource of presentation.resources) {
    assertSafeResource(resource, now, seenIds);
  }

  return presentation;
}

export function getApprovedProductionSafetyPresentation(
  now = new Date(),
): SafetyPresentation {
  if (!isProductionSafetyEnabled()) {
    throw new Error("Production safety gate is disabled");
  }
  return validateProductionSafetyConfiguration(productionSafetyConfiguration, now);
}

export function tryGetApprovedProductionSafetyPresentation(
  now = new Date(),
): SafetyPresentation | null {
  try {
    return getApprovedProductionSafetyPresentation(now);
  } catch {
    return null;
  }
}
