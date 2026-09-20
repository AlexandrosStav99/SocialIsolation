import type { ContactRequest } from "@/lib/domain/data-boundaries";
import type { AuthenticatedActor } from "./auth";
import { assertProviderRequestAccess,canAssignRequests,canUpdateRequestStatus } from "./permissions";

type RequestStatus=ContactRequest["status"];
const allowedTransitions:Record<RequestStatus,readonly RequestStatus[]>={
  new:["assigned","contact_attempted","closed","user_declined"],
  assigned:["contact_attempted","closed","user_declined"],
  contact_attempted:["contacted","unable_to_reach","closed"],
  contacted:["accepted","referred_elsewhere","user_declined","closed"],
  accepted:["closed","referred_elsewhere"],
  closed:[], unable_to_reach:["closed"], referred_elsewhere:["closed"], user_declined:["closed"],
};
export type Assignment={requestId:string;assignedUserId:string;assignedAt:Date};
export function assignRequest(actor:AuthenticatedActor,request:ContactRequest,userId:string,now=new Date()):Assignment{
  assertProviderRequestAccess(actor,request); if(!canAssignRequests(actor)) throw new Error("Only provider managers can assign requests");
  if(!userId) throw new Error("Assignee is required");
  return {requestId:request.requestId,assignedUserId:userId,assignedAt:now};
}
export function transitionRequestStatus(actor:AuthenticatedActor,request:ContactRequest,next:RequestStatus,now=new Date()):ContactRequest{
  assertProviderRequestAccess(actor,request); if(!canUpdateRequestStatus(actor)) throw new Error("Request status update denied");
  if(!allowedTransitions[request.status].includes(next)) throw new Error("Invalid request status transition");
  return {...request,status:next,...(next==="closed"?{closedAt:now}:{})};
}
