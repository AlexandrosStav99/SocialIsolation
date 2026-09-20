import { isServiceArea, isSupportTopic } from "@/lib/domain/guards";
import type { ConversationAction, ConversationLanguage, ConversationState } from "./types";

export const MAX_OPTIONAL_CONTEXT_LENGTH = 500;
export const MAX_SECONDARY_TOPICS = 2;

export function createConversation(sessionId: string, language: ConversationLanguage = "el"): ConversationState {
  if (!sessionId) throw new Error("Conversation requires a session id");
  return { sessionId, language, stage: "age_gate", secondarySupportTopics: [], preferences: [] };
}

export function transitionConversation(state: ConversationState, action: ConversationAction): ConversationState {
  if (state.stage === "complete" || state.stage === "ended") {
    if (action.type === "end_session") return { ...state, stage: "ended", optionalFreeText: undefined };
    throw new Error("Conversation is already closed");
  }
  if (action.type === "end_session") return { ...state, stage: "ended", optionalFreeText: undefined };

  switch (state.stage) {
    case "age_gate":
      requireAction(action, "confirm_age");
      return action.confirmed
        ? { ...state, ageConfirmed: true, stage: "primary_topic" }
        : { ...state, ageConfirmed: false, stage: "ended", optionalFreeText: undefined };

    case "primary_topic":
      requireAction(action, "select_primary_topic");
      if (!isSupportTopic(action.topic)) throw new Error("Invalid support topic");
      return { ...state, primarySupportTopic: action.topic, secondarySupportTopics: [], stage: "secondary_topics" };

    case "secondary_topics":
      requireAction(action, "select_secondary_topics");
      if (action.topics.length > MAX_SECONDARY_TOPICS) throw new Error("Choose up to two secondary topics");
      if (action.topics.some((topic) => !isSupportTopic(topic))) throw new Error("Invalid support topic");
      if (new Set(action.topics).size !== action.topics.length) throw new Error("Secondary topics must be unique");
      if (action.topics.includes(state.primarySupportTopic!)) throw new Error("Primary topic cannot also be secondary");
      return { ...state, secondarySupportTopics: [...action.topics], stage: "optional_context" };

    case "optional_context": {
      requireAction(action, "set_optional_context");
      const text = action.text?.trim();
      if (text && text.length > MAX_OPTIONAL_CONTEXT_LENGTH) throw new Error("Optional context is limited to 500 characters");
      return { ...state, optionalFreeText: text || undefined, stage: "service_area" };
    }

    case "service_area":
      requireAction(action, "select_service_area");
      if (!isServiceArea(action.area)) throw new Error("Invalid service area");
      return { ...state, serviceArea: action.area, stage: "preferences" };

    case "preferences":
      requireAction(action, "set_preferences");
      return { ...state, preferences: normalisePreferences(action.preferences), stage: "review" };

    case "review":
      requireAction(action, "confirm_review");
      if (!state.ageConfirmed || !state.primarySupportTopic || !state.serviceArea) throw new Error("Conversation is incomplete");
      return { ...state, stage: "complete", optionalFreeText: undefined };

    default:
      throw new Error("Unsupported conversation stage");
  }
}

function requireAction<T extends ConversationAction["type"]>(
  action: ConversationAction,
  expected: T,
): asserts action is Extract<ConversationAction, { type: T }> {
  if (action.type !== expected) throw new Error(`Expected ${expected} at this stage`);
}

function normalisePreferences(preferences: string[]): string[] {
  return [...new Set(preferences.map((value) => value.trim()).filter(Boolean))].slice(0, 10);
}
