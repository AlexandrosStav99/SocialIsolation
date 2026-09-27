export type OperationalLogLevel = "info" | "warn" | "error";

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

export function sanitiseOperationalMetadata(
  metadata: Record<string, unknown>,
): Record<string, SafeOperationalValue> {
  const safe: Record<string, SafeOperationalValue> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (!allowedMetadataKeys.has(key as keyof OperationalLogMetadata)) continue;
    if (
      typeof value === "string" ||
      typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value))
    ) {
      safe[key] = value;
    }
  }
  return safe;
}

export function operationalLog(
  level: OperationalLogLevel,
  eventType: string,
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
