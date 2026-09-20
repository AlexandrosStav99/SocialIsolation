import type { AuthenticatedActor } from "./auth";
export type SensitiveActionAuditEvent={actorUserId:string;organisationId?:string;requestId:string;eventType:"request_viewed"|"request_assigned"|"status_changed";createdAt:Date};
export function createSensitiveActionAuditEvent(actor:AuthenticatedActor,requestId:string,eventType:SensitiveActionAuditEvent["eventType"],now=new Date()):SensitiveActionAuditEvent{
  return {actorUserId:actor.userId,...(actor.organisationId?{organisationId:actor.organisationId}:{}),requestId,eventType,createdAt:now};
}
