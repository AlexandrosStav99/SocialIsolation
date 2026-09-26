import type { ContactRequest } from "../domain/data-boundaries.ts";
import type { AuthenticatedActor } from "./auth.ts";
import { canAccessIdentifiableProviderRequest } from "../security/access-scope.ts";

export function assertProviderRequestAccess(actor:AuthenticatedActor,request:ContactRequest):void{
  if(!canAccessIdentifiableProviderRequest(actor,request.providerOrganisationId)) throw new Error("Provider request access denied");
}
export function canAssignRequests(actor:AuthenticatedActor):boolean{return actor.role==="provider_manager";}
export function canUpdateRequestStatus(actor:AuthenticatedActor):boolean{return actor.role==="provider_manager"||actor.role==="provider_staff";}
