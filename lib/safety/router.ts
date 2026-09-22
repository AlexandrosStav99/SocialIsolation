import type { SafetyRoutingInput, SafetyRoutingResult, SafetySignal } from "./types";
const immediateSignals: readonly SafetySignal[]=["user_requests_help_now","immediate_danger_selected","recent_violence_selected"];
export function routeSafety(input: SafetyRoutingInput): SafetyRoutingResult {
  const trigger=immediateSignals.find((signal)=>input.explicitSignals.includes(signal));
  return trigger ? {state:"immediate_support",trigger,showImmediateSupportAction:true,automaticThirdPartyNotification:false} : {state:"standard",showImmediateSupportAction:true,automaticThirdPartyNotification:false};
}
