import type { SelfServiceContact } from "./types";
export function createSelfServiceContact(serviceId:string,contactChannel:string):SelfServiceContact{
  if(!serviceId||!contactChannel.trim()) throw new Error("Service and contact channel are required");
  return {kind:"self_service",serviceId,contactChannel:contactChannel.trim()};
}
