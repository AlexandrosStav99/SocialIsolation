import {
  type AnonymousAnalyticsEvent,
  type EphemeralConversationSession,
} from "@/lib/domain/data-boundaries";
import { assertAnonymousAnalyticsBoundary } from "@/lib/domain/guards";

export type AnalyticsOutcomeInput = {
  interactionOutcome: string;
  servicesShownCount: number;
  selfServiceSelected: boolean;
  assistedContactSelected: boolean;
  noMatch: boolean;
  taxonomyVersion: string;
};

export function createAnonymousAnalyticsEvent(
  session: EphemeralConversationSession,
  outcome: AnalyticsOutcomeInput,
  createdAt = new Date(),
): AnonymousAnalyticsEvent {
  const event: AnonymousAnalyticsEvent = {
    primarySupportTopic: session.primarySupportTopic,
    secondarySupportTopics: [...session.secondarySupportTopics],
    serviceArea: session.serviceArea,
    interactionOutcome: outcome.interactionOutcome,
    servicesShownCount: outcome.servicesShownCount,
    selfServiceSelected: outcome.selfServiceSelected,
    assistedContactSelected: outcome.assistedContactSelected,
    noMatch: outcome.noMatch,
    taxonomyVersion: outcome.taxonomyVersion,
    createdAt,
  };
  assertAnonymousAnalyticsBoundary(event);
  return event;
}
