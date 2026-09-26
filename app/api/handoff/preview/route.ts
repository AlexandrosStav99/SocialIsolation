import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getPayloadSecret, getRuntimeMode } from "@/lib/config/server";
import {
  createProductionHandoffPreview,
  ProductionHandoffError,
  type ProductionHandoffPreviewInput,
} from "@/lib/handoff/production-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

const allowedFields = new Set([
  "serviceId",
  "preferredName",
  "contact",
  "primarySupportTopic",
  "secondarySupportTopics",
  "serviceArea",
  "preferences",
  "optionalNote",
  "consentVersion",
  "optionalNoteAccepted",
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
      "Unexpected production Sharing Preview field: " + unexpected,
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

function errorResponse(error: unknown) {
  if (error instanceof ProductionHandoffError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers: noStoreHeaders },
    );
  }
  return NextResponse.json(
    {
      error: "Production Sharing Preview could not be created",
      code: "production_preview_error",
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

    let parsed: unknown;
    try {
      parsed = await request.json();
    } catch {
      throw new ProductionHandoffError(400, "invalid_json", "Request body must be valid JSON");
    }
    const body = asRecord(parsed);
    if (!body) {
      throw new ProductionHandoffError(400, "invalid_request", "Request body must be an object");
    }
    assertExactInputShape(body);

    const payload = await getPayload({ config });
    const preview = await createProductionHandoffPreview(
      payload,
      body as unknown as ProductionHandoffPreviewInput,
      getPayloadSecret(),
    );

    return NextResponse.json(preview, { headers: noStoreHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}
