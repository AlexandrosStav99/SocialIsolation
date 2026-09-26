import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { getRuntimeMode } from "@/lib/config/server";
import { securityErrorResponse } from "@/lib/security/api-response";
import { assertAllowedBrowserOrigin, noStoreHeaders, readJsonBodyLimited } from "@/lib/security/http-hardening";
import { consumeRateLimit, publicRateLimitSubject, rateLimitPolicies } from "@/lib/security/rate-limit";
import {
  DeletionError,
  withdrawProductionRequest,
} from "@/lib/privacy/retention-executor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedFields = new Set(["requestId", "managementId"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function errorResponse(error: unknown) {
  const securityResponse = securityErrorResponse(error);
  if (securityResponse) return securityResponse;
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

    assertAllowedBrowserOrigin(request);
    const payload = await getPayload({ config });
    await consumeRateLimit(
      payload,
      rateLimitPolicies.productionWithdrawal,
      publicRateLimitSubject(request),
    );

    const parsed = await readJsonBodyLimited(request, 4 * 1024);

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

    const result = await withdrawProductionRequest(
      payload,
      body.requestId,
      typeof body.managementId === "string" ? body.managementId : "",
    );

    return NextResponse.json(result, { headers: noStoreHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}
