import type { ContactRequest } from "../domain/data-boundaries.ts";
import type { AuthenticatedActor } from "./auth.ts";
import { assertProviderRequestAccess,canAssignRequests,canUpdateRequestStatus } from "./permissions.ts";

export type RequestStatus=ContactRequest["status"];
export const requestStatuses:readonly RequestStatus[]=["new","assigned","contact_attempted","contacted","accepted","closed","unable_to_reach","referred_elsewhere","user_declined"];
const allowedTransitions:Record<RequestStatus,readonly RequestStatus[]>={
  new:["assigned","contact_attempted","closed","user_declined"],
  assigned:["contact_attempted","closed","user_declined"],
  contact_attempted:["contacted","unable_to_reach","closed"],
  contacted:["accepted","referred_elsewhere","user_declined","closed"],
  accepted:["closed","referred_elsewhere"],
  closed:[], unable_to_reach:["closed"], referred_elsewhere:["closed"], user_declined:["closed"],
};
export type Assignment={requestId:string;assignedUserId:string;assignedAt:Date};
export function assertRequestCanBeAssigned(status:RequestStatus):void{
  if(status!=="new"&&status!=="assigned") throw new Error("Request can only be assigned while new or assigned");
}
export function assertRequestStatusTransition(current:RequestStatus,next:RequestStatus):void{
  if(!allowedTransitions[current].includes(next)) throw new Error("Invalid request status transition");
}
export function assignRequest(actor:AuthenticatedActor,request:ContactRequest,userId:string,now=new Date()):Assignment{
  assertProviderRequestAccess(actor,request); if(!canAssignRequests(actor)) throw new Error("Only provider managers can assign requests");
  if(!userId) throw new Error("Assignee is required");
  assertRequestCanBeAssigned(request.status);
  return {requestId:request.requestId,assignedUserId:userId,assignedAt:now};
}
export function transitionRequestStatus(actor:AuthenticatedActor,request:ContactRequest,next:RequestStatus,now=new Date()):ContactRequest{
  assertProviderRequestAccess(actor,request); if(!canUpdateRequestStatus(actor)) throw new Error("Request status update denied");
  assertRequestStatusTransition(request.status,next);
  return {...request,status:next,...(next==="closed"?{closedAt:now}:{})};
}
