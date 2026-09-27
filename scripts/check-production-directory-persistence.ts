import { randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import { loadProductionDirectory } from "../lib/directory/production-directory.ts";
import { SYNTHETIC_DIRECTORY_SOURCE } from "../lib/directory/synthetic.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const payload = await getPayload({ config });
  const suffix = randomUUID();
  const now = new Date("2026-09-27T09:00:00.000Z");
  const checkedAt = new Date("2026-09-26T09:00:00.000Z").toISOString();
  const futureReview = new Date("2026-10-27T09:00:00.000Z").toISOString();
  const pastReview = new Date("2026-09-26T08:00:00.000Z").toISOString();

  let providerId: string | number | null = null;
  let serviceId: string | number | null = null;
  let exitCode = 0;

  try {
    const provider = await payload.create({
      collection: "providers",
      data: {
        name: "PROD-10 CI Directory Provider " + suffix,
        providerType: "ngo_nonprofit",
        informationSource: "CI-only authoritative fixture; not a real provider",
        informationCheckedAt: checkedAt,
        productionDirectoryVerified: true,
        productionDirectorySuppressed: false,
        productionDirectorySourceType: "other_authoritative_source",
        productionDirectoryNextReviewAt: futureReview,
      },
      overrideAccess: true,
    });
    providerId = provider.id;

    const service = await payload.create({
      collection: "services",
      data: {
        provider: provider.id,
        name: "PROD-10 CI Directory Service " + suffix,
        topics: ["social_connection"],
        coverage: ["online"],
        languages: ["en"],
        deliveryModes: ["online"],
        eligibility: ["Controlled CI-only fixture"],
        contactChannels: ["prod10-directory@example.invalid"],
        availability: "Controlled CI-only fixture",
        immediateSupportCapable: false,
        integrated: false,
        productionHandoffEnabled: false,
        informationSource: "CI-only authoritative fixture; not a real provider",
        informationCheckedAt: checkedAt,
        productionDirectoryVerified: true,
        productionDirectorySuppressed: false,
        productionDirectorySourceType: "other_authoritative_source",
        productionDirectoryNextReviewAt: futureReview,
        productionDirectoryEnabled: true,
      },
      overrideAccess: true,
    });
    serviceId = service.id;

    const eligible = await loadProductionDirectory(payload, now);
    assert(eligible !== null, "Eligible checked production directory fixture was not published");
    assert(eligible.providers.length === 1, "Expected one eligible production provider");
    assert(eligible.services.length === 1, "Expected one eligible production service");
    assert(eligible.providers[0].id === String(provider.id), "Provider public directory id mismatch");
    assert(eligible.services[0].id === String(service.id), "Service public directory id mismatch");
    assert(
      eligible.services[0].integrated === false,
      "Directory-only service must remain directory-only; publication must not imply integration",
    );

    await payload.update({
      collection: "services",
      id: service.id,
      data: { productionDirectorySuppressed: true },
      overrideAccess: true,
    });
    assert(
      (await loadProductionDirectory(payload, now)) === null,
      "Suppressed service must fail closed out of production directory",
    );

    await payload.update({
      collection: "services",
      id: service.id,
      data: {
        productionDirectorySuppressed: false,
        productionDirectoryNextReviewAt: pastReview,
      },
      overrideAccess: true,
    });
    assert(
      (await loadProductionDirectory(payload, now)) === null,
      "Expired service review must fail closed out of production directory",
    );

    await payload.update({
      collection: "services",
      id: service.id,
      data: { productionDirectoryNextReviewAt: futureReview },
      overrideAccess: true,
    });
    await payload.update({
      collection: "providers",
      id: provider.id,
      data: { productionDirectoryVerified: false },
      overrideAccess: true,
    });
    assert(
      (await loadProductionDirectory(payload, now)) === null,
      "Unverified provider must fail closed with all dependent services",
    );

    await payload.update({
      collection: "providers",
      id: provider.id,
      data: {
        productionDirectoryVerified: true,
        informationSource: SYNTHETIC_DIRECTORY_SOURCE,
      },
      overrideAccess: true,
    });
    assert(
      (await loadProductionDirectory(payload, now)) === null,
      "Synthetic provider provenance must never become production-directory eligible",
    );

    await payload.update({
      collection: "providers",
      id: provider.id,
      data: { informationSource: "CI-only authoritative fixture; not a real provider" },
      overrideAccess: true,
    });
    await payload.update({
      collection: "services",
      id: service.id,
      data: { productionDirectoryEnabled: false },
      overrideAccess: true,
    });
    assert(
      (await loadProductionDirectory(payload, now)) === null,
      "Disabled publication gate must fail closed",
    );

    console.log("Production directory provenance, freshness and suppression persistence checks passed.");
  } catch (error) {
    exitCode = 1;
    console.error(error);
  } finally {
    try {
      if (serviceId !== null) {
        await payload.delete({ collection: "services", id: serviceId, overrideAccess: true });
      }
      if (providerId !== null) {
        await payload.delete({ collection: "providers", id: providerId, overrideAccess: true });
      }
    } catch (cleanupError) {
      exitCode = 1;
      console.error("PROD-10 CI fixture cleanup failed", cleanupError);
    }
    process.exit(exitCode);
  }
}

void main();
