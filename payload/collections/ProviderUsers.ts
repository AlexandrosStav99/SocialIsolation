import type { CollectionConfig, PayloadRequest } from "payload";
import { getRuntimeMode } from "../../lib/config/server.ts";

const PLATFORM_ROLES = new Set(["super_admin", "platform_admin"]);
const PASSWORD_MIN_LENGTH = 12;
const TOKEN_EXPIRATION_SECONDS = 8 * 60 * 60;
const LOCK_TIME_MS = 15 * 60 * 1000;
const RESET_TOKEN_EXPIRATION_MS = 30 * 60 * 1000;
const RESET_REQUEST_INTERVAL_MS = 60 * 1000;

function relationshipId(value: unknown): string | number | null {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return null;
}

async function preventLastActiveSuperAdminRemoval(
  req: PayloadRequest,
  originalDoc: Record<string, unknown>,
  nextRole: unknown,
  nextActive: unknown,
) {
  if (
    originalDoc.role !== "super_admin" ||
    originalDoc.active === false ||
    (nextRole === "super_admin" && nextActive !== false)
  ) {
    return;
  }

  const count = await req.payload.count({
    collection: "provider-users",
    where: {
      and: [{ role: { equals: "super_admin" } }, { active: { equals: true } }],
    },
    overrideAccess: true,
  });

  if (count.totalDocs <= 1) {
    throw new Error("The final active super admin cannot be deactivated or demoted");
  }
}

export const ProviderUsers: CollectionConfig = {
  slug: "provider-users",
  auth: {
    tokenExpiration: TOKEN_EXPIRATION_SECONDS,
    maxLoginAttempts: 5,
    lockTime: LOCK_TIME_MS,
    removeTokenFromResponses: true,
    useSessions: true,
    useAPIKey: false,
    cookies: {
      secure: getRuntimeMode() === "production",
      sameSite: "Lax",
    },
    forgotPassword: {
      expiration: RESET_TOKEN_EXPIRATION_MS,
      minRequestInterval: RESET_REQUEST_INTERVAL_MS,
    },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "organisation", "active"],
  },
  fields: [
    {
      name: "password",
      type: "text",
      hidden: true,
      minLength: PASSWORD_MIN_LENGTH,
    },
    {
      name: "role",
      type: "select",
      required: true,
      saveToJWT: true,
      options: ["super_admin", "platform_admin", "provider_manager", "provider_staff"],
    },
    {
      name: "organisation",
      type: "relationship",
      relationTo: "provider-organisations",
      saveToJWT: true,
    },
    {
      name: "active",
      type: "checkbox",
      required: true,
      defaultValue: false,
      saveToJWT: true,
      admin: {
        position: "sidebar",
        description:
          "Inactive accounts cannot log in. New accounts created by an administrator default to inactive.",
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, operation, req }) => {
        if (!data) return data;

        if (operation === "create") {
          // The anonymous path is available only for the guarded first-user bootstrap.
          // Force that first super admin active; subsequent admin-created accounts are
          // intentionally inactive unless a super admin explicitly activates them.
          data.active = req.user ? data.active === true : true;
        }

        const role = data.role ?? originalDoc?.role;
        const organisation =
          data.organisation !== undefined ? data.organisation : originalDoc?.organisation;
        const active = data.active !== undefined ? data.active : originalDoc?.active;

        const platform = typeof role === "string" && PLATFORM_ROLES.has(role);
        if (platform && relationshipId(organisation) !== null) {
          throw new Error("Platform roles must not have provider organisation scope");
        }
        if (!platform && relationshipId(organisation) === null) {
          throw new Error("Provider roles require organisation scope");
        }

        if (operation === "update" && originalDoc) {
          await preventLastActiveSuperAdminRemoval(
            req,
            originalDoc as Record<string, unknown>,
            role,
            active,
          );
        }

        return data;
      },
    ],
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation !== "update" || !originalDoc) return data;

        const roleChanged = data.role !== undefined && data.role !== originalDoc.role;
        const organisationChanged =
          data.organisation !== undefined &&
          relationshipId(data.organisation) !== relationshipId(originalDoc.organisation);
        const activeChanged =
          data.active !== undefined && Boolean(data.active) !== Boolean(originalDoc.active);

        // Role, organisation and activation changes are security-boundary changes.
        // Clear every existing session so stale JWT claims cannot retain old authority.
        if (roleChanged || organisationChanged || activeChanged) {
          (data as Record<string, unknown>).sessions = [];
        }

        return data;
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (user.active !== true) {
          throw new Error("This account is inactive");
        }
        return user;
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({
          collection: "provider-users",
          id,
          depth: 0,
          overrideAccess: true,
        });

        if (doc.role !== "super_admin" || doc.active === false) return;

        const count = await req.payload.count({
          collection: "provider-users",
          where: {
            and: [{ role: { equals: "super_admin" } }, { active: { equals: true } }],
          },
          overrideAccess: true,
        });

        if (count.totalDocs <= 1) {
          throw new Error("The final active super admin cannot be deleted");
        }
      },
    ],
  },
};
