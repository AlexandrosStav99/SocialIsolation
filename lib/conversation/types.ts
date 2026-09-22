import type { ServiceArea, SupportTopic } from "@/lib/domain/data-boundaries";

export type ConversationLanguage = "el" | "en";
export type ConversationStage =
  | "age_gate"
  | "primary_topic"
  | "secondary_topics"
  | "optional_context"
  | "service_area"
  | "preferences"
  | "review"
  | "complete"
  | "ended";

export type ConversationState = {
  sessionId: string;
  language: ConversationLanguage;
  stage: ConversationStage;
  ageConfirmed?: boolean;
  primarySupportTopic?: SupportTopic;
  secondarySupportTopics: SupportTopic[];
  optionalFreeText?: string;
  serviceArea?: ServiceArea;
  preferences: string[];
};

export type ConversationAction =
  | { type: "confirm_age"; confirmed: boolean }
  | { type: "select_primary_topic"; topic: SupportTopic }
  | { type: "select_secondary_topics"; topics: SupportTopic[] }
  | { type: "set_optional_context"; text?: string }
  | { type: "select_service_area"; area: ServiceArea }
  | { type: "set_preferences"; preferences: string[] }
  | { type: "confirm_review" }
  | { type: "end_session" };

export type ConversationPrompt = {
  stage: ConversationStage;
  heading: string;
  body?: string;
  freeTextLimit?: number;
  allowSkip?: boolean;
};
