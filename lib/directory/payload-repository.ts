import { getPayload } from "payload";
import config from "../../payload.config";
import type { DirectoryRepository } from "@/lib/directory/repository";
import type { ProviderDirectoryRecord, ServiceDirectoryRecord, ProviderType } from "@/lib/directory/contracts";
import type { ServiceArea, SupportTopic } from "@/lib/domain/data-boundaries";

function relationId(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "id" in value) return String((value as { id: unknown }).id);
  throw new Error("Payload relationship is missing an id");
}

export class PayloadDirectoryRepository implements DirectoryRepository {
  async listProviders(): Promise<ProviderDirectoryRecord[]> {
    const payload = await getPayload({ config });
    const result = await payload.find({ collection: "providers", limit: 1000, depth: 0 });
    return result.docs.map((doc) => ({
      id: String(doc.id),
      organisationId: doc.organisation ? relationId(doc.organisation) : undefined,
      name: doc.name,
      type: doc.providerType as ProviderType,
      information: { source: doc.informationSource, checkedAt: new Date(doc.informationCheckedAt) },
    }));
  }

  async listServices(): Promise<ServiceDirectoryRecord[]> {
    const payload = await getPayload({ config });
    const result = await payload.find({ collection: "services", limit: 1000, depth: 0 });
    return result.docs.map((doc) => ({
      id: String(doc.id),
      providerId: relationId(doc.provider),
      name: doc.name,
      topics: doc.topics as SupportTopic[],
      coverage: doc.coverage as ServiceArea[],
      languages: doc.languages as ("el" | "en")[],
      deliveryModes: doc.deliveryModes as ("online" | "in_person" | "phone")[],
      eligibility: doc.eligibility ?? [],
      contactChannels: doc.contactChannels ?? [],
      availability: doc.availability ?? undefined,
      immediateSupportCapable: Boolean(doc.immediateSupportCapable),
      integrated: Boolean(doc.integrated),
      information: { source: doc.informationSource, checkedAt: new Date(doc.informationCheckedAt) },
    }));
  }
  async getProvider(id: string): Promise<ProviderDirectoryRecord | null> {
    const payload = await getPayload({ config });
    try {
      const doc = await payload.findByID({ collection: "providers", id, depth: 0 });
      return {
        id: String(doc.id),
        organisationId: doc.organisation ? relationId(doc.organisation) : undefined,
        name: doc.name,
        type: doc.providerType as ProviderType,
        information: { source: doc.informationSource, checkedAt: new Date(doc.informationCheckedAt) },
      };
    } catch {
      return null;
    }
  }

  async getService(id: string): Promise<ServiceDirectoryRecord | null> {
    const payload = await getPayload({ config });
    try {
      const doc = await payload.findByID({ collection: "services", id, depth: 0 });
      return {
        id: String(doc.id),
        providerId: relationId(doc.provider),
        name: doc.name,
        topics: doc.topics as SupportTopic[],
        coverage: doc.coverage as ServiceArea[],
        languages: doc.languages as ("el" | "en")[],
        deliveryModes: doc.deliveryModes as ("online" | "in_person" | "phone")[],
        eligibility: doc.eligibility ?? [],
        contactChannels: doc.contactChannels ?? [],
        availability: doc.availability ?? undefined,
        immediateSupportCapable: Boolean(doc.immediateSupportCapable),
        integrated: Boolean(doc.integrated),
        information: { source: doc.informationSource, checkedAt: new Date(doc.informationCheckedAt) },
      };
    } catch {
      return null;
    }
  }
}
