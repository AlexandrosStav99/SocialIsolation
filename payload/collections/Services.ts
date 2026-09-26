import type { CollectionConfig } from "payload";
import { isSuperAdminUser } from "../access.ts";
import { serviceAreas, supportTopics } from "../../lib/domain/data-boundaries.ts";

export const Services: CollectionConfig = {
  slug: "services",
  admin: { useAsTitle: "name" },
  fields: [
    { name: "provider", type: "relationship", relationTo: "providers", required: true },
    { name: "name", type: "text", required: true },
    { name: "topics", type: "select", hasMany: true, required: true, options: [...supportTopics] },
    { name: "coverage", type: "select", hasMany: true, required: true, options: [...serviceAreas] },
    { name: "languages", type: "select", hasMany: true, required: true, options: ["el","en"] },
    { name: "deliveryModes", type: "select", hasMany: true, required: true, options: ["online","in_person","phone"] },
    { name: "eligibility", type: "text", hasMany: true },
    { name: "contactChannels", type: "text", hasMany: true },
    { name: "availability", type: "text" },
    { name: "immediateSupportCapable", type: "checkbox", required: true, defaultValue: false },
    { name: "integrated", type: "checkbox", required: true, defaultValue: false },
    { name: "productionHandoffEnabled", type: "checkbox", required: true, defaultValue: false, access: { create: ({ req }) => isSuperAdminUser(req.user), update: ({ req }) => isSuperAdminUser(req.user) }, admin: { description: "Fail-closed production gate. Enable only for a provider/service with approved live assisted-contact participation." } },
    { name: "productionHandoffProvider", type: "relationship", relationTo: "providers", access: { create: ({ req }) => isSuperAdminUser(req.user), update: ({ req }) => isSuperAdminUser(req.user) }, admin: { description: "Approved production provider record. Must match the service provider; mismatches fail closed." } },
    { name: "productionHandoffOrganisation", type: "relationship", relationTo: "provider-organisations", access: { create: ({ req }) => isSuperAdminUser(req.user), update: ({ req }) => isSuperAdminUser(req.user) }, admin: { description: "Approved production recipient organisation. Must match the selected provider organisation; mismatches fail closed." } },
    { name: "informationSource", type: "text", required: true },
    { name: "informationCheckedAt", type: "date", required: true },
  ],
};
