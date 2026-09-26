import { createHash, createHmac } from "node:crypto";
import type { Payload } from "payload";
import { SYNTHETIC_DIRECTORY_SOURCE } from "../directory/synthetic.ts";
import {
  serviceAreas,
  supportTopics,
  type ServiceArea,
  type SupportTopic,
} from "../domain/data-boundaries.ts";

type TransactionID = string | number;
type RecordLike = Record<string, unknown>;

const MAX_PREFERENCES = 10;
const MAX_PREFERENCE_LENGTH = 80;
const MAX_CONSENT_VERSION_LENGTH = 100;
const IDEMPOTENCY_KEY_MIN_LENGTH = 32;
const IDEMPOTENCY_KEY_MAX_LENGTH = 128;

const supportTopicLabels: Record<SupportTopic, string> = {
  social_connection: "Loneliness & Social Connection",
  emotional_wellbeing: "Emotional & Mental Wellbeing",
  family_relationships: "Family & Relationships",
  work_unemployment: "Work & Unemployment",
  financial_basic_needs: "Financial & Basic Needs",
  housing_living: "Housing & Living Situation",
  personal_safety: "Abuse, Violence & Personal Safety",
  education_student: "Education & Student Support",
  other_unsure: "Something else / I’m not sure",
};

const serviceAreaLabels: Record<ServiceArea, string> = {
  nicosia: "Nicosia",
  limassol: "Limassol",
  larnaca: "Larnaca",
  paphos: "Paphos",
  famagusta: "Famagusta",
  anywhere_cyprus: "Anywhere in Cyprus",
  online: "Online",
};

export class ProductionHandoffError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ProductionHandoffError";
  }
}

export type ProductionHandoffInput = {
  serviceId: string | number;
  preferredName?: string;
  contact: {
    type: "email" | "phone";
    value: string;
  };
  primarySupportTopic: SupportTopic;
  secondarySupportTopics?: SupportTopic[];
  serviceArea: ServiceArea;
  preferences?: string[];
  optionalNote?: string;
  consentAccepted: boolean;
  consentVersion: string;
  optionalNoteAccepted: boolean;
};

type NormalizedProductionHandoffInput = {
  serviceId: number;
  preferredName?: string;
  contact: {
    type: "email" | "phone";
    value: string;
  };
  primarySupportTopic: SupportTopic;
  secondarySupportTopics: SupportTopic[];
  serviceArea: ServiceArea;
  preferences: string[];
  optionalNote?: string;
  consentVersion: string;
  optionalNoteAccepted: boolean;
};

export type ProductionHandoffResult = {
  requestId: string;
  managementId: string;
  idempotentReplay: boolean;
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

function numericRelationshipId(value: unknown, field: string): number {
  const raw = relationshipId(value);
  const parsed = raw ? Number(raw) : Number.NaN;
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ProductionHandoffError(503, "invalid_directory_relationship", field + " is invalid");
  }
  return parsed;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeIdempotencyKey(raw: string): string {
  const value = raw.trim();
  if (
    value.length < IDEMPOTENCY_KEY_MIN_LENGTH ||
    value.length > IDEMPOTENCY_KEY_MAX_LENGTH ||
    !/^[A-Za-z0-9._:-]+$/.test(value)
  ) {
    throw new ProductionHandoffError(
      400,
      "invalid_idempotency_key",
      "Idempotency-Key must be 32-128 characters using letters, numbers, dot, underscore, colon or hyphen",
    );
  }
  return value;
}

function normalizeServiceId(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ProductionHandoffError(400, "invalid_service", "A valid service is required");
  }
  return parsed;
}

function normalizeContact(contact: ProductionHandoffInput["contact"]) {
  if (!contact || (contact.type !== "email" && contact.type !== "phone")) {
    throw new ProductionHandoffError(400, "invalid_contact", "A valid contact method is required");
  }
  const value = contact.value?.trim();
  if (!value) {
    throw new ProductionHandoffError(400, "invalid_contact", "A contact detail is required");
  }
  if (contact.type === "email") {
    if (
      value.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      throw new ProductionHandoffError(400, "invalid_contact", "A valid email address is required");
    }
  } else if (value.length > 32 || !/^[+0-9 ()-]{6,32}$/.test(value)) {
    throw new ProductionHandoffError(400, "invalid_contact", "A valid phone number is required");
  }
  return { type: contact.type, value };
}

function normalizeOptionalText(value: string | undefined, maxLength: number, field: string) {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLength) {
    throw new ProductionHandoffError(400, "invalid_" + field, field + " is too long");
  }
  return trimmed;
}

function normalizePreferences(values: string[] | undefined): string[] {
  if (!values) return [];
  if (!Array.isArray(values) || values.length > MAX_PREFERENCES) {
    throw new ProductionHandoffError(400, "invalid_preferences", "Too many support preferences");
  }
  const normalized: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") {
      throw new ProductionHandoffError(400, "invalid_preferences", "Support preferences are invalid");
    }
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (trimmed.length > MAX_PREFERENCE_LENGTH) {
      throw new ProductionHandoffError(400, "invalid_preferences", "A support preference is too long");
    }
    if (!normalized.includes(trimmed)) normalized.push(trimmed);
  }
  return normalized;
}

function normalizeSecondaryTopics(values: SupportTopic[] | undefined): SupportTopic[] {
  if (!values) return [];
  if (!Array.isArray(values) || values.length > 2) {
    throw new ProductionHandoffError(400, "invalid_support_topics", "Maximum two secondary topics");
  }
  const normalized: SupportTopic[] = [];
  for (const value of values) {
    if (!supportTopics.includes(value as SupportTopic)) {
      throw new ProductionHandoffError(400, "invalid_support_topics", "A secondary support topic is invalid");
    }
    if (!normalized.includes(value)) normalized.push(value);
  }
  return normalized;
}

function normalizeInput(input: ProductionHandoffInput): NormalizedProductionHandoffInput {
  if (!input?.consentAccepted) {
    throw new ProductionHandoffError(
      400,
      "consent_required",
      "Explicit provider-specific consent is required",
    );
  }
  if (!supportTopics.includes(input.primarySupportTopic as SupportTopic)) {
    throw new ProductionHandoffError(400, "invalid_support_topic", "Primary support topic is invalid");
  }
  if (!serviceAreas.includes(input.serviceArea as ServiceArea)) {
    throw new ProductionHandoffError(400, "invalid_service_area", "Support area is invalid");
  }

  const consentVersion = input.consentVersion?.trim();
  if (!consentVersion || consentVersion.length > MAX_CONSENT_VERSION_LENGTH) {
    throw new ProductionHandoffError(400, "invalid_consent_version", "Consent version is required");
  }

  const optionalNote = normalizeOptionalText(input.optionalNote, 500, "optional_note");
  if (optionalNote && !input.optionalNoteAccepted) {
    throw new ProductionHandoffError(
      400,
      "optional_note_consent_required",
      "Optional note requires separate explicit consent",
    );
  }

  return {
    serviceId: normalizeServiceId(input.serviceId),
    ...(normalizeOptionalText(input.preferredName, 80, "preferred_name")
      ? { preferredName: normalizeOptionalText(input.preferredName, 80, "preferred_name") }
      : {}),
    contact: normalizeContact(input.contact),
    primarySupportTopic: input.primarySupportTopic,
    secondarySupportTopics: normalizeSecondaryTopics(input.secondarySupportTopics),
    serviceArea: input.serviceArea,
    preferences: normalizePreferences(input.preferences),
    ...(optionalNote ? { optionalNote } : {}),
    consentVersion,
    optionalNoteAccepted: Boolean(optionalNote && input.optionalNoteAccepted),
  };
}

function canonicalPayload(input: NormalizedProductionHandoffInput): string {
  return JSON.stringify({
    serviceId: input.serviceId,
    preferredName: input.preferredName ?? null,
    contact: input.contact,
    primarySupportTopic: input.primarySupportTopic,
    secondarySupportTopics: input.secondarySupportTopics,
    serviceArea: input.serviceArea,
    preferences: input.preferences,
    optionalNote: input.optionalNote ?? null,
    consentVersion: input.consentVersion,
    optionalNoteAccepted: input.optionalNoteAccepted,
  });
}

function managementIdFor(
  serverSecret: string,
  idempotencyKeyHash: string,
  idempotencyPayloadHash: string,
): string {
  return createHmac("sha256", serverSecret)
    .update("talkpoint-management-v1:" + idempotencyKeyHash + ":" + idempotencyPayloadHash, "utf8")
    .digest("base64url");
}

function supportTopicLabel(topic: SupportTopic): string {
  return supportTopicLabels[topic];
}

function createStructuredSupportSummary(input: NormalizedProductionHandoffInput): string {
  const related = input.secondarySupportTopics.length
    ? input.secondarySupportTopics.map(supportTopicLabel).join("; ")
    : "None selected";
  const preferences = input.preferences.length ? input.preferences.join("; ") : "None selected";
  return [
    "Main topic: " + supportTopicLabel(input.primarySupportTopic),
    "Related topics: " + related,
    "Support area: " + serviceAreaLabels[input.serviceArea],
    "Support preferences: " + preferences,
  ].join("\n");
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function serviceMatchesSupportContext(
  service: RecordLike,
  input: NormalizedProductionHandoffInput,
): boolean {
  const selectedTopics = new Set([input.primarySupportTopic, ...input.secondarySupportTopics]);
  const topics = stringArray(service.topics);
  const coverage = stringArray(service.coverage);
  const topicMatch = topics.some((topic) => selectedTopics.has(topic as SupportTopic));
  const areaMatch =
    coverage.includes(input.serviceArea) ||
    coverage.includes("anywhere_cyprus") ||
    coverage.includes("online");
  return topicMatch && areaMatch;
}

async function resolveProductionRecipient(
  payload: Payload,
  input: NormalizedProductionHandoffInput,
  transactionID: TransactionID,
): Promise<{ providerOrganisationId: number }> {
  let service: RecordLike;
  try {
    service = (await payload.findByID({
      collection: "services",
      id: input.serviceId,
      depth: 0,
      overrideAccess: true,
      req: { transactionID },
    })) as unknown as RecordLike;
  } catch {
    throw new ProductionHandoffError(400, "service_unavailable", "Selected service is unavailable");
  }

  if (service.integrated !== true || service.productionHandoffEnabled !== true) {
    throw new ProductionHandoffError(
      409,
      "service_not_enabled_for_handoff",
      "Selected service is not enabled for production assisted contact",
    );
  }
  if (service.informationSource === SYNTHETIC_DIRECTORY_SOURCE) {
    throw new ProductionHandoffError(
      409,
      "synthetic_service_blocked",
      "Synthetic demonstration services cannot receive production requests",
    );
  }
  if (!serviceMatchesSupportContext(service, input)) {
    throw new ProductionHandoffError(
      409,
      "service_context_mismatch",
      "Selected service does not match the submitted structured support context",
    );
  }

  const providerId = numericRelationshipId(service.provider, "Service provider");
  let provider: RecordLike;
  try {
    provider = (await payload.findByID({
      collection: "providers",
      id: providerId,
      depth: 0,
      overrideAccess: true,
      req: { transactionID },
    })) as unknown as RecordLike;
  } catch {
    throw new ProductionHandoffError(503, "provider_unavailable", "Selected service provider is unavailable");
  }

  if (provider.informationSource === SYNTHETIC_DIRECTORY_SOURCE) {
    throw new ProductionHandoffError(
      409,
      "synthetic_provider_blocked",
      "Synthetic demonstration providers cannot receive production requests",
    );
  }

  return {
    providerOrganisationId: numericRelationshipId(
      provider.organisation,
      "Provider organisation",
    ),
  };
}

async function findExistingRequest(
  payload: Payload,
  idempotencyKeyHash: string,
  transactionID?: TransactionID,
): Promise<RecordLike | null> {
  const result = await payload.find({
    collection: "contact-requests",
    where: { idempotencyKeyHash: { equals: idempotencyKeyHash } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    ...(transactionID ? { req: { transactionID } } : {}),
  });
  return asRecord(result.docs[0]);
}

async function assertExistingConsent(
  payload: Payload,
  requestId: number,
  transactionID?: TransactionID,
): Promise<void> {
  const result = await payload.find({
    collection: "consent-records",
    where: { request: { equals: requestId } },
    limit: 2,
    depth: 0,
    overrideAccess: true,
    ...(transactionID ? { req: { transactionID } } : {}),
  });
  if (result.totalDocs !== 1) {
    throw new ProductionHandoffError(
      500,
      "handoff_integrity_error",
      "Existing handoff is missing its provider-specific consent record",
    );
  }
}

async function replayExisting(
  payload: Payload,
  existing: RecordLike,
  payloadHash: string,
  managementId: string,
  transactionID?: TransactionID,
): Promise<ProductionHandoffResult> {
  if (existing.idempotencyPayloadHash !== payloadHash) {
    throw new ProductionHandoffError(
      409,
      "idempotency_conflict",
      "Idempotency-Key was already used for a different handoff payload",
    );
  }
  const requestId = numericRelationshipId(existing.id, "Contact request");
  await assertExistingConsent(payload, requestId, transactionID);
  return {
    requestId: String(requestId),
    managementId,
    idempotentReplay: true,
  };
}

async function withTransaction<T>(
  payload: Payload,
  operation: (transactionID: TransactionID) => Promise<T>,
): Promise<T> {
  const transactionID = await payload.db.beginTransaction();
  if (!transactionID) {
    throw new ProductionHandoffError(
      503,
      "transaction_unavailable",
      "Production handoff transaction is unavailable",
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
      // Preserve the original failure; handoff still fails closed.
    }
    throw error;
  }
}

export async function persistProductionHandoff(
  payload: Payload,
  input: ProductionHandoffInput,
  rawIdempotencyKey: string,
  serverSecret: string,
): Promise<ProductionHandoffResult> {
  const normalized = normalizeInput(input);
  const idempotencyKey = normalizeIdempotencyKey(rawIdempotencyKey);
  const idempotencyKeyHash = sha256("talkpoint-handoff-v1:" + idempotencyKey);
  const idempotencyPayloadHash = sha256(canonicalPayload(normalized));
  const managementId = managementIdFor(serverSecret, idempotencyKeyHash, idempotencyPayloadHash);
  const managementTokenHash = sha256(managementId);

  const existing = await findExistingRequest(payload, idempotencyKeyHash);
  if (existing) {
    return replayExisting(payload, existing, idempotencyPayloadHash, managementId);
  }

  try {
    return await withTransaction(payload, async (transactionID) => {
      const transactionExisting = await findExistingRequest(
        payload,
        idempotencyKeyHash,
        transactionID,
      );
      if (transactionExisting) {
        return replayExisting(
          payload,
          transactionExisting,
          idempotencyPayloadHash,
          managementId,
          transactionID,
        );
      }

      const { providerOrganisationId } = await resolveProductionRecipient(
        payload,
        normalized,
        transactionID,
      );
      const request = await payload.create({
        collection: "contact-requests",
        data: {
          providerOrganisation: providerOrganisationId,
          service: normalized.serviceId,
          preferredName: normalized.preferredName,
          contactType: normalized.contact.type,
          contactDetail: normalized.contact.value,
          primarySupportTopic: normalized.primarySupportTopic,
          secondarySupportTopics: normalized.secondarySupportTopics,
          serviceArea: normalized.serviceArea,
          preferences: normalized.preferences,
          structuredSupportSummary: createStructuredSupportSummary(normalized),
          optionalNote: normalized.optionalNote,
          status: "new",
          managementTokenHash,
          idempotencyKeyHash,
          idempotencyPayloadHash,
        },
        depth: 0,
        overrideAccess: true,
        req: { transactionID },
      });

      const requestId = numericRelationshipId(request.id, "Contact request");
      const authorisedDataCategories = [
        "contact",
        "support_topics",
        "service_area_preferences",
        "structured_support_summary",
      ];
      if (normalized.optionalNote && normalized.optionalNoteAccepted) {
        authorisedDataCategories.push("optional_note");
      }

      await payload.create({
        collection: "consent-records",
        data: {
          request: requestId,
          consentVersion: normalized.consentVersion,
          recipientProviderOrganisation: providerOrganisationId,
          authorisedDataCategories,
          optionalNoteAuthorised: Boolean(
            normalized.optionalNote && normalized.optionalNoteAccepted,
          ),
          consentedAt: new Date().toISOString(),
        },
        depth: 0,
        overrideAccess: true,
        req: { transactionID },
      });

      return {
        requestId: String(requestId),
        managementId,
        idempotentReplay: false,
      };
    });
  } catch (error) {
    // A concurrent request with the same unique idempotency key may win the race.
    // After rollback, return that committed result only when the exact payload matches.
    const raced = await findExistingRequest(payload, idempotencyKeyHash);
    if (raced) {
      return replayExisting(payload, raced, idempotencyPayloadHash, managementId);
    }
    throw error;
  }
}
