import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { authenticateProviderActor, ProviderWorkspaceError } from "@/lib/provider/payload-auth";
import {
  assignProviderRequest,
  getProviderRequestDetail,
  listProviderRequests,
  transitionProviderRequest,
} from "@/lib/provider/payload-workspace";
import { requestStatuses, type RequestStatus } from "@/lib/provider/workflow";

export const runtime = "nodejs";

function jsonError(error: unknown) {
  if (error instanceof ProviderWorkspaceError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }
  return NextResponse.json(
    { error: "Provider workspace request failed", code: "provider_workspace_error" },
    { status: 500 },
  );
}

function positiveInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function requiredId(value: unknown, field: string): string {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new ProviderWorkspaceError(400, "invalid_request", field + " is required");
  }
  const id = String(value).trim();
  if (!id) throw new ProviderWorkspaceError(400, "invalid_request", field + " is required");
  return id;
}

function assertOnlyFields(body: Record<string, unknown>, allowed: readonly string[]) {
  const allowedSet = new Set(allowed);
  const unexpected = Object.keys(body).find((key) => !allowedSet.has(key));
  if (unexpected) {
    throw new ProviderWorkspaceError(
      400,
      "unexpected_field",
      "Unexpected provider workspace field: " + unexpected,
    );
  }
}

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config });
    const actor = await authenticateProviderActor(payload, request.headers);
    const url = new URL(request.url);
    const requestId = url.searchParams.get("requestId")?.trim();

    if (requestId) {
      const detail = await getProviderRequestDetail(payload, actor, requestId);
      return NextResponse.json({ request: detail });
    }

    const page = positiveInteger(url.searchParams.get("page"), 1);
    const limit = Math.min(positiveInteger(url.searchParams.get("limit"), 25), 50);
    return NextResponse.json(await listProviderRequests(payload, actor, page, limit));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await getPayload({ config });
    const actor = await authenticateProviderActor(payload, request.headers);
    const body = asRecord(await request.json());
    if (!body || typeof body.action !== "string") {
      throw new ProviderWorkspaceError(400, "invalid_request", "Provider workspace action is required");
    }

    if (body.action === "assign") {
      assertOnlyFields(body, ["action", "requestId", "assigneeUserId"]);
      const requestId = requiredId(body.requestId, "requestId");
      const assigneeUserId = requiredId(body.assigneeUserId, "assigneeUserId");
      const updated = await assignProviderRequest(payload, actor, requestId, assigneeUserId);
      return NextResponse.json({ request: updated });
    }

    if (body.action === "transition") {
      assertOnlyFields(body, ["action", "requestId", "status"]);
      const requestId = requiredId(body.requestId, "requestId");
      if (typeof body.status !== "string" || !requestStatuses.includes(body.status as RequestStatus)) {
        throw new ProviderWorkspaceError(400, "invalid_status", "A valid request status is required");
      }
      const updated = await transitionProviderRequest(
        payload,
        actor,
        requestId,
        body.status as RequestStatus,
      );
      return NextResponse.json({ request: updated });
    }

    throw new ProviderWorkspaceError(400, "invalid_action", "Unknown provider workspace action");
  } catch (error) {
    return jsonError(error);
  }
}
