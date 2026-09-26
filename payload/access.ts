import type { Access, CollectionConfig } from "payload";

const PLATFORM_ROLES = new Set(["super_admin", "platform_admin"]);

type UserLike = {
  id?: string | number;
  role?: string | null;
};

function getUser(user: unknown): UserLike | null {
  if (!user || typeof user !== "object") return null;
  return user as UserLike;
}

export function isPlatformAdminUser(user: unknown): boolean {
  const role = getUser(user)?.role;
  return typeof role === "string" && PLATFORM_ROLES.has(role);
}

export function isSuperAdminUser(user: unknown): boolean {
  return getUser(user)?.role === "super_admin";
}

const platformAdminOnly: Access = ({ req }) => isPlatformAdminUser(req.user);
const superAdminOnly: Access = ({ req }) => isSuperAdminUser(req.user);
const denyExternalAccess: Access = () => false;

const readSelfOrSuperAdmin: Access = ({ req }) => {
  if (isSuperAdminUser(req.user)) return true;
  const id = getUser(req.user)?.id;
  if (id === undefined || id === null) return false;
  return { id: { equals: id } };
};

const createProviderUser: Access = async ({ req, data }) => {
  if (isSuperAdminUser(req.user)) return true;
  if (req.user) return false;

  const count = await req.payload.count({
    collection: "provider-users",
    overrideAccess: true,
  });
  if (count.totalDocs !== 0) return false;

  // During Payload's access-operation check there is no create payload yet.
  if (!data) return true;

  const candidate = data as Record<string, unknown>;
  return candidate.role === "super_admin" && !candidate.organisation;
};

export function platformManagedCollection(
  collection: CollectionConfig,
  group = "Directory",
): CollectionConfig {
  return {
    ...collection,
    admin: {
      ...collection.admin,
      group,
    },
    access: {
      ...collection.access,
      create: platformAdminOnly,
      read: platformAdminOnly,
      update: platformAdminOnly,
      delete: platformAdminOnly,
    },
  };
}

export function providerUserAdminCollection(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    admin: {
      ...collection.admin,
      group: "Access",
    },
    access: {
      ...collection.access,
      admin: ({ req }) => isPlatformAdminUser(req.user),
      create: createProviderUser,
      read: readSelfOrSuperAdmin,
      update: superAdminOnly,
      delete: superAdminOnly,
      unlock: ({ req }) => isSuperAdminUser(req.user),
    },
  };
}

export function hiddenSystemCollection(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    admin: {
      ...collection.admin,
      hidden: true,
    },
    access: {
      ...collection.access,
      create: denyExternalAccess,
      read: denyExternalAccess,
      update: denyExternalAccess,
      delete: denyExternalAccess,
    },
  };
}
