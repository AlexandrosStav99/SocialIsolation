import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getRuntimeMode } from "@/lib/config/server";
import {
  DeletionError,
  withdrawProductionRequest,
} from "@/lib/privacy/retention-executor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

const allowedFields = new Set(["requestId", "managementId"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function errorResponse(error: unknown) {
  if (error instanceof DeletionError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status, headers: noStoreHeaders },
    );
  }
  return NextResponse.json(
    {
      error: "Request withdrawal could not be completed",
      code: "withdrawal_error",
    },
    { status: 500, headers: noStoreHeaders },
  );
}

export async function POST(request: Request) {
  try {
    if (getRuntimeMode() !== "production") {
      throw new DeletionError(
        503,
        "production_withdrawal_unavailable",
        "Production request withdrawal is unavailable in this runtime",
      );
    }

    let parsed: unknown;
    try {
      parsed = await request.json();
    } catch {
      throw new DeletionError(400, "invalid_json", "Request body must be valid JSON");
    }

    const body = asRecord(parsed);
    if (!body) {
      throw new DeletionError(400, "invalid_request", "Request body must be an object");
    }
    const unexpected = Object.keys(body).find((key) => !allowedFields.has(key));
    if (unexpected) {
      throw new DeletionError(
        400,
        "unexpected_field",
        "Unexpected withdrawal field: " + unexpected,
      );
    }

    const payload = await getPayload({ config });
    const result = await withdrawProductionRequest(
      payload,
      body.requestId as string | number,
      typeof body.managementId === "string" ? body.managementId : "",
    );

    return NextResponse.json(result, { headers: noStoreHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}
