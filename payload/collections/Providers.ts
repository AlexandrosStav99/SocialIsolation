import type { CollectionConfig } from "payload";
import { isSuperAdminUser } from "../access.ts";
import { productionDirectorySourceTypes } from "../../lib/directory/production-metadata.ts";

export const Providers: CollectionConfig = {
  slug: "providers",
  admin: { useAsTitle: "name" },
  fields: [
    { name: "organisation", type: "relationship", relationTo: "provider-organisations" },
    { name: "name", type: "text", required: true },
    {
      name: "providerType",
      type: "select",
      required: true,
      options: ["ngo_nonprofit","public_community","mental_health_counselling","university_student","helpline_immediate_support"],
    },
    { name: "informationSource", type: "text", required: true },
    { name: "informationCheckedAt", type: "date", required: true },
    {
      name: "productionDirectoryVerified",
      type: "checkbox",
      defaultValue: false,
      access: {
        create: ({ req }) => isSuperAdminUser(req.user),
        update: ({ req }) => isSuperAdminUser(req.user),
      },
      admin: {
        description:
          "Content-verification gate only. Does not imply a partnership or permission for assisted contact.",
      },
    },
    {
      name: "productionDirectorySuppressed",
      type: "checkbox",
      defaultValue: true,
      access: {
        create: ({ req }) => isSuperAdminUser(req.user),
        update: ({ req }) => isSuperAdminUser(req.user),
      },
      admin: {
        description:
          "Fail-closed suppression gate. New/existing records remain suppressed until explicitly released.",
      },
    },
    {
      name: "productionDirectorySourceType",
      type: "select",
      options: [...productionDirectorySourceTypes],
      access: {
        create: ({ req }) => isSuperAdminUser(req.user),
        update: ({ req }) => isSuperAdminUser(req.user),
      },
      admin: {
        description:
          "Provenance category for production directory eligibility. Provider confirmation verifies data only; it does not imply pilot participation.",
      },
    },
    {
      name: "productionDirectoryNextReviewAt",
      type: "date",
      index: true,
      access: {
        create: ({ req }) => isSuperAdminUser(req.user),
        update: ({ req }) => isSuperAdminUser(req.user),
      },
      admin: {
        description:
          "Required for production eligibility. Once this time passes, the provider fails closed out of the public production directory.",
      },
    },
  ],
};
