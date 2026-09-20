import type { AnonymousAnalyticsEvent } from "@/lib/domain/data-boundaries";
export type DemonstrationAnalyticsDataset={label:"Demonstration Data";events:AnonymousAnalyticsEvent[]};
export function createDemonstrationAnalytics(events:AnonymousAnalyticsEvent[]):DemonstrationAnalyticsDataset{return {label:"Demonstration Data",events};}
