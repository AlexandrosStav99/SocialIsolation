import { isSupportTopic } from "@/lib/domain/guards";
import type { AiConversationOutput } from "./types";

export function validateAiConversationOutput(value: unknown): AiConversationOutput | null {
  if (!value || typeof value !== "object") return null;
  const candidate=value as Record<string,unknown>;
  if (!Array.isArray(candidate.suggestedTopics) || candidate.suggestedTopics.length > 3) return null;
  if (!candidate.suggestedTopics.every((topic)=>typeof topic==="string" && isSupportTopic(topic))) return null;
  if (candidate.clarification !== undefined && (typeof candidate.clarification !== "string" || candidate.clarification.length > 240)) return null;
  return { suggestedTopics:[...new Set(candidate.suggestedTopics)], ...(candidate.clarification ? {clarification:candidate.clarification.trim()} : {}) };
}
