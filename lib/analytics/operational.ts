import type { AnonymousAnalyticsEvent } from "@/lib/domain/data-boundaries";
export type OperationalAnalytics={interactions:number;servicesShown:number;selfServiceSelections:number;assistedContactSelections:number;noMatches:number};
export function buildOperationalAnalytics(events:readonly AnonymousAnalyticsEvent[]):OperationalAnalytics{
  return {interactions:events.length,servicesShown:events.reduce((sum,e)=>sum+e.servicesShownCount,0),selfServiceSelections:events.filter(e=>e.selfServiceSelected).length,assistedContactSelections:events.filter(e=>e.assistedContactSelected).length,noMatches:events.filter(e=>e.noMatch).length};
}
