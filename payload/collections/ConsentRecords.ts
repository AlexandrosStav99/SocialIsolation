import type { CollectionConfig } from "payload";
export const ConsentRecords: CollectionConfig = {
  slug:"consent-records",
  admin:{useAsTitle:"id"},
  fields:[
    {name:"request",type:"relationship",relationTo:"contact-requests",required:true,index:true},
    {name:"consentVersion",type:"text",required:true},
    {name:"recipientProviderOrganisation",type:"relationship",relationTo:"provider-organisations",required:true},
    {name:"authorisedDataCategories",type:"text",hasMany:true,required:true,validate:(v)=>Boolean(v?.length)||"At least one authorised category is required"},
    {name:"optionalNoteAuthorised",type:"checkbox",required:true,defaultValue:false},
    {name:"consentedAt",type:"date",required:true},
    {name:"withdrawnAt",type:"date"},
  ],
};
