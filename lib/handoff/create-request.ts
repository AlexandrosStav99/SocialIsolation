import { randomUUID } from "node:crypto";
import type { ContactRequest, ConsentRecord } from "@/lib/domain/data-boundaries";
import { assertConsentMatchesRequest } from "@/lib/privacy/contact-request";
import type { ConsentInput, SharingPreview } from "./types";

export function createConsentedContactRequest(preview:SharingPreview,consent:ConsentInput,now=new Date()):{request:ContactRequest;consent:ConsentRecord;managementId:string}{
  if(!consent.accepted) throw new Error("Explicit consent is required before creating an identifiable request");
  if(!consent.consentVersion.trim()) throw new Error("Consent version is required");
  if(preview.optionalNote && !consent.optionalNoteAccepted) throw new Error("Optional note requires separate consent");
  const requestId=randomUUID(); const managementId=randomUUID(); const consentId=randomUUID();
  const request:ContactRequest={requestId,providerOrganisationId:preview.providerOrganisationId,serviceId:preview.serviceId,...(preview.preferredName?{preferredName:preview.preferredName}:{}),contactType:preview.contact.type,contactDetail:preview.contact.value,primarySupportTopic:preview.primarySupportTopic,secondarySupportTopics:[...preview.secondarySupportTopics],...(preview.serviceArea?{serviceArea:preview.serviceArea}:{}),preferences:[...preview.preferences],structuredSupportSummary:preview.structuredSupportSummary,...(preview.optionalNote&&consent.optionalNoteAccepted?{optionalNote:preview.optionalNote}:{}),status:"new",createdAt:now};
  const record:ConsentRecord={consentId,requestId,consentVersion:consent.consentVersion,recipientProviderOrganisationId:preview.providerOrganisationId,authorisedDataCategories:["contact","support_topics","service_area_preferences","structured_support_summary"],optionalNoteAuthorised:Boolean(preview.optionalNote&&consent.optionalNoteAccepted),consentedAt:now};
  if(record.optionalNoteAuthorised) record.authorisedDataCategories.push("optional_note");
  assertConsentMatchesRequest({request,consent:record});
  return {request,consent:record,managementId};
}
