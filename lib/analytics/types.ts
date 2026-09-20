import type { ServiceArea, SupportTopic } from "@/lib/domain/data-boundaries";
export type AnalyticsDataLabel="Live Aggregate Data"|"Demonstration Data";
export type SuppressedCount={count:number|null;suppressed:boolean};
export type AggregateMetric={key:string;count:number};
export type HeatmapCell={serviceArea:ServiceArea;count:number|null;suppressed:boolean};
export type AnalyticsDashboard={label:AnalyticsDataLabel;totalInteractions:SuppressedCount;outcomes:AggregateMetric[];topics:Array<{topic:SupportTopic;count:number}>;serviceAreas:HeatmapCell[];};
