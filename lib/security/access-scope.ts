export type TalkPointRole =
  | "super_admin"
  | "platform_admin"
  | "provider_manager"
  | "provider_staff";

export type ActorScope = {
  userId: string;
  role: TalkPointRole;
  organisationId?: string;
};

export function assertValidActorScope(actor: ActorScope): void {
  const platformRole = actor.role === "super_admin" || actor.role === "platform_admin";
  if (platformRole && actor.organisationId) {
    throw new Error("Platform roles must not inherit provider organisation scope");
  }
  if (!platformRole && !actor.organisationId) {
    throw new Error("Provider roles require an organisation scope");
  }
}

export function canAccessIdentifiableProviderRequest(
  actor: ActorScope,
  requestOrganisationId: string,
): boolean {
  assertValidActorScope(actor);
  if (actor.role === "super_admin" || actor.role === "platform_admin") return false;
  return actor.organisationId === requestOrganisationId;
}
