import type { ContactRequest } from "@/lib/domain/data-boundaries";
import type { AuthenticatedActor } from "./auth";
import { canAccessIdentifiableProviderRequest } from "@/lib/security/access-scope";

export function assertProviderRequestAccess(actor:AuthenticatedActor,request:ContactRequest):void{
  if(!canAccessIdentifiableProviderRequest(actor,request.providerOrganisationId)) throw new Error("Provider request access denied");
}
export function canAssignRequests(actor:AuthenticatedActor):boolean{return actor.role==="provider_manager";}
export function canUpdateRequestStatus(actor:AuthenticatedActor):boolean{return actor.role==="provider_manager"||actor.role==="provider_staff";}
