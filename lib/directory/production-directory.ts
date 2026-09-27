import type { Payload } from "payload";
import {
  serviceAreas,
  supportTopics,
  type ServiceArea,
  type SupportTopic,
} from "../domain/data-boundaries.ts";
import type {
  ProviderDirectoryRecord,
  ProviderType,
  ServiceDirectoryRecord,
} from "./contracts.ts";
import {
  isProductionProviderDirectoryEligible,
  isProductionServiceDirectoryEligible,
} from "./production-metadata.ts";

export type ProductionDirectoryBundle = {
  providers: ProviderDirectoryRecord[];
  services: ServiceDirectoryRecord[];
};

type RecordLike = Record<string, unknown>;

const providerTypes: ProviderType[] = [
  "ngo_nonprofit",
  "public_community",
  "mental_health_counselling",
  "university_student",
  "helpline_immediate_support",
];
const deliveryModes = ["online", "in_person", "phone"] as const;
const languages = ["el", "en"] as const;

function relationshipId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return null;
}

function validDate(value: unknown): Date | null {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

async function loadAllRecords(
  payload: Payload,
  collection: "providers" | "services",
): Promise<RecordLike[]> {
  const docs: RecordLike[] = [];
  let page = 1;

  for (;;) {
    const result = await payload.find({
      collection,
      page,
      limit: 100,
      depth: 0,
      overrideAccess: true,
    });
    docs.push(...(result.docs as unknown as RecordLike[]));
    if (!result.hasNextPage || !result.nextPage) break;
    page = result.nextPage;
  }

  return docs;
}

export async function loadProductionDirectory(
  payload: Payload,
  now = new Date(),
): Promise<ProductionDirectoryBundle | null> {
  const [providerDocs, serviceDocs] = await Promise.all([
    loadAllRecords(payload, "providers"),
    loadAllRecords(payload, "services"),
  ]);

  const providers: ProviderDirectoryRecord[] = [];
  const eligibleProviderIds = new Set<string>();

  for (const doc of providerDocs) {
    if (!isProductionProviderDirectoryEligible(doc, now)) continue;
    if (
      typeof doc.name !== "string" ||
      typeof doc.providerType !== "string" ||
      !providerTypes.includes(doc.providerType as ProviderType)
    ) {
      continue;
    }

    const checkedAt = validDate(doc.informationCheckedAt);
    if (!checkedAt || typeof doc.informationSource !== "string") continue;

    const id = String(doc.id);
    eligibleProviderIds.add(id);
    const organisationId = relationshipId(doc.organisation);
    providers.push({
      id,
      ...(organisationId ? { organisationId } : {}),
      name: doc.name,
      type: doc.providerType as ProviderType,
      information: {
        source: doc.informationSource,
        checkedAt,
      },
    });
  }

  const services: ServiceDirectoryRecord[] = [];
  for (const doc of serviceDocs) {
    if (!isProductionServiceDirectoryEligible(doc, now)) continue;
    const providerId = relationshipId(doc.provider);
    if (!providerId || !eligibleProviderIds.has(providerId)) continue;
    if (typeof doc.name !== "string" || typeof doc.informationSource !== "string") continue;

    const checkedAt = validDate(doc.informationCheckedAt);
    if (!checkedAt) continue;

    const topics = stringArray(doc.topics).filter((topic): topic is SupportTopic =>
      supportTopics.includes(topic as SupportTopic),
    );
    const coverage = stringArray(doc.coverage).filter((area): area is ServiceArea =>
      serviceAreas.includes(area as ServiceArea),
    );
    const serviceLanguages = stringArray(doc.languages).filter(
      (language): language is "el" | "en" =>
        languages.includes(language as "el" | "en"),
    );
    const serviceDeliveryModes = stringArray(doc.deliveryModes).filter(
      (mode): mode is "online" | "in_person" | "phone" =>
        deliveryModes.includes(mode as "online" | "in_person" | "phone"),
    );

    if (
      !topics.length ||
      !coverage.length ||
      !serviceLanguages.length ||
      !serviceDeliveryModes.length
    ) {
      continue;
    }

    services.push({
      id: String(doc.id),
      providerId,
      name: doc.name,
      topics,
      coverage,
      languages: serviceLanguages,
      deliveryModes: serviceDeliveryModes,
      eligibility: stringArray(doc.eligibility),
      contactChannels: stringArray(doc.contactChannels),
      availability:
        typeof doc.availability === "string" ? doc.availability : undefined,
      immediateSupportCapable: doc.immediateSupportCapable === true,
      integrated: doc.integrated === true,
      information: {
        source: doc.informationSource,
        checkedAt,
      },
    });
  }

  if (!providers.length || !services.length) return null;

  const providerIdsWithServices = new Set(services.map((service) => service.providerId));
  return {
    providers: providers.filter((provider) => providerIdsWithServices.has(provider.id)),
    services,
  };
}
