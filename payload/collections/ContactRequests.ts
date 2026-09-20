import type { CollectionConfig } from "payload";
export const ContactRequests: CollectionConfig = {
  slug: "contact-requests",
  admin: { useAsTitle: "id" },
  fields: [
    { name:"providerOrganisation", type:"relationship", relationTo:"provider-organisations", required:true, index:true },
    { name:"service", type:"relationship", relationTo:"services", required:true },
    { name:"preferredName", type:"text" },
    { name:"contactType", type:"select", required:true, options:["email","phone"] },
    { name:"contactDetail", type:"text", required:true },
    { name:"primarySupportTopic", type:"text", required:true },
    { name:"secondarySupportTopics", type:"text", hasMany:true, validate:(v)=>!v || v.length<=2 || "Maximum two secondary topics" },
    { name:"serviceArea", type:"text" },
    { name:"preferences", type:"text", hasMany:true },
    { name:"structuredSupportSummary", type:"textarea", required:true },
    { name:"optionalNote", type:"textarea" },
    { name:"status", type:"select", required:true, defaultValue:"new", options:["new","assigned","contact_attempted","contacted","accepted","closed","unable_to_reach","referred_elsewhere","user_declined"] },
    { name:"assignedProviderUser", type:"relationship", relationTo:"provider-users" },
    { name:"closedAt", type:"date" },
    { name:"managementTokenHash", type:"text", required:true, hidden:true },
  ],
};
