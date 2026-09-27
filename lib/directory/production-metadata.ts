import { SYNTHETIC_DIRECTORY_SOURCE } from "./synthetic.ts";

export const productionDirectorySourceTypes = [
  "official_provider_source",
  "public_authority_source",
  "provider_operational_confirmation",
  "other_authoritative_source",
] as const;

export type ProductionDirectorySourceType =
  (typeof productionDirectorySourceTypes)[number];

type RecordLike = Record<string, unknown>;

function validDate(value: unknown): Date | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hasEligibleMetadata(record: RecordLike, now: Date): boolean {
  if (record.productionDirectoryVerified !== true) return false;
  if (record.productionDirectorySuppressed !== false) return false;

  const sourceType = record.productionDirectorySourceType;
  if (
    typeof sourceType !== "string" ||
    !productionDirectorySourceTypes.includes(
      sourceType as ProductionDirectorySourceType,
    )
  ) {
    return false;
  }

  const informationSource = record.informationSource;
  if (
    typeof informationSource !== "string" ||
    !informationSource.trim() ||
    informationSource === SYNTHETIC_DIRECTORY_SOURCE
  ) {
    return false;
  }

  const checkedAt = validDate(record.informationCheckedAt);
  const nextReviewAt = validDate(record.productionDirectoryNextReviewAt);
  if (!checkedAt || !nextReviewAt) return false;
  if (checkedAt.getTime() > now.getTime()) return false;
  if (nextReviewAt.getTime() <= now.getTime()) return false;
  if (nextReviewAt.getTime() <= checkedAt.getTime()) return false;

  return true;
}

export function isProductionProviderDirectoryEligible(
  record: RecordLike,
  now = new Date(),
): boolean {
  return hasEligibleMetadata(record, now);
}

export function isProductionServiceDirectoryEligible(
  record: RecordLike,
  now = new Date(),
): boolean {
  return (
    record.productionDirectoryEnabled === true &&
    hasEligibleMetadata(record, now)
  );
}
