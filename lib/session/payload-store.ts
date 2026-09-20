import { getPayload } from "payload";
import config from "../../payload.config";
import type { EphemeralConversationSession } from "@/lib/domain/data-boundaries";
import type { EphemeralSessionStore } from "./ephemeral-store";

function toDomain(doc: any): EphemeralConversationSession {
 return {sessionId:doc.sessionId,stage:doc.stage,...(doc.primarySupportTopic?{primarySupportTopic:doc.primarySupportTopic}:{}),secondarySupportTopics:doc.secondarySupportTopics??[],...(doc.serviceArea?{serviceArea:doc.serviceArea}:{}),preferences:doc.preferences??[],...(doc.temporaryFreeText?{temporaryFreeText:doc.temporaryFreeText}:{}),candidateSignals:doc.candidateSignals??[],...(doc.safetyRoutingState?{safetyRoutingState:doc.safetyRoutingState}:{}),expiresAt:new Date(doc.expiresAt)};
}
function data(s:EphemeralConversationSession){return {sessionId:s.sessionId,stage:s.stage,primarySupportTopic:s.primarySupportTopic,secondarySupportTopics:s.secondarySupportTopics,serviceArea:s.serviceArea,preferences:s.preferences,temporaryFreeText:s.temporaryFreeText,candidateSignals:s.candidateSignals,safetyRoutingState:s.safetyRoutingState,expiresAt:s.expiresAt.toISOString()};}
export class PayloadEphemeralSessionStore implements EphemeralSessionStore {
 async create(s:EphemeralConversationSession){const p=await getPayload({config});await p.create({collection:"ephemeral-sessions",data:data(s)});}
 async read(sessionId:string){const p=await getPayload({config});const r=await p.find({collection:"ephemeral-sessions",where:{sessionId:{equals:sessionId}},limit:1});return r.docs[0]?toDomain(r.docs[0]):null;}
 async update(s:EphemeralConversationSession){const p=await getPayload({config});const r=await p.find({collection:"ephemeral-sessions",where:{sessionId:{equals:s.sessionId}},limit:1});if(!r.docs[0])throw new Error("Ephemeral session not found");await p.update({collection:"ephemeral-sessions",id:r.docs[0].id,data:data(s)});}
 async delete(sessionId:string){const p=await getPayload({config});await p.delete({collection:"ephemeral-sessions",where:{sessionId:{equals:sessionId}}});}
 async purgeExpired(now=new Date()){const p=await getPayload({config});const r=await p.delete({collection:"ephemeral-sessions",where:{expiresAt:{less_than_equal:now.toISOString()}}});return r.docs.length;}
}
