import type { CollectionConfig } from "payload";
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
    { name: "informationSource", type: "text", required: true },
    { name: "informationCheckedAt", type: "date", required: true },
  ],
};
