export type TalkPointRuntimeMode = "development" | "demo" | "production";

const RUNTIME_MODES = new Set<TalkPointRuntimeMode>(["development", "demo", "production"]);

function requireServerValue(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}

function parseBoolean(name: string, raw: string): boolean {
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new Error(`${name} must be either true or false`);
}

export function getRuntimeMode(): TalkPointRuntimeMode {
  const raw = process.env.TALKPOINT_RUNTIME_MODE?.trim().toLowerCase();
  if (raw && RUNTIME_MODES.has(raw as TalkPointRuntimeMode)) {
    return raw as TalkPointRuntimeMode;
  }

  if (!raw && process.env.NODE_ENV === "development") {
    return "development";
  }

  throw new Error(
    "TALKPOINT_RUNTIME_MODE must be explicitly set to development, demo, or production outside next dev",
  );
}

export function getDatabaseUrl(): string {
  return requireServerValue("DATABASE_URL");
}

export function getPayloadSecret(): string {
  return requireServerValue("PAYLOAD_SECRET");
}

export function getEphemeralSessionTtlMinutes(): number {
  const raw = process.env.TALKPOINT_EPHEMERAL_SESSION_TTL_MINUTES ?? "120";
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0 || value > 1440) {
    throw new Error("TALKPOINT_EPHEMERAL_SESSION_TTL_MINUTES must be 1..1440");
  }
  return value;
}

export function isSyntheticDirectoryFallbackAllowed(): boolean {
  const mode = getRuntimeMode();
  if (mode === "production") return false;

  const raw = process.env.TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK;
  if (raw === undefined || raw.trim() === "") return true;
  return parseBoolean("TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK", raw.trim().toLowerCase());
}

function validateProductionSecret(secret: string) {
  if (secret.length < 32) {
    throw new Error("PAYLOAD_SECRET must be at least 32 characters in production");
  }
  if (/(change-me|changeme|placeholder|example|ci-only|development|dev-secret|test-secret)/i.test(secret)) {
    throw new Error("PAYLOAD_SECRET contains a development or placeholder value");
  }
}

function validateProductionDatabaseUrl(databaseUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL");
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL must use postgres:// or postgresql://");
  }
  if (!parsed.hostname || !parsed.username || !parsed.password) {
    throw new Error("DATABASE_URL must include a host and non-empty credentials in production");
  }

  const hostname = parsed.hostname.toLowerCase();
  if (["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname)) {
    throw new Error("Production DATABASE_URL must not use a local development database host");
  }
  if (/(change-me|changeme|placeholder|ci-only|example\.com|\.invalid)/i.test(databaseUrl)) {
    throw new Error("DATABASE_URL contains an obvious development, test, or placeholder value");
  }
}

export function validateRuntimeConfiguration(): TalkPointRuntimeMode {
  const mode = getRuntimeMode();
  const databaseUrl = getDatabaseUrl();
  const payloadSecret = getPayloadSecret();
  getEphemeralSessionTtlMinutes();

  if (mode !== "production") return mode;

  if (process.env.TALKPOINT_ENABLE_DEMO_DASHBOARD?.trim().toLowerCase() === "true") {
    throw new Error("TALKPOINT_ENABLE_DEMO_DASHBOARD must not be enabled in production");
  }

  const fallback = process.env.TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK?.trim().toLowerCase();
  if (fallback !== "false") {
    throw new Error(
      "TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK must be explicitly false in production",
    );
  }

  validateProductionSecret(payloadSecret);
  validateProductionDatabaseUrl(databaseUrl);
  return mode;
}
