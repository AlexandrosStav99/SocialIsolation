type SafeLogValue = string | number | boolean | null | undefined;

export type SafeLogMetadata = {
  requestId?: string;
  providerId?: string;
  eventType?: string;
  status?: string;
  errorCode?: string;
  [key: string]: SafeLogValue;
};

const forbiddenKeys = new Set([
  "freeText",
  "free_text",
  "contactDetail",
  "contact_detail",
  "preferredName",
  "preferred_name",
  "structuredSupportSummary",
  "structured_summary",
  "prompt",
  "response",
  "email",
  "phone",
]);

export function sanitiseLogMetadata(metadata: SafeLogMetadata): SafeLogMetadata {
  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !forbiddenKeys.has(key)),
  );
}

export function safeLog(
  level: "info" | "warn" | "error",
  message: string,
  metadata: SafeLogMetadata = {},
) {
  const safe = sanitiseLogMetadata(metadata);
  const writer = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  writer(message, safe);
}
