import { getPayload } from "payload";
import config from "../../payload.config";
import type {
  EphemeralConversationSession,
  ServiceArea,
  SupportTopic,
} from "@/lib/domain/data-boundaries";
import type { EphemeralSessionStore } from "./ephemeral-store";

type EphemeralSessionDocument = {
  sessionId: string;
  stage: string;
  primarySupportTopic?: string | null;
  secondarySupportTopics?: string[] | null;
  serviceArea?: string | null;
  preferences?: string[] | null;
  temporaryFreeText?: string | null;
  candidateSignals?: string[] | null;
  safetyRoutingState?: string | null;
  expiresAt: string;
};

function toDomain(doc: EphemeralSessionDocument): EphemeralConversationSession {
  return {
    sessionId: doc.sessionId,
    stage: doc.stage,
    ...(doc.primarySupportTopic
      ? { primarySupportTopic: doc.primarySupportTopic as SupportTopic }
      : {}),
    secondarySupportTopics: (doc.secondarySupportTopics ?? []) as SupportTopic[],
    ...(doc.serviceArea ? { serviceArea: doc.serviceArea as ServiceArea } : {}),
    preferences: doc.preferences ?? [],
    ...(doc.temporaryFreeText ? { temporaryFreeText: doc.temporaryFreeText } : {}),
    candidateSignals: doc.candidateSignals ?? [],
    ...(doc.safetyRoutingState ? { safetyRoutingState: doc.safetyRoutingState } : {}),
    expiresAt: new Date(doc.expiresAt),
  };
}

function toPayloadData(session: EphemeralConversationSession) {
  return {
    sessionId: session.sessionId,
    stage: session.stage,
    primarySupportTopic: session.primarySupportTopic,
    secondarySupportTopics: session.secondarySupportTopics,
    serviceArea: session.serviceArea,
    preferences: session.preferences,
    temporaryFreeText: session.temporaryFreeText,
    candidateSignals: session.candidateSignals,
    safetyRoutingState: session.safetyRoutingState,
    expiresAt: session.expiresAt.toISOString(),
  };
}

export class PayloadEphemeralSessionStore implements EphemeralSessionStore {
  async create(session: EphemeralConversationSession): Promise<void> {
    const payload = await getPayload({ config });
    await payload.create({ collection: "ephemeral-sessions", data: toPayloadData(session) });
  }

  async read(sessionId: string): Promise<EphemeralConversationSession | null> {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "ephemeral-sessions",
      where: { sessionId: { equals: sessionId } },
      limit: 1,
    });
    return result.docs[0]
      ? toDomain(result.docs[0] as EphemeralSessionDocument)
      : null;
  }

  async update(session: EphemeralConversationSession): Promise<void> {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "ephemeral-sessions",
      where: { sessionId: { equals: session.sessionId } },
      limit: 1,
    });
    if (!result.docs[0]) throw new Error("Ephemeral session not found");
    await payload.update({
      collection: "ephemeral-sessions",
      id: result.docs[0].id,
      data: toPayloadData(session),
    });
  }

  async delete(sessionId: string): Promise<void> {
    const payload = await getPayload({ config });
    await payload.delete({
      collection: "ephemeral-sessions",
      where: { sessionId: { equals: sessionId } },
    });
  }

  async purgeExpired(now = new Date()): Promise<number> {
    const payload = await getPayload({ config });
    const result = await payload.delete({
      collection: "ephemeral-sessions",
      where: { expiresAt: { less_than_equal: now.toISOString() } },
    });
    return result.docs.length;
  }
}
