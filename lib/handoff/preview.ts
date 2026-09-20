import type { SharingPreview } from "./types";
export function createSharingPreview(input:SharingPreview):SharingPreview{
  if(!input.providerOrganisationId||!input.serviceId) throw new Error("Provider and service are required");
  if(!input.contact.value.trim()) throw new Error("One contact method is required");
  if(input.preferredName!==undefined && input.preferredName.trim().length>80) throw new Error("Preferred name is too long");
  if(input.optionalNote!==undefined && input.optionalNote.trim().length>500) throw new Error("Optional note is limited to 500 characters");
  return {...input,preferredName:input.preferredName?.trim()||undefined,contact:{...input.contact,value:input.contact.value.trim()},optionalNote:input.optionalNote?.trim()||undefined};
}
