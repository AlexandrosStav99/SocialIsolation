import {
  DEMO_INFORMATION_SOURCE,
  demoProviders,
  demoServices,
} from "@/data/demo-directory";
import {
  serviceAreas,
  supportTopics,
  type ServiceArea,
  type SupportTopic,
} from "@/lib/domain/data-boundaries";
import type {
  ProviderDirectoryRecord,
  ProviderType,
  ServiceDirectoryRecord,
} from "@/lib/directory/contracts";

export type DirectoryBundle = {
  providers: ProviderDirectoryRecord[];
  services: ServiceDirectoryRecord[];
};

const providerTypes: ProviderType[] = [
  "ngo_nonprofit",
  "public_community",
  "mental_health_counselling",
  "university_student",
  "helpline_immediate_support",
];

const deliveryModes = ["online", "in_person", "phone"] as const;
const languages = ["el", "en"] as const;

type PayloadProviderDoc = {
  id: string | number;
  name?: unknown;
  providerType?: unknown;
  informationSource?: unknown;
  informationCheckedAt?: unknown;
};

type PayloadServiceDoc = {
  id: string | number;
  provider?: unknown;
  name?: unknown;
  topics?: unknown;
  coverage?: unknown;
  languages?: unknown;
  deliveryModes?: unknown;
  eligibility?: unknown;
  contactChannels?: unknown;
  availability?: unknown;
  immediateSupportCapable?: unknown;
  integrated?: unknown;
  informationSource?: unknown;
  informationCheckedAt?: unknown;
};

function relationshipId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return null;
}

function validDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function stableProviderId(name: string, rawId: string): string {
  return demoProviders.find((provider) => provider.name === name)?.id ?? `payload-provider-${rawId}`;
}

function stableServiceId(name: string, rawId: string): string {
  return demoServices.find((service) => service.name === name)?.id ?? `payload-service-${rawId}`;
}

export async function loadPayloadDemoDirectory(): Promise<DirectoryBundle | null> {
  if (!process.env.DATABASE_URL || !process.env.PAYLOAD_SECRET) return null;

  try {
    const [{ getPayload }, { default: config }] = await Promise.all([
      import("payload"),
      import("../../payload.config"),
    ]);
    const payload = await getPayload({ config });

    const [providerResult, serviceResult] = await Promise.all([
      payload.find({
        collection: "providers",
        where: { informationSource: { equals: DEMO_INFORMATION_SOURCE } },
        limit: 100,
        depth: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: "services",
        where: { informationSource: { equals: DEMO_INFORMATION_SOURCE } },
        limit: 100,
        depth: 0,
        overrideAccess: true,
      }),
    ]);

    const rawProviderIdToStableId = new Map<string, string>();
    const providers: ProviderDirectoryRecord[] = [];

    for (const doc of providerResult.docs as unknown as PayloadProviderDoc[]) {
      if (
        typeof doc.name !== "string" ||
        typeof doc.providerType !== "string" ||
        !providerTypes.includes(doc.providerType as ProviderType) ||
        doc.informationSource !== DEMO_INFORMATION_SOURCE
      ) {
        continue;
      }

      const checkedAt = validDate(doc.informationCheckedAt);
      if (!checkedAt) continue;

      const rawId = String(doc.id);
      const id = stableProviderId(doc.name, rawId);
      rawProviderIdToStableId.set(rawId, id);
      providers.push({
        id,
        name: doc.name,
        type: doc.providerType as ProviderType,
        information: { source: DEMO_INFORMATION_SOURCE, checkedAt },
      });
    }

    const services: ServiceDirectoryRecord[] = [];
    for (const doc of serviceResult.docs as unknown as PayloadServiceDoc[]) {
      if (typeof doc.name !== "string" || doc.informationSource !== DEMO_INFORMATION_SOURCE) continue;

      const providerRawId = relationshipId(doc.provider);
      const providerId = providerRawId ? rawProviderIdToStableId.get(providerRawId) : undefined;
      const checkedAt = validDate(doc.informationCheckedAt);
      if (!providerId || !checkedAt) continue;

      const topics = stringArray(doc.topics).filter((topic): topic is SupportTopic =>
        supportTopics.includes(topic as SupportTopic),
      );
      const coverage = stringArray(doc.coverage).filter((area): area is ServiceArea =>
        serviceAreas.includes(area as ServiceArea),
      );
      const serviceLanguages = stringArray(doc.languages).filter(
        (language): language is "el" | "en" => languages.includes(language as "el" | "en"),
      );
      const serviceDeliveryModes = stringArray(doc.deliveryModes).filter(
        (mode): mode is "online" | "in_person" | "phone" =>
          deliveryModes.includes(mode as "online" | "in_person" | "phone"),
      );

      if (!topics.length || !coverage.length || !serviceLanguages.length || !serviceDeliveryModes.length) continue;

      services.push({
        id: stableServiceId(doc.name, String(doc.id)),
        providerId,
        name: doc.name,
        topics,
        coverage,
        languages: serviceLanguages,
        deliveryModes: serviceDeliveryModes,
        eligibility: stringArray(doc.eligibility),
        contactChannels: stringArray(doc.contactChannels),
        availability: typeof doc.availability === "string" ? doc.availability : undefined,
        immediateSupportCapable: doc.immediateSupportCapable === true,
        integrated: doc.integrated === true,
        information: { source: DEMO_INFORMATION_SOURCE, checkedAt },
      });
    }

    if (!providers.length || !services.length) return null;
    return { providers, services };
  } catch {
    return null;
  }
}
