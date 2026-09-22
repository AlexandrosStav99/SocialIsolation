import type { SupportTopic } from "@/lib/domain/data-boundaries";

export type BilingualLabel = { en: string; el: string };

export const supportTaxonomyV1: ReadonlyArray<{
  id: SupportTopic;
  label: BilingualLabel;
}> = [
  { id: "social_connection", label: { en: "Loneliness & Social Connection", el: "Μοναξιά & Κοινωνική Σύνδεση" } },
  { id: "emotional_wellbeing", label: { en: "Emotional & Mental Wellbeing", el: "Συναισθηματική & Ψυχική Ευεξία" } },
  { id: "family_relationships", label: { en: "Family & Relationships", el: "Οικογένεια & Σχέσεις" } },
  { id: "work_unemployment", label: { en: "Work & Unemployment", el: "Εργασία & Ανεργία" } },
  { id: "financial_basic_needs", label: { en: "Financial & Basic Needs", el: "Οικονομικά & Βασικές Ανάγκες" } },
  { id: "housing_living", label: { en: "Housing & Living Situation", el: "Στέγαση & Συνθήκες Διαβίωσης" } },
  { id: "personal_safety", label: { en: "Abuse, Violence & Personal Safety", el: "Κακοποίηση, Βία & Προσωπική Ασφάλεια" } },
  { id: "education_student", label: { en: "Education & Student Support", el: "Εκπαίδευση & Φοιτητική Υποστήριξη" } },
  { id: "other_unsure", label: { en: "Something else / I’m not sure", el: "Κάτι άλλο / Δεν είμαι σίγουρος/η" } },
];

export const TAXONOMY_VERSION = "1";
