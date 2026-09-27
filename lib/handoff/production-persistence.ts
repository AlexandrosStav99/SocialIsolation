import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { Payload } from "payload";
import { SYNTHETIC_DIRECTORY_SOURCE } from "../directory/synthetic.ts";
import {
  isProductionProviderDirectoryEligible,
  isProductionServiceDirectoryEligible,
} from "../directory/production-metadata.ts";
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

export type ProductionHandoffPreviewInput = {
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
  optionalNoteAccepted: boolean;
};

export type ProductionHandoffInput = ProductionHandoffPreviewInput & {
  consentAccepted: boolean;
  previewToken: string;
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

type ProductionRecipient = {
  providerId: number;
  providerOrganisationId: number;
  providerName: string;
  serviceName: string;
};

export type ProductionHandoffPreview = {
  previewToken: string;
  recipient: {
    providerName: string;
    serviceName: string;
  };
  purpose: "provider_specific_assisted_contact";
  sharing: {
    preferredName?: string;
    contact: { type: "email" | "phone"; value: string };
    primarySupportTopic: SupportTopic;
    secondarySupportTopics: SupportTopic[];
    serviceArea: ServiceArea;
    preferences: string[];
    structuredSupportSummary: string;
    optionalNote?: string;
  };
  authorisedDataCategories: string[];
  consentVersion: string;
};

export type ProductionHandoffResult = {
  requestId: string;
  managementId: string;
  idempotentReplay: boolean;
};

function asRecord(value: unknown): RecordLike | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordLike)
    : null;
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

function publicRequestId(record: RecordLike): string {
  const value = record.publicRequestId;
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    throw new ProductionHandoffError(
      500,
      "handoff_integrity_error",
      "Stored public request identifier is invalid",
    );
  }
  return value;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ProductionHandoffError(400, "invalid_" + field, field + " is required");
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ProductionHandoffError(400, "invalid_" + field, field + " is required");
  }
  return trimmed;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeIdempotencyKey(raw: string): string {
  const value = requiredString(raw, "idempotency_key");
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

function normalizeServiceId(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ProductionHandoffError(400, "invalid_service", "A valid service is required");
  }
  return parsed;
}

function normalizeContact(value: unknown): { type: "email" | "phone"; value: string } {
  const contact = asRecord(value);
  const type = contact?.type;
  const rawValue = contact?.value;
  if ((type !== "email" && type !== "phone") || typeof rawValue !== "string") {
    throw new ProductionHandoffError(400, "invalid_contact", "A valid contact method is required");
  }
  const contactValue = rawValue.trim();
  if (!contactValue) {
    throw new ProductionHandoffError(400, "invalid_contact", "A contact detail is required");
  }
  if (type === "email") {
    if (contactValue.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
      throw new ProductionHandoffError(400, "invalid_contact", "A valid email address is required");
    }
  } else if (contactValue.length > 32 || !/^[+0-9 ()-]{6,32}$/.test(contactValue)) {
    throw new ProductionHandoffError(400, "invalid_contact", "A valid phone number is required");
  }
  return { type, value: contactValue };
}

function normalizeOptionalText(value: unknown, maxLength: number, field: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new ProductionHandoffError(400, "invalid_" + field, field + " is invalid");
  }
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLength) {
    throw new ProductionHandoffError(400, "invalid_" + field, field + " is too long");
  }
  return trimmed;
}

function normalizePreferences(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > MAX_PREFERENCES) {
    throw new ProductionHandoffError(400, "invalid_preferences", "Support preferences are invalid");
  }
  const nonEmpty = value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim()),
  );
  if (nonEmpty.some((item) => item.trim().length > MAX_PREFERENCE_LENGTH)) {
    throw new ProductionHandoffError(400, "invalid_preferences", "A support preference is too long");
  }
  if (nonEmpty.length > 0) {
    throw new ProductionHandoffError(
      400,
      "unsupported_preferences",
      "Production handoff does not accept support preferences until controlled preference options are enabled",
    );
  }
  return [];
}

function normalizeSecondaryTopics(value: unknown): SupportTopic[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 2) {
    throw new ProductionHandoffError(400, "invalid_support_topics", "Maximum two secondary topics");
  }
  const normalized: SupportTopic[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !supportTopics.includes(item as SupportTopic)) {
      throw new ProductionHandoffError(400, "invalid_support_topics", "A secondary support topic is invalid");
    }
    const topic = item as SupportTopic;
    if (!normalized.includes(topic)) normalized.push(topic);
  }
  return normalized;
}

function normalizeShareInput(
  input: ProductionHandoffPreviewInput,
  serverConsentVersion: string,
): NormalizedProductionHandoffInput {
  const record = asRecord(input);
  if (!record) {
    throw new ProductionHandoffError(400, "invalid_request", "Handoff input must be an object");
  }

  const primary = record.primarySupportTopic;
  if (typeof primary !== "string" || !supportTopics.includes(primary as SupportTopic)) {
    throw new ProductionHandoffError(400, "invalid_support_topic", "Primary support topic is invalid");
  }

  const area = record.serviceArea;
  if (typeof area !== "string" || !serviceAreas.includes(area as ServiceArea)) {
    throw new ProductionHandoffError(400, "invalid_service_area", "Support area is invalid");
  }

  const consentVersion = requiredString(serverConsentVersion, "consent_version");
  if (consentVersion.length > MAX_CONSENT_VERSION_LENGTH) {
    throw new ProductionHandoffError(503, "invalid_consent_version", "Configured consent version is too long");
  }

  if (
    record.optionalNoteAccepted !== undefined &&
    typeof record.optionalNoteAccepted !== "boolean"
  ) {
    throw new ProductionHandoffError(
      400,
      "invalid_optional_note_consent",
      "Optional-note consent flag is invalid",
    );
  }

  const preferredName = normalizeOptionalText(record.preferredName, 80, "preferred_name");
  const optionalNote = normalizeOptionalText(record.optionalNote, 500, "optional_note");
  const optionalNoteAccepted = record.optionalNoteAccepted === true;
  if (optionalNote && !optionalNoteAccepted) {
    throw new ProductionHandoffError(
      400,
      "optional_note_consent_required",
      "Optional note requires separate explicit consent",
    );
  }

  return {
    serviceId: normalizeServiceId(record.serviceId),
    ...(preferredName ? { preferredName } : {}),
    contact: normalizeContact(record.contact),
    primarySupportTopic: primary as SupportTopic,
    secondarySupportTopics: normalizeSecondaryTopics(record.secondarySupportTopics),
    serviceArea: area as ServiceArea,
    preferences: normalizePreferences(record.preferences),
    ...(optionalNote ? { optionalNote } : {}),
    consentVersion,
    optionalNoteAccepted: Boolean(optionalNote && optionalNoteAccepted),
  };
}

function canonicalSharePayload(input: NormalizedProductionHandoffInput): string {
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

function canonicalFinalPayload(input: NormalizedProductionHandoffInput, previewToken: string): string {
  return JSON.stringify({
    share: JSON.parse(canonicalSharePayload(input)) as unknown,
    previewToken,
  });
}

function managementEncryptionKey(serverSecret: string): Buffer {
  return createHash("sha256")
    .update("talkpoint-management-envelope-key-v1:" + serverSecret, "utf8")
    .digest();
}

function encryptManagementId(serverSecret: string, managementId: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", managementEncryptionKey(serverSecret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(managementId, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function decryptManagementId(serverSecret: string, envelope: unknown): string {
  if (typeof envelope !== "string") {
    throw new ProductionHandoffError(
      503,
      "management_credential_unavailable",
      "Existing request management credential cannot be safely recovered",
    );
  }
  const parts = envelope.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") {
    throw new ProductionHandoffError(
      503,
      "management_credential_unavailable",
      "Existing request management credential cannot be safely recovered",
    );
  }
  try {
    const iv = Buffer.from(parts[1], "base64url");
    const authTag = Buffer.from(parts[2], "base64url");
    const ciphertext = Buffer.from(parts[3], "base64url");
    if (iv.length !== 12 || authTag.length !== 16 || ciphertext.length === 0) {
      throw new Error("Invalid management credential envelope");
    }
    const decipher = createDecipheriv(
      "aes-256-gcm",
      managementEncryptionKey(serverSecret),
      iv,
    );
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new ProductionHandoffError(
      503,
      "management_credential_key_mismatch",
      "Existing request cannot be safely replayed with the current management-credential key",
    );
  }
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

function authorisedDataCategories(input: NormalizedProductionHandoffInput): string[] {
  const categories = [
    "contact",
    "support_topics",
    "service_area_preferences",
    "structured_support_summary",
  ];
  if (input.optionalNote && input.optionalNoteAccepted) categories.push("optional_note");
  return categories;
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
  transactionID?: TransactionID,
): Promise<ProductionRecipient> {
  let service: RecordLike;
  try {
    service = (await payload.findByID({
      collection: "services",
      id: input.serviceId,
      depth: 0,
      overrideAccess: true,
      ...(transactionID ? { req: { transactionID } } : {}),
    })) as unknown as RecordLike;
  } catch {
    throw new ProductionHandoffError(400, "service_unavailable", "Selected service is unavailable");
  }

  if (!isProductionServiceDirectoryEligible(service)) {
    throw new ProductionHandoffError(
      409,
      "service_directory_unavailable",
      "Selected service is not currently available in the production directory",
    );
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
  const approvedProviderIdRaw = relationshipId(service.productionHandoffProvider);
  const approvedOrganisationIdRaw = relationshipId(service.productionHandoffOrganisation);
  if (!approvedProviderIdRaw || !approvedOrganisationIdRaw) {
    throw new ProductionHandoffError(
      409,
      "production_handoff_scope_unconfigured",
      "Selected service is missing its approved production recipient scope",
    );
  }
  const approvedProviderId = numericRelationshipId(
    service.productionHandoffProvider,
    "Approved production provider",
  );
  const approvedOrganisationId = numericRelationshipId(
    service.productionHandoffOrganisation,
    "Approved production organisation",
  );
  if (providerId !== approvedProviderId) {
    throw new ProductionHandoffError(
      409,
      "production_handoff_scope_mismatch",
      "Selected service provider no longer matches its approved production recipient",
    );
  }

  let provider: RecordLike;
  try {
    provider = (await payload.findByID({
      collection: "providers",
      id: providerId,
      depth: 0,
      overrideAccess: true,
      ...(transactionID ? { req: { transactionID } } : {}),
    })) as unknown as RecordLike;
  } catch {
    throw new ProductionHandoffError(503, "provider_unavailable", "Selected service provider is unavailable");
  }

  if (!isProductionProviderDirectoryEligible(provider)) {
    throw new ProductionHandoffError(
      409,
      "provider_directory_unavailable",
      "Selected service provider is not currently available in the production directory",
    );
  }

  if (provider.informationSource === SYNTHETIC_DIRECTORY_SOURCE) {
    throw new ProductionHandoffError(
      409,
      "synthetic_provider_blocked",
      "Synthetic demonstration providers cannot receive production requests",
    );
  }

  const providerOrganisationId = numericRelationshipId(
    provider.organisation,
    "Provider organisation",
  );
  if (providerOrganisationId !== approvedOrganisationId) {
    throw new ProductionHandoffError(
      409,
      "production_handoff_scope_mismatch",
      "Selected provider organisation no longer matches its approved production recipient",
    );
  }

  const serviceName = providerNameOrServiceName(service.name, "Service");
  const providerName = providerNameOrServiceName(provider.name, "Provider");
  return {
    providerId,
    providerOrganisationId: approvedOrganisationId,
    providerName,
    serviceName,
  };
}

function providerNameOrServiceName(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ProductionHandoffError(503, "invalid_directory_record", field + " name is invalid");
  }
  return value.trim();
}

function previewTokenFor(
  serverSecret: string,
  input: NormalizedProductionHandoffInput,
  recipient: ProductionRecipient,
): string {
  const recipientFingerprint = JSON.stringify({
    serviceId: input.serviceId,
    serviceName: recipient.serviceName,
    providerId: recipient.providerId,
    providerName: recipient.providerName,
    providerOrganisationId: recipient.providerOrganisationId,
  });
  return createHmac("sha256", serverSecret)
    .update(
      "talkpoint-sharing-preview-v1:" +
        sha256(canonicalSharePayload(input)) +
        ":" +
        sha256(recipientFingerprint),
      "utf8",
    )
    .digest("base64url");
}

function tokenMatches(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function createProductionHandoffPreview(
  payload: Payload,
  input: ProductionHandoffPreviewInput,
  serverSecret: string,
  serverConsentVersion: string,
): Promise<ProductionHandoffPreview> {
  const normalized = normalizeShareInput(input, serverConsentVersion);
  const recipient = await resolveProductionRecipient(payload, normalized);
  const structuredSupportSummary = createStructuredSupportSummary(normalized);

  return {
    previewToken: previewTokenFor(serverSecret, normalized, recipient),
    recipient: {
      providerName: recipient.providerName,
      serviceName: recipient.serviceName,
    },
    purpose: "provider_specific_assisted_contact",
    sharing: {
      ...(normalized.preferredName ? { preferredName: normalized.preferredName } : {}),
      contact: normalized.contact,
      primarySupportTopic: normalized.primarySupportTopic,
      secondarySupportTopics: [...normalized.secondarySupportTopics],
      serviceArea: normalized.serviceArea,
      preferences: [...normalized.preferences],
      structuredSupportSummary,
      ...(normalized.optionalNote ? { optionalNote: normalized.optionalNote } : {}),
    },
    authorisedDataCategories: authorisedDataCategories(normalized),
    consentVersion: normalized.consentVersion,
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
    showHiddenFields: true,
    ...(transactionID ? { req: { transactionID } } : {}),
  });
  return asRecord(result.docs[0]);
}

async function findDeletedIdempotencyTombstone(
  payload: Payload,
  idempotencyKeyHash: string,
  transactionID?: TransactionID,
): Promise<RecordLike | null> {
  const result = await payload.find({
    collection: "consent-records",
    where: { deletedIdempotencyKeyHash: { equals: idempotencyKeyHash } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
    ...(transactionID ? { req: { transactionID } } : {}),
  });
  return asRecord(result.docs[0]);
}

function assertNoDeletedIdempotencyReplay(
  tombstone: RecordLike | null,
  payloadHash: string,
): void {
  if (!tombstone) return;
  if (tombstone.deletedIdempotencyPayloadHash !== payloadHash) {
    throw new ProductionHandoffError(
      409,
      "idempotency_conflict",
      "Idempotency-Key was already used for a different handoff payload",
    );
  }
  throw new ProductionHandoffError(
    410,
    "handoff_previously_deleted",
    "This assisted-contact request was previously deleted and will not be recreated by retry",
  );
}

async function assertExistingConsent(
  payload: Payload,
  existingRequest: RecordLike,
  transactionID?: TransactionID,
): Promise<number> {
  const requestId = numericRelationshipId(existingRequest.id, "Contact request");
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
  const consent = asRecord(result.docs[0]);
  const requestOrganisationId = relationshipId(existingRequest.providerOrganisation);
  const consentOrganisationId = relationshipId(consent?.recipientProviderOrganisation);
  if (
    !requestOrganisationId ||
    !consentOrganisationId ||
    requestOrganisationId !== consentOrganisationId
  ) {
    throw new ProductionHandoffError(
      500,
      "handoff_integrity_error",
      "Existing handoff consent recipient does not match the request",
    );
  }
  return requestId;
}

async function replayExisting(
  payload: Payload,
  existing: RecordLike,
  payloadHash: string,
  serverSecret: string,
  transactionID?: TransactionID,
): Promise<ProductionHandoffResult> {
  if (existing.idempotencyPayloadHash !== payloadHash) {
    throw new ProductionHandoffError(
      409,
      "idempotency_conflict",
      "Idempotency-Key was already used for a different handoff payload",
    );
  }
  const managementId = decryptManagementId(serverSecret, existing.managementTokenEnvelope);
  const storedManagementTokenHash = existing.managementTokenHash;
  if (
    typeof storedManagementTokenHash !== "string" ||
    storedManagementTokenHash !== sha256(managementId)
  ) {
    throw new ProductionHandoffError(
      500,
      "handoff_integrity_error",
      "Existing request management credential failed its integrity check",
    );
  }
  await assertExistingConsent(payload, existing, transactionID);
  return {
    requestId: publicRequestId(existing),
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
  serverConsentVersion: string,
): Promise<ProductionHandoffResult> {
  const inputRecord = asRecord(input);
  if (!inputRecord || inputRecord.consentAccepted !== true) {
    throw new ProductionHandoffError(
      400,
      "consent_required",
      "Explicit provider-specific consent is required",
    );
  }
  const previewToken = requiredString(inputRecord.previewToken, "preview_token");
  if (!/^[A-Za-z0-9_-]{43}$/.test(previewToken)) {
    throw new ProductionHandoffError(400, "invalid_preview_token", "Sharing Preview token is invalid");
  }

  const normalized = normalizeShareInput(input, serverConsentVersion);
  const idempotencyKey = normalizeIdempotencyKey(rawIdempotencyKey);
  const idempotencyKeyHash = sha256("talkpoint-handoff-v1:" + idempotencyKey);
  const idempotencyPayloadHash = sha256(canonicalFinalPayload(normalized, previewToken));

  const existing = await findExistingRequest(payload, idempotencyKeyHash);
  if (existing) {
    return replayExisting(payload, existing, idempotencyPayloadHash, serverSecret);
  }
  assertNoDeletedIdempotencyReplay(
    await findDeletedIdempotencyTombstone(payload, idempotencyKeyHash),
    idempotencyPayloadHash,
  );

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
          serverSecret,
          transactionID,
        );
      }
      assertNoDeletedIdempotencyReplay(
        await findDeletedIdempotencyTombstone(payload, idempotencyKeyHash, transactionID),
        idempotencyPayloadHash,
      );

      const recipient = await resolveProductionRecipient(payload, normalized, transactionID);
      const expectedPreviewToken = previewTokenFor(serverSecret, normalized, recipient);
      if (!tokenMatches(previewToken, expectedPreviewToken)) {
        throw new ProductionHandoffError(
          409,
          "preview_token_invalid_or_stale",
          "Sharing Preview is invalid or no longer matches the selected service and data",
        );
      }

      const managementId = randomBytes(32).toString("base64url");
      const managementTokenHash = sha256(managementId);
      const managementTokenEnvelope = encryptManagementId(serverSecret, managementId);
      const publicRequestIdentifier = randomUUID();

      const request = await payload.create({
        collection: "contact-requests",
        data: {
          publicRequestId: publicRequestIdentifier,
          providerOrganisation: recipient.providerOrganisationId,
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
          managementTokenEnvelope,
          idempotencyKeyHash,
          idempotencyPayloadHash,
        },
        depth: 0,
        overrideAccess: true,
        req: { transactionID },
      });

      const requestId = numericRelationshipId(request.id, "Contact request");
      await payload.create({
        collection: "consent-records",
        data: {
          request: requestId,
          consentVersion: normalized.consentVersion,
          recipientProviderOrganisation: recipient.providerOrganisationId,
          authorisedDataCategories: authorisedDataCategories(normalized),
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
        requestId: publicRequestIdentifier,
        managementId,
        idempotentReplay: false,
      };
    });
  } catch (error) {
    // A concurrent request with the same unique idempotency key may win the race.
    // After rollback, return that committed result only when the exact payload matches.
    const raced = await findExistingRequest(payload, idempotencyKeyHash);
    if (raced) {
      return replayExisting(payload, raced, idempotencyPayloadHash, serverSecret);
    }
    throw error;
  }
}
