import type { CollectionConfig } from "payload";

export const ProviderOrganisations: CollectionConfig = {
  slug: "provider-organisations",
  admin: { useAsTitle: "name" },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
  ],
};
