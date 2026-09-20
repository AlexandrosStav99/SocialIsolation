import type { ConversationLanguage, ConversationPrompt, ConversationStage } from "./types";

const prompts: Record<ConversationLanguage, Record<ConversationStage, ConversationPrompt>> = {
  en: {
    age_gate: { stage: "age_gate", heading: "Before we begin", body: "TalkPoint is for adults aged 18 or over." },
    primary_topic: { stage: "primary_topic", heading: "What would you like support with today?" },
    secondary_topics: { stage: "secondary_topics", heading: "Is anything else relevant?", body: "You can choose up to two.", allowSkip: true },
    optional_context: { stage: "optional_context", heading: "Would you like to add a little more context?", body: "Optional. Please do not include names, contact details or other identifying information.", freeTextLimit: 500, allowSkip: true },
    service_area: { stage: "service_area", heading: "Which service area works for you?" },
    preferences: { stage: "preferences", heading: "Any support preferences?", allowSkip: true },
    review: { stage: "review", heading: "Check what you’ve told us" },
    complete: { stage: "complete", heading: "Ready to explore relevant services" },
    ended: { stage: "ended", heading: "Session ended" },
  },
  el: {
    age_gate: { stage: "age_gate", heading: "Πριν ξεκινήσουμε", body: "Το TalkPoint απευθύνεται σε ενήλικες 18 ετών και άνω." },
    primary_topic: { stage: "primary_topic", heading: "Για ποιο θέμα θα ήθελες υποστήριξη σήμερα;" },
    secondary_topics: { stage: "secondary_topics", heading: "Υπάρχει κάτι άλλο που σχετίζεται;", body: "Μπορείς να επιλέξεις μέχρι δύο.", allowSkip: true },
    optional_context: { stage: "optional_context", heading: "Θέλεις να προσθέσεις λίγο ακόμη πλαίσιο;", body: "Προαιρετικό. Μην συμπεριλάβεις ονόματα, στοιχεία επικοινωνίας ή άλλες πληροφορίες που μπορούν να σε ταυτοποιήσουν.", freeTextLimit: 500, allowSkip: true },
    service_area: { stage: "service_area", heading: "Ποια περιοχή εξυπηρέτησης σε βολεύει;" },
    preferences: { stage: "preferences", heading: "Έχεις κάποια προτίμηση για την υποστήριξη;", allowSkip: true },
    review: { stage: "review", heading: "Έλεγξε όσα μας είπες" },
    complete: { stage: "complete", heading: "Έτοιμος/η να δεις σχετικές υπηρεσίες" },
    ended: { stage: "ended", heading: "Η συνεδρία τερματίστηκε" },
  },
};

export function getConversationPrompt(language: ConversationLanguage, stage: ConversationStage): ConversationPrompt {
  return prompts[language][stage];
}
