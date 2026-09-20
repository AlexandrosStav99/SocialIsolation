import { NextResponse } from "next/server";
import { createSharingPreview } from "@/lib/handoff/preview";
import { createConsentedContactRequest } from "@/lib/handoff/create-request";
import { requireAuthenticatedActor } from "@/lib/provider/auth";
import { getProviderQueue } from "@/lib/provider/queue";
import { transitionRequestStatus } from "@/lib/provider/workflow";
import { supportTopics, serviceAreas, type SupportTopic, type ServiceArea } from "@/lib/domain/data-boundaries";

export async function POST(request:Request){
  const body=await request.json() as {serviceId?:string;providerOrganisationId?:string;primarySupportTopic?:string;secondarySupportTopics?:string[];serviceArea?:string};
  if(!body.serviceId||!body.providerOrganisationId||!supportTopics.includes(body.primarySupportTopic as SupportTopic)||!serviceAreas.includes(body.serviceArea as ServiceArea)) return NextResponse.json({error:"Invalid demonstration input"},{status:400});
  const secondaries=(body.secondarySupportTopics??[]).filter((x):x is SupportTopic=>supportTopics.includes(x as SupportTopic)).slice(0,2);
  const preview=createSharingPreview({providerOrganisationId:body.providerOrganisationId,serviceId:body.serviceId,contact:{type:"email",value:"fictional-user@example.invalid"},primarySupportTopic:body.primarySupportTopic as SupportTopic,secondarySupportTopics:secondaries,serviceArea:body.serviceArea as ServiceArea,preferences:[],structuredSupportSummary:"Synthetic controlled demonstration summary. No real user data."});
  const created=createConsentedContactRequest(preview,{accepted:true,consentVersion:"demo-v1",optionalNoteAccepted:false});
  const actor=requireAuthenticatedActor({userId:"demo-provider-manager",role:"provider_manager",organisationId:body.providerOrganisationId});
  const queue=getProviderQueue(actor,[created.request]);
  const updated=transitionRequestStatus(actor,queue[0],"contact_attempted");
  return NextResponse.json({label:"Demonstration Data",requestCreated:true,queueVisible:queue.length===1,status:updated.status,realRequestSent:false});
}
