import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getProductionHandoffSecret, getRuntimeMode } from "@/lib/config/server";
import { getApprovedProductionPrivacyConfiguration } from "@/lib/privacy/production-config";
import { securityErrorResponse } from "@/lib/security/api-response";
import { assertAllowedBrowserOrigin, noStoreHeaders, readJsonBodyLimited } from "@/lib/security/http-hardening";
import { consumeRateLimit, publicRateLimitSubject, rateLimitPolicies } from "@/lib/security/rate-limit";
import {
  persistProductionHandoff,
  ProductionHandoffError,
  type ProductionHandoffInput,
} from "@/lib/handoff/production-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedFields = new Set([
  "serviceId",
  "preferredName",
  "contact",
  "primarySupportTopic",
  "secondarySupportTopics",
  "serviceArea",
  "preferences",
  "optionalNote",
  "consentAccepted",
  "optionalNoteAccepted",
  "previewToken",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function assertExactInputShape(body: Record<string, unknown>) {
  const unexpected = Object.keys(body).find((key) => !allowedFields.has(key));
  if (unexpected) {
    throw new ProductionHandoffError(
      400,
      "unexpected_field",
      "Unexpected production handoff field: " + unexpected,
    );
  }

  const contact = asRecord(body.contact);
  if (!contact) {
    throw new ProductionHandoffError(400, "invalid_contact", "A contact method is required");
  }
  const unexpectedContact = Object.keys(contact).find(
    (key) => key !== "type" && key !== "value",
  );
  if (unexpectedContact) {
    throw new ProductionHandoffError(
      400,
      "unexpected_contact_field",
      "Unexpected contact field: " + unexpectedContact,
    );
  }
}

function productionHandoffSecret(): string {
  try {
    return getProductionHandoffSecret();
  } catch {
    throw new ProductionHandoffError(
      503,
      "production_handoff_secret_unconfigured",
      "Production handoff credential secret is not configured",
    );
  }
}

function approvedPrivacyConfiguration() {
  try {
    return getApprovedProductionPrivacyConfiguration();
  } catch {
    throw new ProductionHandoffError(
      503,
      "production_privacy_unapproved",
      "Production privacy/legal configuration is not approved or current",
    );
  }
}

function errorResponse(error: unknown) {
  const securityResponse = securityErrorResponse(error);
  if (securityResponse) return securityResponse;
  if (error instanceof ProductionHandoffError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers: noStoreHeaders },
    );
  }
  return NextResponse.json(
    {
      error: "Production assisted contact could not be created",
      code: "production_handoff_error",
    },
    { status: 500, headers: noStoreHeaders },
  );
}

export async function POST(request: Request) {
  try {
    if (getRuntimeMode() !== "production") {
      throw new ProductionHandoffError(
        503,
        "production_handoff_unavailable",
        "Production assisted contact is unavailable in this runtime",
      );
    }

    assertAllowedBrowserOrigin(request);
    const payload = await getPayload({ config });
    await consumeRateLimit(
      payload,
      rateLimitPolicies.productionHandoff,
      publicRateLimitSubject(request),
    );

    const idempotencyKey = request.headers.get("Idempotency-Key");
    if (!idempotencyKey) {
      throw new ProductionHandoffError(
        400,
        "idempotency_key_required",
        "Idempotency-Key header is required",
      );
    }

    const parsed = await readJsonBodyLimited(request, 16 * 1024);
    const body = asRecord(parsed);
    if (!body) {
      throw new ProductionHandoffError(400, "invalid_request", "Request body must be an object");
    }
    assertExactInputShape(body);

    const privacy = approvedPrivacyConfiguration();
    const result = await persistProductionHandoff(
      payload,
      body as unknown as ProductionHandoffInput,
      idempotencyKey,
      productionHandoffSecret(),
      privacy.consentVersion!,
    );

    return NextResponse.json(
      result,
      {
        status: result.idempotentReplay ? 200 : 201,
        headers: noStoreHeaders,
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
