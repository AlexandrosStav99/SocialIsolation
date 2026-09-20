function requireServerValue(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
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
