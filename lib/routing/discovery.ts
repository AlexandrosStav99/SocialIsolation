import type { ServiceDirectoryRecord } from "@/lib/directory/contracts";
import type { DiscoveryContext, DiscoveryResult, ServiceResult } from "./types";
const MAX_RESULTS = 3;
export function discoverServices(services: ServiceDirectoryRecord[], context: DiscoveryContext): DiscoveryResult {
  const topics = new Set([context.primaryTopic, ...context.secondaryTopics]);
  const eligible = services.filter((service) => {
    const topicMatch = service.topics.some((topic) => topics.has(topic));
    const areaMatch = service.coverage.includes(context.serviceArea) || service.coverage.includes("anywhere_cyprus") || service.coverage.includes("online");
    const languageMatch = !context.preferredLanguages?.length || context.preferredLanguages.some((language) => service.languages.includes(language));
    const deliveryMatch = !context.preferredDeliveryModes?.length || context.preferredDeliveryModes.some((mode) => service.deliveryModes.includes(mode));
    return topicMatch && areaMatch && languageMatch && deliveryMatch;
  });
  const ordered = eligible.map((service, directoryOrder): ServiceResult & { directoryOrder: number; primary: boolean } => ({
    service, directoryOrder, primary: service.topics.includes(context.primaryTopic), reasons: buildReasons(service, context),
  })).sort((a,b) => Number(b.primary)-Number(a.primary) || a.directoryOrder-b.directoryOrder).slice(0,MAX_RESULTS).map(({service,reasons})=>({service,reasons}));
  return ordered.length ? { kind:"matches", services:ordered } : { kind:"no_match", recovery:["change_area","change_preferences","browse_directory"] };
}
function buildReasons(service: ServiceDirectoryRecord, context: DiscoveryContext): string[] {
  const reasons:string[]=[];
  if(service.topics.includes(context.primaryTopic)) reasons.push("Supports the topic you selected");
  else if(service.topics.some((topic)=>context.secondaryTopics.includes(topic))) reasons.push("Supports another topic you selected");
  if(service.coverage.includes(context.serviceArea)) reasons.push("Serves your selected area");
  else if(service.coverage.includes("anywhere_cyprus")) reasons.push("Available across Cyprus");
  else if(service.coverage.includes("online")) reasons.push("Available online");
  if(context.preferredLanguages?.some((language)=>service.languages.includes(language))) reasons.push("Matches your language preference");
  if(context.preferredDeliveryModes?.some((mode)=>service.deliveryModes.includes(mode))) reasons.push("Matches your support-format preference");
  return reasons;
}
