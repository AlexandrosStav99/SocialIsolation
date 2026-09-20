import type { AnonymousAnalyticsEvent } from "@/lib/domain/data-boundaries";
import { suppressCount } from "./aggregate";
import type { SuppressedCount } from "./types";
export type OperationalAnalytics={interactions:SuppressedCount;servicesShown:SuppressedCount;selfServiceSelections:SuppressedCount;assistedContactSelections:SuppressedCount;noMatches:SuppressedCount};
export function buildOperationalAnalytics(events:readonly AnonymousAnalyticsEvent[]):OperationalAnalytics{
 const enough=events.length>=5;
 const metric=(count:number):SuppressedCount=>enough?suppressCount(count):{count:null,suppressed:true};
 return {interactions:suppressCount(events.length),servicesShown:metric(events.reduce((sum,e)=>sum+e.servicesShownCount,0)),selfServiceSelections:metric(events.filter(e=>e.selfServiceSelected).length),assistedContactSelections:metric(events.filter(e=>e.assistedContactSelected).length),noMatches:metric(events.filter(e=>e.noMatch).length)};
}
