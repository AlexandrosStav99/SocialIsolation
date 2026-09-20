import type { ServiceArea, SupportTopic } from "@/lib/domain/data-boundaries";

export type ContactMethod = { type:"email"|"phone"; value:string };
export type SharingPreview = {
  providerOrganisationId:string; serviceId:string; preferredName?:string; contact:ContactMethod;
  primarySupportTopic:SupportTopic; secondarySupportTopics:SupportTopic[]; serviceArea?:ServiceArea;
  preferences:string[]; structuredSupportSummary:string; optionalNote?:string;
};
export type ConsentInput = { accepted:boolean; consentVersion:string; optionalNoteAccepted:boolean };
export type SelfServiceContact = { kind:"self_service"; serviceId:string; contactChannel:string };
export type AssistedContact = { kind:"assisted"; requestId:string; managementId:string };
