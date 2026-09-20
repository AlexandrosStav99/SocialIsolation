import type { CollectionConfig } from "payload";
export const EphemeralSessions: CollectionConfig = {
  slug:"ephemeral-sessions",
  admin:{hidden:true},
  fields:[
    {name:"sessionId",type:"text",required:true,unique:true,index:true},
    {name:"stage",type:"text",required:true},
    {name:"primarySupportTopic",type:"text"},
    {name:"secondarySupportTopics",type:"text",hasMany:true},
    {name:"serviceArea",type:"text"},
    {name:"preferences",type:"text",hasMany:true},
    {name:"temporaryFreeText",type:"textarea"},
    {name:"candidateSignals",type:"text",hasMany:true},
    {name:"safetyRoutingState",type:"text"},
    {name:"expiresAt",type:"date",required:true,index:true},
  ],
};
