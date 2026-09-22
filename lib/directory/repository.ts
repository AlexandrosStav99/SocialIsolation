import type { ProviderDirectoryRecord, ServiceDirectoryRecord } from "./contracts";
import { assertProviderDirectoryRecord, assertServiceDirectoryRecord } from "./schema";

export interface DirectoryRepository {
  listProviders(): Promise<ProviderDirectoryRecord[]>;
  listServices(): Promise<ServiceDirectoryRecord[]>;
  getProvider(id: string): Promise<ProviderDirectoryRecord | null>;
  getService(id: string): Promise<ServiceDirectoryRecord | null>;
}

export class InMemoryDirectoryRepository implements DirectoryRepository {
  constructor(
    private readonly providers: ProviderDirectoryRecord[],
    private readonly services: ServiceDirectoryRecord[],
  ) {
    providers.forEach(assertProviderDirectoryRecord);
    services.forEach(assertServiceDirectoryRecord);
    const providerIds = new Set(providers.map((p) => p.id));
    for (const service of services) {
      if (!providerIds.has(service.providerId)) throw new Error(`Unknown provider for service ${service.id}`);
    }
  }
  async listProviders() { return [...this.providers]; }
  async listServices() { return [...this.services]; }
  async getProvider(id: string) { return this.providers.find((p) => p.id === id) ?? null; }
  async getService(id: string) { return this.services.find((s) => s.id === id) ?? null; }
}
