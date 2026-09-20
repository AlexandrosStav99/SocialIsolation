import type { ContactRequest, ConsentRecord } from "@/lib/domain/data-boundaries";

export type ContactRequestCreation = {
  request: ContactRequest;
  consent: ConsentRecord;
};

export function assertConsentMatchesRequest({ request, consent }: ContactRequestCreation): void {
  if (consent.requestId !== request.requestId) {
    throw new Error("Consent does not belong to contact request");
  }
  if (consent.recipientProviderOrganisationId !== request.providerOrganisationId) {
    throw new Error("Consent recipient does not match request provider");
  }
  if (!consent.authorisedDataCategories.length) {
    throw new Error("Consent must name authorised data categories");
  }
  if (request.optionalNote && !consent.optionalNoteAuthorised) {
    throw new Error("Optional note cannot be stored without explicit authorisation");
  }
}
