import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import {
  exportProductionRequestData,
  withdrawProductionRequest,
} from "../lib/privacy/retention-executor.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

async function main() {
  const payload = await getPayload({ config });
  const suffix = randomUUID();
  const managementId = randomBytes(32).toString("base64url");
  const publicRequestId = randomUUID();
  const created: {
    organisation?: string | number;
    provider?: string | number;
    service?: string | number;
    request?: string | number;
    consent?: string | number;
  } = {};
  let exitCode = 0;

  try {
    const organisation = await payload.create({
      collection: "provider-organisations",
      data: { name: "PROD-12 CI Organisation " + suffix },
      overrideAccess: true,
    });
    created.organisation = organisation.id;

    const provider = await payload.create({
      collection: "providers",
      data: {
        organisation: organisation.id,
        name: "PROD-12 CI Provider " + suffix,
        providerType: "ngo_nonprofit",
        informationSource: "CI-only privacy fixture; not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    created.provider = provider.id;

    const service = await payload.create({
      collection: "services",
      data: {
        provider: provider.id,
        name: "PROD-12 CI Service " + suffix,
        topics: ["social_connection"],
        coverage: ["online"],
        languages: ["en"],
        deliveryModes: ["online"],
        eligibility: ["CI only"],
        contactChannels: ["prod12@example.invalid"],
        immediateSupportCapable: false,
        integrated: false,
        productionHandoffEnabled: false,
        informationSource: "CI-only privacy fixture; not a real provider",
        informationCheckedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    created.service = service.id;

    const request = await payload.create({
      collection: "contact-requests",
      data: {
        publicRequestId,
        providerOrganisation: organisation.id,
        service: service.id,
        preferredName: "CI Person",
        contactType: "email",
        contactDetail: "prod12-user@example.invalid",
        primarySupportTopic: "social_connection",
        secondarySupportTopics: ["family_relationships"],
        serviceArea: "online",
        preferences: [],
        structuredSupportSummary: "CI-only structured summary",
        optionalNote: "CI-only authorised note",
        status: "new",
        managementTokenHash: sha256(managementId),
      },
      overrideAccess: true,
    });
    created.request = request.id;

    const consent = await payload.create({
      collection: "consent-records",
      data: {
        request: request.id,
        consentVersion: "ci-consent-v1",
        recipientProviderOrganisation: organisation.id,
        authorisedDataCategories: [
          "contact",
          "support_topics",
          "service_area_preferences",
          "structured_support_summary",
          "optional_note",
        ],
        optionalNoteAuthorised: true,
        consentedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    });
    created.consent = consent.id;

    try {
      await exportProductionRequestData(payload, publicRequestId, randomBytes(32).toString("base64url"));
      throw new Error("Wrong management credential unexpectedly exported request data");
    } catch (error) {
      assert(error instanceof Error, "Expected wrong-credential Error");
      assert(
        "code" in error &&
          (error as { code?: unknown }).code === "request_not_found_or_credential_invalid",
        "Wrong credential must use generic anti-enumeration error",
      );
    }

    const activeCopy = await exportProductionRequestData(payload, publicRequestId, managementId);
    assert(activeCopy.requestDeleted === false, "Active request copy incorrectly marked deleted");
    assert(activeCopy.request?.contact.value === "prod12-user@example.invalid", "Contact detail missing from authorized copy");
    assert(activeCopy.request?.optionalNote === "CI-only authorised note", "Authorized optional note missing");
    assert(activeCopy.request?.serviceName?.startsWith("PROD-12 CI Service"), "Service name missing");
    assert(activeCopy.request?.recipientOrganisationName?.startsWith("PROD-12 CI Organisation"), "Recipient name missing");
    assert(activeCopy.consent.length === 1, "Consent evidence missing");
    assert(activeCopy.scope.anonymousExplorationLinked === false, "Request copy must not link anonymous exploration");
    assert(activeCopy.scope.anonymousAnalyticsLinked === false, "Request copy must not link anonymous analytics");

    const serializedActive = JSON.stringify(activeCopy);
    for (const forbidden of [
      "managementTokenHash",
      "managementTokenEnvelope",
      "idempotencyKeyHash",
      "idempotencyPayloadHash",
      "temporaryFreeText",
      "sessionId",
      "actorUserId",
    ]) {
      assert(!serializedActive.includes(forbidden), "Request copy exposed internal field: " + forbidden);
    }

    await withdrawProductionRequest(payload, publicRequestId, managementId);
    created.request = undefined;

    const deletedCopy = await exportProductionRequestData(payload, publicRequestId, managementId);
    assert(deletedCopy.requestDeleted === true, "Deleted request copy did not report deletion");
    assert(!deletedCopy.request, "Deleted request copy must not reconstruct deleted contact data");
    assert(deletedCopy.consent.length === 1, "Deletion consent evidence missing");
    assert(deletedCopy.consent[0].deletionReason === "user_withdrawal", "Deletion reason missing");
    assert(Boolean(deletedCopy.consent[0].requestDeletedAt), "Deletion timestamp missing");
    assert(!JSON.stringify(deletedCopy).includes("prod12-user@example.invalid"), "Deleted contact detail was reconstructed");

    console.log("Production self-service request access/deletion persistence checks passed.");
  } catch (error) {
    exitCode = 1;
    console.error(error);
  } finally {
    try {
      if (created.consent !== undefined) {
        await payload.delete({ collection: "consent-records", id: created.consent, overrideAccess: true });
      }
      if (created.request !== undefined) {
        await payload.delete({ collection: "contact-requests", id: created.request, overrideAccess: true });
      }
      if (created.service !== undefined) {
        await payload.delete({ collection: "services", id: created.service, overrideAccess: true });
      }
      if (created.provider !== undefined) {
        await payload.delete({ collection: "providers", id: created.provider, overrideAccess: true });
      }
      if (created.organisation !== undefined) {
        await payload.delete({ collection: "provider-organisations", id: created.organisation, overrideAccess: true });
      }
    } catch (cleanupError) {
      exitCode = 1;
      console.error("PROD-12 CI fixture cleanup failed", cleanupError);
    }
    process.exit(exitCode);
  }
}

void main();
