import type { AnonymousAnalyticsEvent, ServiceArea } from "@/lib/domain/data-boundaries";
import { serviceAreas, supportTopics } from "@/lib/domain/data-boundaries";
import type { AggregateMetric, AnalyticsDashboard, AnalyticsDataLabel, HeatmapCell, SuppressedCount } from "./types";
export const MINIMUM_AGGREGATE_SAMPLE=5;
export function suppressCount(count:number):SuppressedCount{return count>=MINIMUM_AGGREGATE_SAMPLE?{count,suppressed:false}:{count:null,suppressed:true};}
export function buildAnalyticsDashboard(events:readonly AnonymousAnalyticsEvent[],label:AnalyticsDataLabel):AnalyticsDashboard{
 return {label,totalInteractions:suppressCount(events.length),outcomes:countValues(events.map(e=>e.interactionOutcome)),topics:supportTopics.map(topic=>({topic,count:events.filter(e=>e.primarySupportTopic===topic||e.secondarySupportTopics.includes(topic)).length})).filter(x=>x.count>=MINIMUM_AGGREGATE_SAMPLE),serviceAreas:buildHeatmap(events)};
}
function buildHeatmap(events:readonly AnonymousAnalyticsEvent[]):HeatmapCell[]{return serviceAreas.map((serviceArea:ServiceArea)=>{const x=suppressCount(events.filter(e=>e.serviceArea===serviceArea).length);return {serviceArea,...x};});}
function countValues(values:readonly string[]):AggregateMetric[]{const counts=new Map<string,number>();for(const value of values) counts.set(value,(counts.get(value)??0)+1);return [...counts].filter(([,count])=>count>=MINIMUM_AGGREGATE_SAMPLE).map(([key,count])=>({key,count}));}
