import { createHash, randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import {
  createProductionHandoffPreview,
  persistProductionHandoff,
  ProductionHandoffError,
  type ProductionHandoffInput,
  type ProductionHandoffPreviewInput,
} from "../lib/handoff/production-persistence.ts";
import { SYNTHETIC_DIRECTORY_SOURCE } from "../lib/directory/synthetic.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function relationId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return null;
}

async function expectHandoffError(
  operation: () => Promise<unknown>,
  code: string,
): Promise<void> {
  try {
    await operation();
  } catch (error) {
    assert(error instanceof ProductionHandoffError, "Expected ProductionHandoffError for " + code);
    assert(error.code === code, "Expected " + code + ", received " + error.code);
    return;
  }
  throw new Error("Expected production handoff error " + code);
}

async function main() {
  const payload = await getPayload({ config });
  const suffix = randomUUID();
  const created = {
    organisations: [] as Array<string | number>,
    providers: [] as Array<string | number>,
    services: [] as Array<string | number>,
    requests: [] as Array<string | number>,
  };
  let exitCode = 0;

  try {
    const organisationA = await payload.create({
      collection: "provider-organisations",
      data: { name: "PROD-4 CI Organisation A " + suffix },
      overrideAccess: true,
    });
    const organisationB = await payload.create({
      collection: "provider-organisations",
      data: { name: "PROD-4 CI Organisation B " + suffix },
      overrideAccess: true,
    });
    created.organisations.push(organisationA.id, organisationB.id);

    const providerA = await payload.create({
      collection: "providers",
      data: {
        organisation: organisationA.id,
        name: "PROD-4 CI Provider A " + suffix,
        providerType: "ngo_nonprofit",
        informationSource: "Controlled PROD-4 CI fixture - not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    const providerB = await payload.create({
      collection: "providers",
      data: {
        organisation: organisationB.id,
        name: "PROD-4 CI Provider B " + suffix,
        providerType: "public_community",
        informationSource: "Controlled PROD-4 CI fixture - not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    const syntheticProvider = await payload.create({
      collection: "providers",
      data: {
        organisation: organisationA.id,
        name: "PROD-4 Synthetic Provider " + suffix,
        providerType: "public_community",
        informationSource: SYNTHETIC_DIRECTORY_SOURCE,
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    created.providers.push(providerA.id, providerB.id, syntheticProvider.id);

    const serviceA = await payload.create({
      collection: "services",
      data: {
        provider: providerA.id,
        name: "PROD-4 CI Enabled Service A " + suffix,
        topics: ["social_connection", "family_relationships"],
        coverage: ["online"],
        languages: ["en"],
        deliveryModes: ["online"],
        eligibility: ["Controlled CI fixture"],
        contactChannels: ["prod4-a@example.invalid"],
        availability: "Controlled CI fixture",
        immediateSupportCapable: false,
        integrated: true,
        productionHandoffEnabled: true,
        informationSource: "Controlled PROD-4 CI fixture - not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    const serviceB = await payload.create({
      collection: "services",
      data: {
        provider: providerB.id,
        name: "PROD-4 CI Enabled Service B " + suffix,
        topics: ["education_student"],
        coverage: ["anywhere_cyprus"],
        languages: ["en"],
        deliveryModes: ["online"],
        eligibility: ["Controlled CI fixture"],
        contactChannels: ["prod4-b@example.invalid"],
        availability: "Controlled CI fixture",
        immediateSupportCapable: false,
        integrated: true,
        productionHandoffEnabled: true,
        informationSource: "Controlled PROD-4 CI fixture - not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    const disabledService = await payload.create({
      collection: "services",
      data: {
        provider: providerA.id,
        name: "PROD-4 CI Disabled Service " + suffix,
        topics: ["social_connection"],
        coverage: ["online"],
        languages: ["en"],
        deliveryModes: ["online"],
        eligibility: ["Controlled CI fixture"],
        contactChannels: ["prod4-disabled@example.invalid"],
        availability: "Controlled CI fixture",
        immediateSupportCapable: false,
        integrated: true,
        productionHandoffEnabled: false,
        informationSource: "Controlled PROD-4 CI fixture - not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    const syntheticService = await payload.create({
      collection: "services",
      data: {
        provider: syntheticProvider.id,
        name: "PROD-4 CI Synthetic Service " + suffix,
        topics: ["social_connection"],
        coverage: ["online"],
        languages: ["en"],
        deliveryModes: ["online"],
        eligibility: ["Controlled CI fixture"],
        contactChannels: ["prod4-synthetic@example.invalid"],
        availability: "Controlled CI fixture",
        immediateSupportCapable: false,
        integrated: true,
        productionHandoffEnabled: true,
        informationSource: SYNTHETIC_DIRECTORY_SOURCE,
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    created.services.push(serviceA.id, serviceB.id, disabledService.id, syntheticService.id);

    const serverSecret = "prod4-ci-management-secret-" + suffix;
    const serverConsentVersion = "prod4-ci-v1";
    const idempotencyKey = "prod4:" + randomUUID();
    const emailA = "prod4-" + suffix + "@example.invalid";
    const shareA: ProductionHandoffPreviewInput = {
      serviceId: serviceA.id,
      preferredName: "Synthetic CI User",
      contact: { type: "email", value: emailA },
      primarySupportTopic: "social_connection",
      secondarySupportTopics: ["family_relationships"],
      serviceArea: "online",
      preferences: [],
      optionalNote: "Controlled CI-only optional note.",
      optionalNoteAccepted: true,
    };

    const previewA = await createProductionHandoffPreview(payload, shareA, serverSecret, serverConsentVersion);
    assert(
      previewA.recipient.providerName === providerA.name &&
        previewA.recipient.serviceName === serviceA.name,
      "Sharing Preview recipient was not derived from the selected service/provider",
    );
    assert(
      previewA.sharing.structuredSupportSummary.includes("Loneliness & Social Connection") &&
        !previewA.sharing.structuredSupportSummary.includes("Controlled CI-only optional note"),
      "Sharing Preview summary must be controlled and separate from optional free text",
    );
    assert(
      previewA.sharing.optionalNote === "Controlled CI-only optional note.",
      "Authorised optional note must appear separately in the exact Sharing Preview",
    );
    assert(
      previewA.authorisedDataCategories.includes("optional_note"),
      "Sharing Preview must name the optional-note data category when included",
    );
    assert(
      !JSON.stringify(previewA).includes("providerOrganisationId"),
      "Sharing Preview must not expose internal provider organisation authority",
    );

    const inputA: ProductionHandoffInput = {
      ...shareA,
      consentAccepted: true,
      previewToken: previewA.previewToken,
    };
    const first = await persistProductionHandoff(
      payload,
      inputA,
      idempotencyKey,
      serverSecret,
      serverConsentVersion,
    );
    assert(first.idempotentReplay === false, "First handoff must not be marked as a replay");
    created.requests.push(Number(first.requestId));

    const stored = await payload.findByID({
      collection: "contact-requests",
      id: Number(first.requestId),
      depth: 0,
      overrideAccess: true,
    });
    assert(
      relationId(stored.providerOrganisation) === String(organisationA.id),
      "Provider organisation was not derived from the selected service/provider",
    );
    assert(relationId(stored.service) === String(serviceA.id), "Selected service was not persisted");
    assert(stored.status === "new", "Production handoff must enter the provider queue as new");
    assert(stored.contactDetail === emailA, "Contact detail was not persisted correctly");
    assert(
      stored.structuredSupportSummary === previewA.sharing.structuredSupportSummary,
      "Persisted structured summary must exactly match the signed Sharing Preview",
    );
    assert(stored.optionalNote === previewA.sharing.optionalNote, "Persisted optional note differs from preview");
    assert(
      typeof stored.idempotencyKeyHash === "string" &&
        /^[a-f0-9]{64}$/.test(stored.idempotencyKeyHash) &&
        stored.idempotencyKeyHash !== idempotencyKey,
      "Raw idempotency key must not be stored",
    );
    assert(
      typeof stored.idempotencyPayloadHash === "string" &&
        /^[a-f0-9]{64}$/.test(stored.idempotencyPayloadHash),
      "Idempotency payload fingerprint is missing",
    );
    assert(
      typeof stored.managementTokenHash === "string" &&
        /^[a-f0-9]{64}$/.test(stored.managementTokenHash) &&
        stored.managementTokenHash === createHash("sha256").update(first.managementId).digest("hex") &&
        stored.managementTokenHash !== first.managementId,
      "Management credential must be stored only as a hash",
    );

    const consentResult = await payload.find({
      collection: "consent-records",
      where: { request: { equals: Number(first.requestId) } },
      limit: 5,
      depth: 0,
      overrideAccess: true,
    });
    assert(consentResult.totalDocs === 1, "Exactly one provider-specific consent record is required");
    const consent = consentResult.docs[0];
    assert(
      relationId(consent.recipientProviderOrganisation) === String(organisationA.id),
      "Consent recipient must match the server-derived provider organisation",
    );
    assert(consent.consentVersion === previewA.consentVersion, "Consent version differs from preview");
    assert(consent.optionalNoteAuthorised === true, "Optional-note consent was not persisted");
    assert(
      JSON.stringify(consent.authorisedDataCategories) ===
        JSON.stringify(previewA.authorisedDataCategories),
      "Persisted consent categories must exactly match the signed Sharing Preview",
    );

    const replay = await persistProductionHandoff(
      payload,
      inputA,
      idempotencyKey,
      serverSecret,
      serverConsentVersion,
    );
    assert(replay.idempotentReplay === true, "Exact retry must be identified as a replay");
    assert(replay.requestId === first.requestId, "Exact retry created a different request");
    assert(replay.managementId === first.managementId, "Exact retry returned a different management credential");

    await expectHandoffError(
      () =>
        persistProductionHandoff(
          payload,
          inputA,
          idempotencyKey,
          "rotated-" + serverSecret,
          serverConsentVersion,
        ),
      "management_credential_key_mismatch",
    );

    const requestCount = await payload.count({
      collection: "contact-requests",
      where: { contactDetail: { equals: emailA } },
      overrideAccess: true,
    });
    assert(requestCount.totalDocs === 1, "Idempotent retry created a duplicate ContactRequest");
    const consentCount = await payload.count({
      collection: "consent-records",
      where: { request: { equals: Number(first.requestId) } },
      overrideAccess: true,
    });
    assert(consentCount.totalDocs === 1, "Idempotent retry created duplicate consent evidence");

    await expectHandoffError(
      () =>
        persistProductionHandoff(
          payload,
          {
            ...inputA,
            contact: { type: "email", value: "changed-" + emailA },
          },
          idempotencyKey,
          serverSecret,
          serverConsentVersion,
        ),
      "idempotency_conflict",
    );

    await expectHandoffError(
      () =>
        persistProductionHandoff(
          payload,
          {
            ...inputA,
            previewToken: "a".repeat(43),
          },
          "prod4:" + randomUUID(),
          serverSecret,
          serverConsentVersion,
        ),
      "preview_token_invalid_or_stale",
    );

    await expectHandoffError(
      () =>
        createProductionHandoffPreview(
          payload,
          { ...shareA, serviceId: disabledService.id },
          serverSecret,
          serverConsentVersion,
        ),
      "service_not_enabled_for_handoff",
    );

    await expectHandoffError(
      () =>
        createProductionHandoffPreview(
          payload,
          { ...shareA, serviceId: syntheticService.id },
          serverSecret,
          serverConsentVersion,
        ),
      "synthetic_service_blocked",
    );

    await expectHandoffError(
      () =>
        createProductionHandoffPreview(
          payload,
          {
            ...shareA,
            primarySupportTopic: "education_student",
            secondarySupportTopics: [],
          },
          serverSecret,
          serverConsentVersion,
        ),
      "service_context_mismatch",
    );

    await expectHandoffError(
      () =>
        createProductionHandoffPreview(
          payload,
          {
            ...shareA,
            optionalNote: "This note has no separate consent.",
            optionalNoteAccepted: false,
          },
          serverSecret,
          serverConsentVersion,
        ),
      "optional_note_consent_required",
    );

    await expectHandoffError(
      () =>
        createProductionHandoffPreview(
          payload,
          { ...shareA, preferences: ["arbitrary user text"] },
          serverSecret,
          serverConsentVersion,
        ),
      "unsupported_preferences",
    );

    const shareB: ProductionHandoffPreviewInput = {
      serviceId: serviceB.id,
      contact: { type: "phone", value: "+357 99000000" },
      primarySupportTopic: "education_student",
      secondarySupportTopics: [],
      serviceArea: "nicosia",
      preferences: [],
      optionalNoteAccepted: false,
    };
    const previewB = await createProductionHandoffPreview(payload, shareB, serverSecret, serverConsentVersion);
    const second = await persistProductionHandoff(
      payload,
      {
        ...shareB,
        consentAccepted: true,
        previewToken: previewB.previewToken,
      },
      "prod4:" + randomUUID(),
      serverSecret,
      serverConsentVersion,
    );
    created.requests.push(Number(second.requestId));
    const storedB = await payload.findByID({
      collection: "contact-requests",
      id: Number(second.requestId),
      depth: 0,
      overrideAccess: true,
    });
    assert(
      relationId(storedB.providerOrganisation) === String(organisationB.id),
      "Second service did not route to its own server-derived organisation",
    );

    console.log("Production handoff Sharing Preview, transaction, routing and idempotency checks passed.");
  } catch (error) {
    exitCode = 1;
    console.error(error);
  } finally {
    try {
      if (created.requests.length) {
        const consents = await payload.find({
          collection: "consent-records",
          where: { request: { in: created.requests } },
          limit: 100,
          depth: 0,
          overrideAccess: true,
        });
        for (const consent of consents.docs) {
          await payload.delete({
            collection: "consent-records",
            id: consent.id,
            overrideAccess: true,
          });
        }
      }
      for (const id of created.requests) {
        await payload.delete({ collection: "contact-requests", id, overrideAccess: true });
      }
      for (const id of created.services) {
        await payload.delete({ collection: "services", id, overrideAccess: true });
      }
      for (const id of created.providers) {
        await payload.delete({ collection: "providers", id, overrideAccess: true });
      }
      for (const id of created.organisations) {
        await payload.delete({ collection: "provider-organisations", id, overrideAccess: true });
      }
    } catch (cleanupError) {
      exitCode = 1;
      console.error("PROD-4 CI fixture cleanup failed", cleanupError);
    }
    process.exit(exitCode);
  }
}

void main();
