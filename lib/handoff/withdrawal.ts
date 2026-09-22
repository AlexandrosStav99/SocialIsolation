import type { ConsentRecord, ContactRequest } from "@/lib/domain/data-boundaries";
export type WithdrawalResult={requestDeleted:true;consent:ConsentRecord};
export function withdrawDemoRequest(request:ContactRequest,consent:ConsentRecord,managementId:string,presentedManagementId:string,now=new Date()):WithdrawalResult{
  if(!managementId||managementId!==presentedManagementId) throw new Error("Invalid request management identifier");
  if(request.requestId!==consent.requestId) throw new Error("Request and consent do not match");
  return {requestDeleted:true,consent:{...consent,withdrawnAt:now}};
}
