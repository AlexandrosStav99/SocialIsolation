import type { Payload } from "payload";
import { requireAuthenticatedActor, type AuthenticatedActor } from "./auth.ts";

export class ProviderWorkspaceError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ProviderWorkspaceError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function relationshipId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const record = asRecord(value);
  const id = record?.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : null;
}

export function providerActorFromPayloadUser(user: unknown): AuthenticatedActor {
  const candidate = asRecord(user);
  if (!candidate) {
    throw new ProviderWorkspaceError(401, "authentication_required", "Authentication required");
  }
  if (candidate.active !== true) {
    throw new ProviderWorkspaceError(403, "inactive_account", "Provider account is inactive");
  }

  const role = candidate.role;
  if (role !== "provider_manager" && role !== "provider_staff") {
    throw new ProviderWorkspaceError(
      403,
      "provider_role_required",
      "Identifiable provider requests require a provider role",
    );
  }

  const userId = relationshipId(candidate.id);
  const organisationId = relationshipId(candidate.organisation);
  if (!userId || !organisationId) {
    throw new ProviderWorkspaceError(
      403,
      "invalid_provider_scope",
      "Provider account is missing required organisation scope",
    );
  }

  return requireAuthenticatedActor({ userId, role, organisationId });
}

export async function authenticateProviderActor(
  payload: Payload,
  headers: Headers,
): Promise<AuthenticatedActor> {
  const { user } = await payload.auth({ headers });
  if (!user) {
    throw new ProviderWorkspaceError(401, "authentication_required", "Authentication required");
  }
  return providerActorFromPayloadUser(user);
}
