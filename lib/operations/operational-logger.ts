export type OperationalLogLevel = "info" | "warn" | "error";

export type OperationalEventType =
  | "readiness_check_failed"
  | "api_boundary_failure"
  | "api_rate_limit_event"
  | "retention_run_complete"
  | "retention_run_failed";

type SafeOperationalValue = string | number | boolean;

export type OperationalLogMetadata = {
  component?: string;
  status?: string;
  errorCode?: string;
  httpStatus?: number;
  runtimeMode?: string;
  expiredEphemeralSessionsDeleted?: number;
  contactRequestsDeleted?: number;
  consentRecordsDeleted?: number;
  providerAuditEventsDeleted?: number;
  anonymousAnalyticsEventsDeleted?: number;
};

const allowedMetadataKeys = new Set<keyof OperationalLogMetadata>([
  "component",
  "status",
  "errorCode",
  "httpStatus",
  "runtimeMode",
  "expiredEphemeralSessionsDeleted",
  "contactRequestsDeleted",
  "consentRecordsDeleted",
  "providerAuditEventsDeleted",
  "anonymousAnalyticsEventsDeleted",
]);

const safeToken = /^[a-z0-9_.:-]{1,80}$/i;

export function sanitiseOperationalMetadata(
  metadata: Record<string, unknown>,
): Record<string, SafeOperationalValue> {
  const safe: Record<string, SafeOperationalValue> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (!allowedMetadataKeys.has(key as keyof OperationalLogMetadata)) continue;
    if (typeof value === "string") {
      if (safeToken.test(value)) safe[key] = value;
      continue;
    }
    if (typeof value === "boolean") {
      safe[key] = value;
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      safe[key] = value;
    }
  }
  return safe;
}

export function operationalLog(
  level: OperationalLogLevel,
  eventType: OperationalEventType,
  metadata: OperationalLogMetadata = {},
): void {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    eventType,
    ...sanitiseOperationalMetadata(metadata as Record<string, unknown>),
  };
  const line = JSON.stringify(record);
  const writer =
    level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  writer(line);
}
