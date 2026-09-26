import type { Payload, Where } from "payload";
import type { AuthenticatedActor } from "./auth.ts";
import { ProviderWorkspaceError } from "./payload-auth.ts";
import {
  assertRequestCanBeAssigned,
  assertRequestStatusTransition,
  requestStatuses,
  type RequestStatus,
} from "./workflow.ts";

const PROVIDER_ROLES = new Set(["provider_manager", "provider_staff"]);

type RecordLike = Record<string, unknown>;
type TransactionID = string | number;

export type ProviderQueueItem = {
  id: string;
  serviceId: string | null;
  status: RequestStatus;
  primarySupportTopic: string;
  serviceArea?: string;
  assignedProviderUserId?: string;
  createdAt?: string;
};

export type ProviderRequestDetail = ProviderQueueItem & {
  preferredName?: string;
  contactType: "email" | "phone";
  contactDetail: string;
  secondarySupportTopics: string[];
  preferences: string[];
  structuredSupportSummary: string;
  optionalNote?: string;
};

export type ProviderQueuePage = {
  items: ProviderQueueItem[];
  page: number;
  totalPages: number;
  totalDocs: number;
};

function asRecord(value: unknown): RecordLike | null {
  return value && typeof value === "object" ? (value as RecordLike) : null;
}

function relationshipId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const record = asRecord(value);
  const id = record?.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : null;
}

function relationshipFilterId(value: string): string | number {
  return /^\d+$/.test(value) ? Number(value) : value;
}

function numericRelationshipId(value: string): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ProviderWorkspaceError(500, "invalid_relationship_id", "Stored provider relationship is invalid");
  }
  return id;
}

function requiredString(record: RecordLike, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || !value) {
    throw new ProviderWorkspaceError(500, "invalid_request_record", "Stored provider request is invalid");
  }
  return value;
}

function optionalString(record: RecordLike, field: string): string | undefined {
  const value = record[field];
  return typeof value === "string" && value ? value : undefined;
}

function stringArray(record: RecordLike, field: string): string[] {
  const value = record[field];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function requestStatus(record: RecordLike): RequestStatus {
  const value = record.status;
  if (typeof value !== "string" || !requestStatuses.includes(value as RequestStatus)) {
    throw new ProviderWorkspaceError(500, "invalid_request_status", "Stored provider request has an invalid status");
  }
  return value as RequestStatus;
}

function queueItem(record: RecordLike): ProviderQueueItem {
  const id = relationshipId(record.id);
  if (!id) throw new ProviderWorkspaceError(500, "invalid_request_record", "Stored provider request is invalid");
  const serviceArea = optionalString(record, "serviceArea");
  const assignedProviderUserId = relationshipId(record.assignedProviderUser);
  const createdAt = optionalString(record, "createdAt");
  return {
    id,
    serviceId: relationshipId(record.service),
    status: requestStatus(record),
    primarySupportTopic: requiredString(record, "primarySupportTopic"),
    ...(serviceArea ? { serviceArea } : {}),
    ...(assignedProviderUserId ? { assignedProviderUserId } : {}),
    ...(createdAt ? { createdAt } : {}),
  };
}

function requestDetail(record: RecordLike): ProviderRequestDetail {
  const item = queueItem(record);
  const contactType = record.contactType;
  if (contactType !== "email" && contactType !== "phone") {
    throw new ProviderWorkspaceError(500, "invalid_request_record", "Stored provider request is invalid");
  }
  const preferredName = optionalString(record, "preferredName");
  const optionalNote = optionalString(record, "optionalNote");
  return {
    ...item,
    ...(preferredName ? { preferredName } : {}),
    contactType,
    contactDetail: requiredString(record, "contactDetail"),
    secondarySupportTopics: stringArray(record, "secondarySupportTopics"),
    preferences: stringArray(record, "preferences"),
    structuredSupportSummary: requiredString(record, "structuredSupportSummary"),
    ...(optionalNote ? { optionalNote } : {}),
  };
}

function requestWhere(actor: AuthenticatedActor, requestId?: string): Where {
  const organisationId = relationshipFilterId(actor.organisationId!);
  const clauses: Where[] = [{ providerOrganisation: { equals: organisationId } }];
  if (requestId) clauses.push({ id: { equals: relationshipFilterId(requestId) } });
  if (actor.role === "provider_staff") {
    clauses.push({ assignedProviderUser: { equals: relationshipFilterId(actor.userId) } });
  }
  return { and: clauses };
}

async function findRequest(
  payload: Payload,
  actor: AuthenticatedActor,
  requestId: string,
  transactionID?: TransactionID,
): Promise<RecordLike> {
  const result = await payload.find({
    collection: "contact-requests",
    where: requestWhere(actor, requestId),
    depth: 0,
    limit: 1,
    overrideAccess: true,
    ...(transactionID ? { req: { transactionID } } : {}),
  });
  const record = asRecord(result.docs[0]);
  if (!record) {
    throw new ProviderWorkspaceError(404, "provider_request_not_found", "Provider request not found");
  }
  return record;
}

async function createAuditEvent(
  payload: Payload,
  actor: AuthenticatedActor,
  requestId: string,
  eventType: "request_viewed" | "request_assigned" | "status_changed",
  transactionID?: TransactionID,
): Promise<void> {
  await payload.create({
    collection: "provider-audit-events",
    data: {
      actorUserId: actor.userId,
      organisationId: actor.organisationId,
      requestId,
      eventType,
      occurredAt: new Date().toISOString(),
    },
    overrideAccess: true,
    ...(transactionID ? { req: { transactionID } } : {}),
  });
}

async function withTransaction<T>(
  payload: Payload,
  operation: (transactionID: TransactionID) => Promise<T>,
): Promise<T> {
  const transactionID = await payload.db.beginTransaction();
  if (!transactionID) {
    throw new ProviderWorkspaceError(503, "transaction_unavailable", "Provider workspace transaction unavailable");
  }
  try {
    const result = await operation(transactionID);
    await payload.db.commitTransaction(transactionID);
    return result;
  } catch (error) {
    try {
      await payload.db.rollbackTransaction(transactionID);
    } catch {
      // Preserve the original failure. The caller still fails closed.
    }
    throw error;
  }
}

export async function listProviderRequests(
  payload: Payload,
  actor: AuthenticatedActor,
  page = 1,
  limit = 25,
): Promise<ProviderQueuePage> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 25;
  const result = await payload.find({
    collection: "contact-requests",
    where: requestWhere(actor),
    depth: 0,
    page: safePage,
    limit: safeLimit,
    sort: "-createdAt",
    overrideAccess: true,
  });
  return {
    items: result.docs.map((doc) => queueItem(doc as unknown as RecordLike)),
    page: result.page ?? safePage,
    totalPages: result.totalPages,
    totalDocs: result.totalDocs,
  };
}

export async function getProviderRequestDetail(
  payload: Payload,
  actor: AuthenticatedActor,
  requestId: string,
): Promise<ProviderRequestDetail> {
  const record = await findRequest(payload, actor, requestId);
  const id = relationshipId(record.id);
  if (!id) throw new ProviderWorkspaceError(500, "invalid_request_record", "Stored provider request is invalid");

  // Identifiable content is not returned unless the access itself is auditable.
  await createAuditEvent(payload, actor, id, "request_viewed");
  return requestDetail(record);
}

async function findEligibleAssignee(
  payload: Payload,
  actor: AuthenticatedActor,
  assigneeUserId: string,
  transactionID: TransactionID,
): Promise<RecordLike> {
  const result = await payload.find({
    collection: "provider-users",
    where: {
      and: [
        { id: { equals: relationshipFilterId(assigneeUserId) } },
        { organisation: { equals: relationshipFilterId(actor.organisationId!) } },
        { active: { equals: true } },
        { role: { in: [...PROVIDER_ROLES] } },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req: { transactionID },
  });
  const assignee = asRecord(result.docs[0]);
  if (!assignee) {
    throw new ProviderWorkspaceError(
      400,
      "invalid_assignee",
      "Assignee must be an active provider user in the same organisation",
    );
  }
  return assignee;
}

export async function assignProviderRequest(
  payload: Payload,
  actor: AuthenticatedActor,
  requestId: string,
  assigneeUserId: string,
): Promise<ProviderQueueItem> {
  if (actor.role !== "provider_manager") {
    throw new ProviderWorkspaceError(403, "assignment_denied", "Only provider managers can assign requests");
  }

  return withTransaction(payload, async (transactionID) => {
    const request = await findRequest(payload, actor, requestId, transactionID);
    try {
      assertRequestCanBeAssigned(requestStatus(request));
    } catch (error) {
      throw new ProviderWorkspaceError(409, "request_not_assignable", (error as Error).message);
    }
    const assignee = await findEligibleAssignee(payload, actor, assigneeUserId, transactionID);
    const id = relationshipId(request.id)!;
    const assigneeId = relationshipId(assignee.id)!;

    const updated = await payload.update({
      collection: "contact-requests",
      id: relationshipFilterId(id),
      data: {
        assignedProviderUser: numericRelationshipId(assigneeId),
        status: "assigned",
      },
      depth: 0,
      overrideAccess: true,
      req: { transactionID },
    });
    await createAuditEvent(payload, actor, id, "request_assigned", transactionID);
    return queueItem(updated as unknown as RecordLike);
  });
}

export async function transitionProviderRequest(
  payload: Payload,
  actor: AuthenticatedActor,
  requestId: string,
  nextStatus: RequestStatus,
): Promise<ProviderQueueItem> {
  if (nextStatus === "assigned") {
    throw new ProviderWorkspaceError(400, "assignment_action_required", "Use the assignment action to assign a request");
  }

  return withTransaction(payload, async (transactionID) => {
    const request = await findRequest(payload, actor, requestId, transactionID);
    try {
      assertRequestStatusTransition(requestStatus(request), nextStatus);
    } catch (error) {
      throw new ProviderWorkspaceError(409, "invalid_status_transition", (error as Error).message);
    }
    const id = relationshipId(request.id)!;
    const updated = await payload.update({
      collection: "contact-requests",
      id: relationshipFilterId(id),
      data: {
        status: nextStatus,
        ...(nextStatus === "closed" ? { closedAt: new Date().toISOString() } : {}),
      },
      depth: 0,
      overrideAccess: true,
      req: { transactionID },
    });
    await createAuditEvent(payload, actor, id, "status_changed", transactionID);
    return queueItem(updated as unknown as RecordLike);
  });
}
