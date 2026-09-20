import type { CollectionConfig } from "payload";
export const AnonymousAnalyticsEvents: CollectionConfig = {
  slug:"anonymous-analytics-events",
  admin:{hidden:true},
  fields:[
    {name:"primarySupportTopic",type:"text"},
    {name:"secondarySupportTopics",type:"text",hasMany:true},
    {name:"serviceArea",type:"text"},
    {name:"interactionOutcome",type:"text",required:true},
    {name:"servicesShownCount",type:"number",required:true,min:0},
    {name:"selfServiceSelected",type:"checkbox",required:true},
    {name:"assistedContactSelected",type:"checkbox",required:true},
    {name:"noMatch",type:"checkbox",required:true},
    {name:"taxonomyVersion",type:"text",required:true},
  ],
};
