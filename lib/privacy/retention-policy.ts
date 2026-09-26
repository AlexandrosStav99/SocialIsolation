export type RetentionPolicy = {
  contactRequestDays: number;
  consentRecordDays: number;
  providerAuditDays: number;
  anonymousAnalyticsDays: number;
};

const MAX_RETENTION_DAYS = 36500;

function parseDays(env: NodeJS.ProcessEnv, name: string): number {
  const raw = env[name]?.trim();
  if (!raw) {
    throw new Error(
      name + " must be explicitly configured before retention automation can run",
    );
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > MAX_RETENTION_DAYS) {
    throw new Error(name + " must be an integer from 0 to " + MAX_RETENTION_DAYS);
  }
  return value;
}

export function readRetentionPolicy(
  env: NodeJS.ProcessEnv = process.env,
): RetentionPolicy {
  return {
    contactRequestDays: parseDays(env, "TALKPOINT_RETENTION_CONTACT_REQUEST_DAYS"),
    consentRecordDays: parseDays(env, "TALKPOINT_RETENTION_CONSENT_RECORD_DAYS"),
    providerAuditDays: parseDays(env, "TALKPOINT_RETENTION_PROVIDER_AUDIT_DAYS"),
    anonymousAnalyticsDays: parseDays(env, "TALKPOINT_RETENTION_ANONYMOUS_ANALYTICS_DAYS"),
  };
}

export function retentionCutoff(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
