import type { ServiceArea, SupportTopic } from "@/lib/domain/data-boundaries";

export type ProviderType =
  | "ngo_nonprofit"
  | "public_community"
  | "mental_health_counselling"
  | "university_student"
  | "helpline_immediate_support";

export type InformationCheck = {
  source: string;
  checkedAt: Date;
};

export type ProviderDirectoryRecord = {
  id: string;
  organisationId?: string;
  name: string;
  type: ProviderType;
  information: InformationCheck;
};

export type ServiceDirectoryRecord = {
  id: string;
  providerId: string;
  name: string;
  topics: SupportTopic[];
  coverage: ServiceArea[];
  languages: ("el" | "en")[];
  deliveryModes: ("online" | "in_person" | "phone")[];
  eligibility: string[];
  contactChannels: string[];
  availability?: string;
  immediateSupportCapable: boolean;
  integrated: boolean;
  information: InformationCheck;
};
