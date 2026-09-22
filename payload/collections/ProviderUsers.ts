import type { CollectionConfig } from "payload";

export const ProviderUsers: CollectionConfig = {
  slug: "provider-users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "organisation"],
  },
  fields: [
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
