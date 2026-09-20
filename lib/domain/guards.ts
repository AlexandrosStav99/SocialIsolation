import {
  serviceAreas,
  supportTopics,
  type AnonymousAnalyticsEvent,
  type ServiceArea,
  type SupportTopic,
} from "./data-boundaries";

export function isSupportTopic(value: string): value is SupportTopic {
  return (supportTopics as readonly string[]).includes(value);
}

export function isServiceArea(value: string): value is ServiceArea {
  return (serviceAreas as readonly string[]).includes(value);
}

const forbiddenAnonymousAnalyticsKeys = new Set([
  "sessionId",
  "session_id",
  "requestId",
  "request_id",
  "userId",
  "user_id",
  "preferredName",
  "preferred_name",
  "contactDetail",
  "contact_detail",
  "email",
  "phone",
  "freeText",
  "free_text",
]);

export function assertAnonymousAnalyticsBoundary(
  event: AnonymousAnalyticsEvent | Record<string, unknown>,
): asserts event is AnonymousAnalyticsEvent {
  for (const key of Object.keys(event)) {
    if (forbiddenAnonymousAnalyticsKeys.has(key)) {
      throw new Error(`Anonymous analytics boundary violation: ${key}`);
    }
  }
}
