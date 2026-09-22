import type { CollectionConfig } from "payload";

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
  ],
};
