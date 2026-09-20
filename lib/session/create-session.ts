import type { EphemeralConversationSession } from "@/lib/domain/data-boundaries";

export function createEphemeralSession(
  ttlMinutes: number,
  now = new Date(),
): EphemeralConversationSession {
  if (!Number.isInteger(ttlMinutes) || ttlMinutes <= 0) {
    throw new Error("Session TTL must be a positive integer");
  }
  return {
    sessionId: crypto.randomUUID(),
    stage: "start",
    secondarySupportTopics: [],
    preferences: [],
    candidateSignals: [],
    expiresAt: new Date(now.getTime() + ttlMinutes * 60_000),
  };
}
