import { createHash, timingSafeEqual } from "node:crypto";
import type { Payload, Where } from "payload";
import { retentionCutoff, type RetentionPolicy } from "./retention-policy.ts";

type TransactionID = string | number;
type DeletionReason = "user_withdrawal" | "retention";

type RecordLike = Record<string, unknown>;

export type RetentionRunReport = {
  expiredEphemeralSessionsDeleted: number;
  contactRequestsDeleted: number;
  consentRecordsDeleted: number;
  providerAuditEventsDeleted: number;
  anonymousAnalyticsEventsDeleted: number;
};

export type WithdrawalResult = {
  requestDeleted: true;
};

export class DeletionError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DeletionError";
  }
}

function asRecord(value: unknown): RecordLike | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : null;
}

function numericId(value: unknown, field: string): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new DeletionError(400, "invalid_" + field, field + " is invalid");
  }
  return parsed;
}

function normalizePublicRequestId(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new DeletionError(
      404,
      "request_not_found_or_credential_invalid",
      "No manageable request matched the supplied credentials",
    );
  }
  return value;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function hashMatches(storedHash: unknown, presentedSecret: string): boolean {
  if (
    typeof storedHash !== "string" ||
    !/^[a-f0-9]{64}$/.test(storedHash) ||
    !presentedSecret
  ) {
    return false;
  }
  const actual = Buffer.from(sha256(presentedSecret), "utf8");
  const expected = Buffer.from(storedHash, "utf8");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function withTransaction<T>(
  payload: Payload,
  operation: (transactionID: TransactionID) => Promise<T>,
): Promise<T> {
  const transactionID = await payload.db.beginTransaction();
  if (!transactionID) {
    throw new DeletionError(
      503,
      "transaction_unavailable",
      "Deletion transaction is unavailable",
    );
  }
  try {
    const result = await operation(transactionID);
    await payload.db.commitTransaction(transactionID);
    return result;
  } catch (error) {
    try {
      await payload.db.rollbackTransaction(transactionID);
    } catch {
      // Preserve the original failure and fail closed.
    }
    throw error;
  }
}

async function findRequestById(
  payload: Payload,
  requestId: number,
  transactionID?: TransactionID,
): Promise<RecordLike | null> {
  try {
    const request = await payload.findByID({
      collection: "contact-requests",
      id: requestId,
      depth: 0,
      overrideAccess: true,
      ...(transactionID ? { req: { transactionID } } : {}),
    });
    return asRecord(request);
  } catch {
    return null;
  }
}

async function findRequestByPublicId(
  payload: Payload,
  publicRequestId: string,
  transactionID: TransactionID,
): Promise<RecordLike | null> {
  const result = await payload.find({
    collection: "contact-requests",
    where: { publicRequestId: { equals: publicRequestId } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    showHiddenFields: true,
    req: { transactionID },
  });
  return asRecord(result.docs[0]);
}

async function consentRecordsForRequest(
  payload: Payload,
  requestId: number,
  transactionID: TransactionID,
): Promise<RecordLike[]> {
  const result = await payload.find({
    collection: "consent-records",
    where: { request: { equals: requestId } },
    depth: 0,
    limit: 100,
    overrideAccess: true,
    req: { transactionID },
  });
  return result.docs.map((doc) => asRecord(doc)).filter((doc): doc is RecordLike => Boolean(doc));
}

async function deleteRequestPreservingConsentEvidence(
  payload: Payload,
  requestId: number,
  reason: DeletionReason,
  now: Date,
  transactionID: TransactionID,
): Promise<number> {
  const consents = await consentRecordsForRequest(payload, requestId, transactionID);
  if (consents.length === 0) {
    throw new DeletionError(
      500,
      "missing_consent_evidence",
      "Contact request cannot be deleted without its consent evidence",
    );
  }

  for (const consent of consents) {
    const consentId = numericId(consent.id, "consent_id");
    await payload.update({
      collection: "consent-records",
      id: consentId,
      data: {
        requestDeletedAt: now.toISOString(),
        deletionReason: reason,
        ...(reason === "user_withdrawal" ? { withdrawnAt: now.toISOString() } : {}),
      },
      depth: 0,
      overrideAccess: true,
      req: { transactionID },
    });
  }

  await payload.delete({
    collection: "contact-requests",
    id: requestId,
    overrideAccess: true,
    req: { transactionID },
  });
  return consents.length;
}

export async function withdrawProductionRequest(
  payload: Payload,
  publicRequestIdInput: unknown,
  managementId: string,
  now = new Date(),
): Promise<WithdrawalResult> {
  const publicRequestId = normalizePublicRequestId(publicRequestIdInput);
  if (
    typeof managementId !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(managementId)
  ) {
    throw new DeletionError(
      404,
      "request_not_found_or_credential_invalid",
      "No manageable request matched the supplied credentials",
    );
  }

  return withTransaction(payload, async (transactionID) => {
    const request = await findRequestByPublicId(payload, publicRequestId, transactionID);
    if (!request || !hashMatches(request.managementTokenHash, managementId)) {
      throw new DeletionError(
        404,
        "request_not_found_or_credential_invalid",
        "No manageable request matched the supplied credentials",
      );
    }

    const requestId = numericId(request.id, "request_id");
    await deleteRequestPreservingConsentEvidence(
      payload,
      requestId,
      "user_withdrawal",
      now,
      transactionID,
    );
    return { requestDeleted: true };
  });
}

async function deleteMatchingDocuments(
  payload: Payload,
  collection: "ephemeral-sessions" | "consent-records" | "provider-audit-events" | "anonymous-analytics-events",
  where: Where,
): Promise<number> {
  let deleted = 0;
  while (true) {
    const result = await payload.find({
      collection,
      where,
      depth: 0,
      limit: 100,
      page: 1,
      overrideAccess: true,
    });
    if (result.docs.length === 0) return deleted;
    for (const doc of result.docs) {
      const id = numericId((doc as unknown as RecordLike).id, "document_id");
      await payload.delete({ collection, id, overrideAccess: true });
      deleted += 1;
    }
  }
}

async function purgeClosedContactRequests(
  payload: Payload,
  cutoff: Date,
  now: Date,
): Promise<number> {
  let deleted = 0;
  while (true) {
    const result = await payload.find({
      collection: "contact-requests",
      where: {
        and: [
          { status: { equals: "closed" } },
          { closedAt: { less_than_equal: cutoff.toISOString() } },
        ],
      },
      depth: 0,
      limit: 100,
      page: 1,
      sort: "closedAt",
      overrideAccess: true,
    });
    if (result.docs.length === 0) return deleted;

    for (const doc of result.docs) {
      const requestId = numericId((doc as unknown as RecordLike).id, "request_id");
      await withTransaction(payload, async (transactionID) => {
        const current = await findRequestById(payload, requestId, transactionID);
        if (!current || current.status !== "closed") return;
        const closedAt =
          typeof current.closedAt === "string" ? new Date(current.closedAt) : null;
        if (!closedAt || Number.isNaN(closedAt.getTime()) || closedAt > cutoff) return;
        await deleteRequestPreservingConsentEvidence(
          payload,
          requestId,
          "retention",
          now,
          transactionID,
        );
        deleted += 1;
      });
    }
  }
}

export async function runRetentionAutomation(
  payload: Payload,
  policy: RetentionPolicy,
  now = new Date(),
): Promise<RetentionRunReport> {
  const expiredEphemeralSessionsDeleted = await deleteMatchingDocuments(
    payload,
    "ephemeral-sessions",
    { expiresAt: { less_than_equal: now.toISOString() } },
  );

  const contactRequestsDeleted = await purgeClosedContactRequests(
    payload,
    retentionCutoff(now, policy.contactRequestDays),
    now,
  );

  const consentRecordsDeleted = await deleteMatchingDocuments(
    payload,
    "consent-records",
    {
      requestDeletedAt: {
        less_than_equal: retentionCutoff(now, policy.consentRecordDays).toISOString(),
      },
    },
  );

  const providerAuditEventsDeleted = await deleteMatchingDocuments(
    payload,
    "provider-audit-events",
    {
      occurredAt: {
        less_than_equal: retentionCutoff(now, policy.providerAuditDays).toISOString(),
      },
    },
  );

  const anonymousAnalyticsEventsDeleted = await deleteMatchingDocuments(
    payload,
    "anonymous-analytics-events",
    {
      createdAt: {
        less_than_equal: retentionCutoff(now, policy.anonymousAnalyticsDays).toISOString(),
      },
    },
  );

  return {
    expiredEphemeralSessionsDeleted,
    contactRequestsDeleted,
    consentRecordsDeleted,
    providerAuditEventsDeleted,
    anonymousAnalyticsEventsDeleted,
  };
}
