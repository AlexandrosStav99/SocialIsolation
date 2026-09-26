import { createHash, randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../payload.config.ts";
import {
  createProductionHandoffPreview,
  persistProductionHandoff,
  ProductionHandoffError,
  type ProductionHandoffPreviewInput,
} from "../lib/handoff/production-persistence.ts";
import {
  DeletionError,
  runRetentionAutomation,
  withdrawProductionRequest,
} from "../lib/privacy/retention-executor.ts";
import type { RetentionPolicy } from "../lib/privacy/retention-policy.ts";

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

async function exists(collection: "consent-records" | "ephemeral-sessions" | "provider-audit-events" | "anonymous-analytics-events", id: string | number) {
  try {
    await payload.findByID({ collection, id, depth: 0, overrideAccess: true });
    return true;
  } catch {
    return false;
  }
}

async function findRequestByPublicId(publicRequestId: string) {
  const result = await payload.find({
    collection: "contact-requests",
    where: { publicRequestId: { equals: publicRequestId } },
    limit: 2,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  });
  return result.totalDocs === 1 ? result.docs[0] : null;
}

async function contactRequestExists(publicRequestId: string) {
  return Boolean(await findRequestByPublicId(publicRequestId));
}

async function expectDeletionError(operation: () => Promise<unknown>, code: string) {
  try {
    await operation();
  } catch (error) {
    assert(error instanceof DeletionError, "Expected DeletionError for " + code);
    assert(error.code === code, "Expected " + code + ", received " + error.code);
    return;
  }
  throw new Error("Expected deletion error " + code);
}

async function expectHandoffError(operation: () => Promise<unknown>, code: string) {
  try {
    await operation();
  } catch (error) {
    assert(error instanceof ProductionHandoffError, "Expected ProductionHandoffError for " + code);
    assert(error.code === code, "Expected " + code + ", received " + error.code);
    return;
  }
  throw new Error("Expected handoff error " + code);
}

const payload = await getPayload({ config });
const suffix = randomUUID();
const baseNow = new Date();
const plusDays = (days: number) => new Date(baseNow.getTime() + days * 24 * 60 * 60 * 1000);
const policy: RetentionPolicy = {
  contactRequestDays: 30,
  consentRecordDays: 30,
  providerAuditDays: 30,
  anonymousAnalyticsDays: 30,
};

const created = {
  organisations: [] as Array<string | number>,
  providers: [] as Array<string | number>,
  services: [] as Array<string | number>,
  requests: [] as Array<string | number>,
  consents: [] as Array<string | number>,
  sessions: [] as Array<string | number>,
  audits: [] as Array<string | number>,
  analytics: [] as Array<string | number>,
};

let exitCode = 0;

try {
  const organisation = await payload.create({
    collection: "provider-organisations",
    data: { name: "PROD-5 CI Organisation " + suffix },
    overrideAccess: true,
  });
  created.organisations.push(organisation.id);

  const provider = await payload.create({
    collection: "providers",
    data: {
      organisation: organisation.id,
      name: "PROD-5 CI Provider " + suffix,
      providerType: "ngo_nonprofit",
      informationSource: "Controlled PROD-5 CI fixture - not a real provider",
      informationCheckedAt: baseNow.toISOString(),
    },
    overrideAccess: true,
  });
  created.providers.push(provider.id);

  const service = await payload.create({
    collection: "services",
    data: {
      provider: provider.id,
      name: "PROD-5 CI Service " + suffix,
      topics: ["social_connection"],
      coverage: ["online"],
      languages: ["en"],
      deliveryModes: ["online"],
      eligibility: ["Controlled CI fixture"],
      contactChannels: ["prod5@example.invalid"],
      availability: "Controlled CI fixture",
      immediateSupportCapable: false,
      integrated: true,
      productionHandoffEnabled: true,
      productionHandoffProvider: provider.id,
      productionHandoffOrganisation: organisation.id,
      informationSource: "Controlled PROD-5 CI fixture - not a real provider",
      informationCheckedAt: baseNow.toISOString(),
    },
    overrideAccess: true,
  });
  created.services.push(service.id);

  const handoffSecret = "prod5-ci-handoff-secret-" + suffix;
  const consentVersion = "prod5-ci-v1";

  async function createRequest(label: string) {
    const share: ProductionHandoffPreviewInput = {
      serviceId: service.id,
      contact: { type: "email", value: "prod5-" + label + "-" + suffix + "@example.invalid" },
      primarySupportTopic: "social_connection",
      secondarySupportTopics: [],
      serviceArea: "online",
      preferences: [],
      optionalNoteAccepted: false,
    };
    const preview = await createProductionHandoffPreview(
      payload,
      share,
      handoffSecret,
      consentVersion,
    );
    const idempotencyKey = "prod5:" + randomUUID();
    const finalInput = { ...share, consentAccepted: true, previewToken: preview.previewToken };
    const result = await persistProductionHandoff(
      payload,
      finalInput,
      idempotencyKey,
      handoffSecret,
      consentVersion,
    );
    assert(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.requestId),
      "Public request identifier must be a random UUID",
    );
    const storedRequest = await findRequestByPublicId(result.requestId);
    assert(storedRequest, "Stored ContactRequest not found by public request identifier");
    created.requests.push(storedRequest.id);
    const consent = await payload.find({
      collection: "consent-records",
      where: { request: { equals: storedRequest.id } },
      limit: 2,
      depth: 0,
      overrideAccess: true,
    });
    assert(consent.totalDocs === 1, "Expected one consent record for " + label);
    created.consents.push(consent.docs[0].id);
    return {
      ...result,
      internalId: storedRequest.id,
      consentId: consent.docs[0].id,
      idempotencyKey,
      finalInput,
    };
  }

  const withdrawalRequest = await createRequest("withdraw");
  await expectDeletionError(
    () =>
      withdrawProductionRequest(
        payload,
        withdrawalRequest.requestId,
        "a".repeat(43),
        baseNow,
      ),
    "request_not_found_or_credential_invalid",
  );
  assert(
    await contactRequestExists(withdrawalRequest.requestId),
    "Invalid management credential deleted a request",
  );

  await expectDeletionError(
    () =>
      withdrawProductionRequest(
        payload,
        randomUUID(),
        withdrawalRequest.managementId,
        baseNow,
      ),
    "request_not_found_or_credential_invalid",
  );

  const withdrawal = await withdrawProductionRequest(
    payload,
    withdrawalRequest.requestId,
    withdrawalRequest.managementId,
    baseNow,
  );
  assert(withdrawal.requestDeleted, "Valid withdrawal did not delete the request");
  assert(
    !(await contactRequestExists(withdrawalRequest.requestId)),
    "Withdrawn request still exists",
  );
  const preservedConsent = await payload.findByID({
    collection: "consent-records",
    id: withdrawalRequest.consentId,
    depth: 0,
    overrideAccess: true,
  });
  assert(relationId(preservedConsent.request) === null, "Deleted request link was not cleared");
  assert(preservedConsent.deletionReason === "user_withdrawal", "Withdrawal reason missing");
  assert(typeof preservedConsent.withdrawnAt === "string", "withdrawnAt missing");
  assert(typeof preservedConsent.requestDeletedAt === "string", "requestDeletedAt missing");
  assert(
    preservedConsent.deletedRequestPublicId === withdrawalRequest.requestId,
    "Deletion tombstone did not preserve the opaque public request identifier",
  );
  assert(
    preservedConsent.deletedManagementTokenHash ===
      createHash("sha256").update(withdrawalRequest.managementId).digest("hex"),
    "Deletion tombstone management hash is missing or invalid",
  );
  assert(
    typeof preservedConsent.deletedIdempotencyKeyHash === "string" &&
      /^[a-f0-9]{64}$/.test(preservedConsent.deletedIdempotencyKeyHash),
    "Deletion tombstone idempotency-key hash is missing",
  );
  assert(
    typeof preservedConsent.deletedIdempotencyPayloadHash === "string" &&
      /^[a-f0-9]{64}$/.test(preservedConsent.deletedIdempotencyPayloadHash),
    "Deletion tombstone payload hash is missing",
  );
  assert(
    !JSON.stringify(preservedConsent).includes(withdrawalRequest.managementId),
    "Management credential leaked into preserved consent evidence",
  );

  const repeatedWithdrawal = await withdrawProductionRequest(
    payload,
    withdrawalRequest.requestId,
    withdrawalRequest.managementId,
    baseNow,
  );
  assert(repeatedWithdrawal.requestDeleted, "Repeated withdrawal must remain idempotently successful");

  await expectHandoffError(
    () =>
      persistProductionHandoff(
        payload,
        withdrawalRequest.finalInput,
        withdrawalRequest.idempotencyKey,
        handoffSecret,
        consentVersion,
      ),
    "handoff_previously_deleted",
  );

  const retentionRequest = await createRequest("retention");
  await payload.update({
    collection: "contact-requests",
    id: retentionRequest.internalId,
    data: { status: "closed", closedAt: baseNow.toISOString() },
    overrideAccess: true,
  });

  const activeRequest = await createRequest("active");

  const expiredSession = await payload.create({
    collection: "ephemeral-sessions",
    data: {
      sessionId: "prod5-expired-" + suffix,
      stage: "complete",
      secondarySupportTopics: [],
      preferences: [],
      candidateSignals: [],
      expiresAt: new Date(baseNow.getTime() - 60_000).toISOString(),
    },
    overrideAccess: true,
  });
  const futureSession = await payload.create({
    collection: "ephemeral-sessions",
    data: {
      sessionId: "prod5-future-" + suffix,
      stage: "review",
      secondarySupportTopics: [],
      preferences: [],
      candidateSignals: [],
      expiresAt: plusDays(100).toISOString(),
    },
    overrideAccess: true,
  });
  created.sessions.push(expiredSession.id, futureSession.id);

  const oldAudit = await payload.create({
    collection: "provider-audit-events",
    data: {
      actorUserId: "prod5-ci-actor",
      organisationId: String(organisation.id),
      requestId: String(retentionRequest.internalId),
      eventType: "status_changed",
      occurredAt: baseNow.toISOString(),
    },
    overrideAccess: true,
  });
  const futureAudit = await payload.create({
    collection: "provider-audit-events",
    data: {
      actorUserId: "prod5-ci-actor",
      organisationId: String(organisation.id),
      requestId: String(activeRequest.internalId),
      eventType: "request_viewed",
      occurredAt: plusDays(100).toISOString(),
    },
    overrideAccess: true,
  });
  created.audits.push(oldAudit.id, futureAudit.id);

  const analytics = await payload.create({
    collection: "anonymous-analytics-events",
    data: {
      primarySupportTopic: "social_connection",
      secondarySupportTopics: [],
      serviceArea: "online",
      interactionOutcome: "prod5_ci",
      servicesShownCount: 1,
      selfServiceSelected: false,
      assistedContactSelected: true,
      noMatch: false,
      taxonomyVersion: "1",
    },
    overrideAccess: true,
  });
  created.analytics.push(analytics.id);

  const early = await runRetentionAutomation(payload, policy, plusDays(10));
  assert(early.expiredEphemeralSessionsDeleted === 1, "Expired session was not purged");
  assert(early.contactRequestsDeleted === 0, "Closed request was deleted before policy cutoff");
  assert(early.consentRecordsDeleted === 0, "Consent evidence was deleted before policy cutoff");
  assert(early.providerAuditEventsDeleted === 0, "Audit event was deleted before policy cutoff");
  assert(early.anonymousAnalyticsEventsDeleted === 0, "Analytics event was deleted before policy cutoff");
  assert(await exists("ephemeral-sessions", futureSession.id), "Future session was deleted early");
  assert(await contactRequestExists(retentionRequest.requestId), "Closed request was deleted early");
  assert(await contactRequestExists(activeRequest.requestId), "Active request was deleted early");

  const late = await runRetentionAutomation(payload, policy, plusDays(31));
  assert(late.contactRequestsDeleted === 1, "Eligible closed request was not deleted");
  assert(late.consentRecordsDeleted === 1, "Old orphan consent evidence was not deleted");
  assert(late.providerAuditEventsDeleted === 1, "Old provider audit event was not deleted");
  assert(late.anonymousAnalyticsEventsDeleted === 1, "Old anonymous analytics event was not deleted");

  assert(
    !(await contactRequestExists(retentionRequest.requestId)),
    "Retention-eligible closed request still exists",
  );
  assert(
    await contactRequestExists(activeRequest.requestId),
    "Retention automation deleted an active request",
  );
  assert(await exists("ephemeral-sessions", futureSession.id), "Future session was deleted");
  assert(await exists("provider-audit-events", futureAudit.id), "Future audit event was deleted");

  const retentionConsent = await payload.findByID({
    collection: "consent-records",
    id: retentionRequest.consentId,
    depth: 0,
    overrideAccess: true,
  });
  assert(relationId(retentionConsent.request) === null, "Retention deletion did not clear request link");
  assert(retentionConsent.deletionReason === "retention", "Retention deletion reason missing");
  assert(
    typeof retentionConsent.requestDeletedAt === "string",
    "Retention requestDeletedAt evidence missing",
  );
  assert(!retentionConsent.withdrawnAt, "Retention deletion must not be recorded as consent withdrawal");

  assert(
    !(await exists("consent-records", withdrawalRequest.consentId)),
    "Old withdrawal consent evidence was not purged after its configured retention",
  );

  console.log("Production retention and deletion PostgreSQL checks passed.");
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  async function safeDelete(
    collection: "consent-records" | "contact-requests" | "ephemeral-sessions" | "provider-audit-events" | "anonymous-analytics-events" | "services" | "providers" | "provider-organisations",
    id: string | number,
  ) {
    try {
      await payload.delete({ collection, id, overrideAccess: true });
    } catch {
      // Fixture may already have been removed by the retention run.
    }
  }

  for (const id of created.consents) await safeDelete("consent-records", id);
  for (const id of created.requests) await safeDelete("contact-requests", id);
  for (const id of created.sessions) await safeDelete("ephemeral-sessions", id);
  for (const id of created.audits) await safeDelete("provider-audit-events", id);
  for (const id of created.analytics) await safeDelete("anonymous-analytics-events", id);
  for (const id of created.services) await safeDelete("services", id);
  for (const id of created.providers) await safeDelete("providers", id);
  for (const id of created.organisations) await safeDelete("provider-organisations", id);

  process.exit(exitCode);
}
