import type { EphemeralConversationSession } from "@/lib/domain/data-boundaries";

export interface EphemeralSessionStore {
  create(session: EphemeralConversationSession): Promise<void>;
  read(sessionId: string): Promise<EphemeralConversationSession | null>;
  update(session: EphemeralConversationSession): Promise<void>;
  delete(sessionId: string): Promise<void>;
  purgeExpired(now?: Date): Promise<number>;
}

export function assertSessionIsLive(
  session: EphemeralConversationSession,
  now = new Date(),
): void {
  if (session.expiresAt.getTime() <= now.getTime()) {
    throw new Error("Ephemeral session has expired");
  }
}
