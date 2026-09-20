import type { CollectionConfig } from "payload";
export const ProviderAuditEvents: CollectionConfig = {
 slug:"provider-audit-events", admin:{hidden:true},
 fields:[
  {name:"actorUserId",type:"text",required:true},
  {name:"organisationId",type:"text"},
  {name:"requestId",type:"text",required:true,index:true},
  {name:"eventType",type:"select",required:true,options:["request_viewed","request_assigned","status_changed"]},
  {name:"occurredAt",type:"date",required:true},
 ],
};
