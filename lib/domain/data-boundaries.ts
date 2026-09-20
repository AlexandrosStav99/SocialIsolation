/**
 * Phase 1 canonical data-domain contracts.
 * Keep anonymous analytics structurally unlinkable from identifiable requests.
 */

export const supportTopics = [
  "social_connection",
  "emotional_wellbeing",
  "family_relationships",
  "work_unemployment",
  "financial_basic_needs",
  "housing_living",
  "personal_safety",
  "education_student",
  "other_unsure",
] as const;

export const serviceAreas = [
  "nicosia",
  "limassol",
  "larnaca",
  "paphos",
  "famagusta",
  "anywhere_cyprus",
  "online",
] as const;

export type SupportTopic = (typeof supportTopics)[number];
export type ServiceArea = (typeof serviceAreas)[number];

export type EphemeralConversationSession = {
  sessionId: string;
  stage: string;
  primarySupportTopic?: SupportTopic;
  secondarySupportTopics: SupportTopic[];
  serviceArea?: ServiceArea;
  preferences: string[];
  temporaryFreeText?: string;
  candidateSignals: string[];
  safetyRoutingState?: string;
  expiresAt: Date;
};

export type AnonymousAnalyticsEvent = {
  // Deliberately no sessionId, requestId, userId, contact detail or free text.
  primarySupportTopic?: SupportTopic;
  secondarySupportTopics: SupportTopic[];
  serviceArea?: ServiceArea;
  interactionOutcome: string;
  servicesShownCount: number;
  selfServiceSelected: boolean;
  assistedContactSelected: boolean;
  noMatch: boolean;
  taxonomyVersion: string;
  createdAt: Date;
};

export type ContactRequest = {
  requestId: string;
  providerOrganisationId: string;
  serviceId: string;
  preferredName?: string;
  contactType: "email" | "phone";
  contactDetail: string;
  primarySupportTopic: SupportTopic;
  secondarySupportTopics: SupportTopic[];
  serviceArea?: ServiceArea;
  preferences: string[];
  structuredSupportSummary: string;
  optionalNote?: string;
  status:
    | "new"
    | "assigned"
    | "contact_attempted"
    | "contacted"
    | "accepted"
    | "closed"
    | "unable_to_reach"
    | "referred_elsewhere"
    | "user_declined";
  createdAt: Date;
  closedAt?: Date;
};

export type ConsentRecord = {
  consentId: string;
  requestId: string;
  consentVersion: string;
  recipientProviderOrganisationId: string;
  authorisedDataCategories: string[];
  optionalNoteAuthorised: boolean;
  consentedAt: Date;
  withdrawnAt?: Date;
};
