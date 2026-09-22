import type { ContactRequest } from "@/lib/domain/data-boundaries";
import type { AuthenticatedActor } from "./auth";
import { assertProviderRequestAccess } from "./permissions";

export function getProviderQueue(actor:AuthenticatedActor,requests:readonly ContactRequest[]):ContactRequest[]{
  if(!actor.organisationId) return [];
  return requests.filter((request)=>{
    if(request.providerOrganisationId!==actor.organisationId) return false;
    assertProviderRequestAccess(actor,request);
    return true;
  });
}
export function getProviderRequest(actor:AuthenticatedActor,requests:readonly ContactRequest[],requestId:string):ContactRequest{
  const request=requests.find((item)=>item.requestId===requestId);
  if(!request) throw new Error("Provider request not found");
  assertProviderRequestAccess(actor,request);
  return request;
}
