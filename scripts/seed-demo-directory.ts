import { getPayload } from "payload";
import config from "../payload.config.ts";
import {
  DEMO_INFORMATION_SOURCE,
  demoProviders,
  demoServices,
} from "../data/demo-directory.ts";

async function main() {
  const payload = await getPayload({ config });
  const providerDocumentIds = new Map<string, string | number>();
  let exitCode = 0;

  try {
    for (const provider of demoProviders) {
      const organisationName = `${provider.name} · Demonstration Organisation`;
      const existingOrganisation = await payload.find({
        collection: "provider-organisations",
        where: { name: { equals: organisationName } },
        limit: 1,
        overrideAccess: true,
      });

      const organisation = existingOrganisation.docs[0]
        ? existingOrganisation.docs[0]
        : await payload.create({
            collection: "provider-organisations",
            data: { name: organisationName },
            overrideAccess: true,
          });

      const providerData = {
        organisation: organisation.id,
        name: provider.name,
        providerType: provider.type,
        informationSource: DEMO_INFORMATION_SOURCE,
        informationCheckedAt: provider.information.checkedAt.toISOString(),
      };
      const existingProvider = await payload.find({
        collection: "providers",
        where: {
          and: [
            { name: { equals: provider.name } },
            { informationSource: { equals: DEMO_INFORMATION_SOURCE } },
          ],
        },
        limit: 1,
        overrideAccess: true,
      });

      const providerDocument = existingProvider.docs[0]
        ? await payload.update({
            collection: "providers",
            id: existingProvider.docs[0].id,
            data: providerData,
            overrideAccess: true,
          })
        : await payload.create({
            collection: "providers",
            data: providerData,
            overrideAccess: true,
          });

      providerDocumentIds.set(provider.id, providerDocument.id);
    }

    for (const service of demoServices) {
      const providerId = providerDocumentIds.get(service.providerId);
      if (!providerId) throw new Error(`Missing seeded provider for ${service.id}`);

      const serviceData = {
        provider: providerId,
        name: service.name,
        topics: service.topics,
        coverage: service.coverage,
        languages: service.languages,
        deliveryModes: service.deliveryModes,
        eligibility: service.eligibility,
        contactChannels: service.contactChannels,
        availability: service.availability,
        immediateSupportCapable: service.immediateSupportCapable,
        integrated: service.integrated,
        informationSource: DEMO_INFORMATION_SOURCE,
        informationCheckedAt: service.information.checkedAt.toISOString(),
      };
      const existingService = await payload.find({
        collection: "services",
        where: {
          and: [
            { name: { equals: service.name } },
            { informationSource: { equals: DEMO_INFORMATION_SOURCE } },
          ],
        },
        limit: 1,
        overrideAccess: true,
      });

      if (existingService.docs[0]) {
        await payload.update({
          collection: "services",
          id: existingService.docs[0].id,
          data: serviceData,
          overrideAccess: true,
        });
      } else {
        await payload.create({
          collection: "services",
          data: serviceData,
          overrideAccess: true,
        });
      }
    }

    console.log(
      `Seeded ${demoProviders.length} synthetic providers and ${demoServices.length} synthetic services into Payload/PostgreSQL.`,
    );
  } catch (error) {
    exitCode = 1;
    console.error(error);
  } finally {
    // Payload 3.90.1 can keep a bootstrap Postgres client checked out in one-shot scripts.
    // All writes above have completed before this controlled process exit.
    process.exit(exitCode);
  }
}

void main();
