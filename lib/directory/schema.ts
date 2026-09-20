import { serviceAreas, supportTopics } from "@/lib/domain/data-boundaries";
import type { ProviderDirectoryRecord, ServiceDirectoryRecord } from "./contracts";

const providerTypes = new Set([
  "ngo_nonprofit","public_community","mental_health_counselling","university_student","helpline_immediate_support",
]);
const deliveryModes = new Set(["online","in_person","phone"]);

export function assertProviderDirectoryRecord(record: ProviderDirectoryRecord): void {
  if (!record.id || !record.name.trim()) throw new Error("Provider requires id and name");
  if (!providerTypes.has(record.type)) throw new Error("Unsupported provider type");
  assertInformationCheck(record.information.source, record.information.checkedAt);
}

export function assertServiceDirectoryRecord(record: ServiceDirectoryRecord): void {
  if (!record.id || !record.providerId || !record.name.trim()) throw new Error("Service requires id, provider and name");
  if (!record.topics.length || record.topics.some((x) => !(supportTopics as readonly string[]).includes(x))) throw new Error("Service has invalid support topics");
  if (!record.coverage.length || record.coverage.some((x) => !(serviceAreas as readonly string[]).includes(x))) throw new Error("Service has invalid coverage");
  if (!record.languages.length || record.languages.some((x) => x !== "el" && x !== "en")) throw new Error("Service language must be el/en");
  if (!record.deliveryModes.length || record.deliveryModes.some((x) => !deliveryModes.has(x))) throw new Error("Service has invalid delivery mode");
  if (!record.contactChannels.length) throw new Error("Service requires at least one contact channel");
  assertInformationCheck(record.information.source, record.information.checkedAt);
}

function assertInformationCheck(source: string, checkedAt: Date): void {
  if (!source.trim()) throw new Error("Information source is required");
  if (!(checkedAt instanceof Date) || Number.isNaN(checkedAt.getTime())) throw new Error("Information checked date is required");
  if (checkedAt.getTime() > Date.now()) throw new Error("Information checked date cannot be in the future");
}
