import type { ConversationLanguage } from "@/lib/conversation/types";
import type { SupportTopic } from "@/lib/domain/data-boundaries";

export type AiConversationInput = {
  language: ConversationLanguage;
  freeText: string;
  allowedTopics: readonly SupportTopic[];
};

export type AiConversationOutput = {
  suggestedTopics: SupportTopic[];
  clarification?: string;
};

export interface AiConversationProvider {
  interpret(input: AiConversationInput, signal?: AbortSignal): Promise<unknown>;
}
