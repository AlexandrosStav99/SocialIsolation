import type { ConversationState } from "./types";

export type StructuredConversationSummary = Pick<
  ConversationState,
  "primarySupportTopic" | "secondarySupportTopics" | "serviceArea" | "preferences"
>;

export function createStructuredConversationSummary(state: ConversationState): StructuredConversationSummary {
  if (state.stage !== "complete") throw new Error("Conversation must be complete before summary creation");
  return {
    primarySupportTopic: state.primarySupportTopic,
    secondarySupportTopics: [...state.secondarySupportTopics],
    serviceArea: state.serviceArea,
    preferences: [...state.preferences],
  };
}
