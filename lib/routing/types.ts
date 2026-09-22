import type { ServiceArea, SupportTopic } from "@/lib/domain/data-boundaries";
import type { ServiceDirectoryRecord } from "@/lib/directory/contracts";
export type DiscoveryContext = { primaryTopic: SupportTopic; secondaryTopics: SupportTopic[]; serviceArea: ServiceArea; preferredLanguages?: Array<"el" | "en">; preferredDeliveryModes?: Array<"online" | "in_person" | "phone">; };
export type ServiceResult = { service: ServiceDirectoryRecord; reasons: string[]; };
export type DiscoveryResult = { kind: "matches"; services: ServiceResult[] } | { kind: "no_match"; recovery: Array<"change_area" | "change_preferences" | "browse_directory"> };
