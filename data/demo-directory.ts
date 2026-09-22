import type { ProviderDirectoryRecord, ServiceDirectoryRecord } from "@/lib/directory/contracts";

export const DEMO_INFORMATION_SOURCE = "Synthetic university demonstration record";
export const DEMO_INFORMATION_CHECKED_AT = new Date("2026-09-20T00:00:00Z");

// Synthetic records only. They prove the directory shape without implying partnerships or checked real-world information.
// Coverage is intentionally incomplete so the required no-match recovery path remains demonstrable.
export const demoProviders: ProviderDirectoryRecord[] = [
  {
    id: "demo-community-provider",
    name: "Demonstration Community Service",
    type: "public_community",
    information: { source: DEMO_INFORMATION_SOURCE, checkedAt: DEMO_INFORMATION_CHECKED_AT },
  },
  {
    id: "demo-student-provider",
    name: "Demonstration Student Support",
    type: "university_student",
    information: { source: DEMO_INFORMATION_SOURCE, checkedAt: DEMO_INFORMATION_CHECKED_AT },
  },
];

export const demoServices: ServiceDirectoryRecord[] = [
  {
    id: "demo-community-online",
    providerId: "demo-community-provider",
    name: "Demonstration Community Support",
    topics: ["social_connection", "family_relationships"],
    coverage: ["anywhere_cyprus", "online"],
    languages: ["el", "en"],
    deliveryModes: ["online", "phone"],
    eligibility: ["Adults 18–30 for demonstration purposes"],
    contactChannels: ["Demo contact channel"],
    availability: "Demonstration hours only",
    immediateSupportCapable: false,
    integrated: true,
    information: { source: DEMO_INFORMATION_SOURCE, checkedAt: DEMO_INFORMATION_CHECKED_AT },
  },
  {
    id: "demo-student-online",
    providerId: "demo-student-provider",
    name: "Demonstration Student Navigation",
    topics: ["education_student", "emotional_wellbeing"],
    coverage: ["online"],
    languages: ["el", "en"],
    deliveryModes: ["online"],
    eligibility: ["Student status required in a future real service"],
    contactChannels: ["Demo contact channel"],
    immediateSupportCapable: false,
    integrated: false,
    information: { source: DEMO_INFORMATION_SOURCE, checkedAt: DEMO_INFORMATION_CHECKED_AT },
  },
];
