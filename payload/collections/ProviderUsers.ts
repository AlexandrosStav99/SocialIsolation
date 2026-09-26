import type { CollectionConfig } from "payload";

const PASSWORD_MIN_LENGTH = 12;
const SESSION_SECONDS = 60 * 60;
const LOCK_TIME_MS = 15 * 60 * 1000;
const RESET_TOKEN_MS = 30 * 60 * 1000;

export const ProviderUsers: CollectionConfig = {
  slug: "provider-users",
  auth: {
    tokenExpiration: SESSION_SECONDS,
    useSessions: true,
    removeTokenFromResponses: true,
    maxLoginAttempts: 5,
    lockTime: LOCK_TIME_MS,
    forgotPassword: {
      expiration: RESET_TOKEN_MS,
      minRequestInterval: 60_000,
    },
    cookies: {
      sameSite: "Strict",
      secure: process.env.TALKPOINT_RUNTIME_MODE === "production",
    },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "organisation"],
  },
  fields: [
    {
      name: "password",
      type: "text",
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
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        const platform = data.role === "super_admin" || data.role === "platform_admin";
        if (platform && data.organisation) {
          throw new Error("Platform roles must not have provider organisation scope");
        }
        if (!platform && !data.organisation) {
          throw new Error("Provider roles require organisation scope");
        }
        return data;
      },
    ],
  },
};
