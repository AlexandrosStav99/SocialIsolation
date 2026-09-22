import type { ConversationLanguage, ConversationPrompt, ConversationStage } from "./types";

const prompts: Record<ConversationLanguage, Record<ConversationStage, ConversationPrompt>> = {
  en: {
    age_gate: {
      stage: "age_gate",
      heading: "A quick check before we start",
      body: "This TalkPoint check-in is for adults aged 18 or over.",
    },
    primary_topic: {
      stage: "primary_topic",
      heading: "What feels most important right now?",
      body: "Choose the one area that comes closest. It does not have to describe everything.",
    },
    secondary_topics: {
      stage: "secondary_topics",
      heading: "Is there anything else connected to this?",
      body: "Choose up to two, or continue without adding anything.",
      allowSkip: true,
    },
    optional_context: {
      stage: "optional_context",
      heading: "Would a little more context help?",
      body: "Optional. This text stays in the check-in and is not shared in this demonstration. Please do not include names, contact details or other identifying information.",
      freeTextLimit: 500,
      allowSkip: true,
    },
    service_area: {
      stage: "service_area",
      heading: "Where would you prefer to find support?",
      body: "Choose an area, anywhere in Cyprus, or online. We do not ask for your exact location.",
    },
    preferences: {
      stage: "preferences",
      heading: "Support preferences",
      body: "Only preferences that genuinely affect service discovery should be shown here.",
      allowSkip: true,
    },
    review: {
      stage: "review",
      heading: "Does this look right?",
      body: "These are the main choices TalkPoint will use to find relevant services.",
    },
    complete: { stage: "complete", heading: "Relevant services to explore" },
    ended: { stage: "ended", heading: "Check-in ended" },
  },
  el: {
    age_gate: {
      stage: "age_gate",
      heading: "Ένας γρήγορος έλεγχος πριν ξεκινήσουμε",
      body: "Αυτό το check-in του TalkPoint απευθύνεται σε ενήλικες 18 ετών και άνω.",
    },
    primary_topic: {
      stage: "primary_topic",
      heading: "Τι σε απασχολεί περισσότερο αυτή τη στιγμή;",
      body: "Διάλεξε το θέμα που πλησιάζει περισσότερο σε αυτό που χρειάζεσαι. Δεν χρειάζεται να περιγράφει τα πάντα.",
    },
    secondary_topics: {
      stage: "secondary_topics",
      heading: "Υπάρχει κάτι άλλο που συνδέεται με αυτό;",
      body: "Μπορείς να επιλέξεις μέχρι δύο ή να συνεχίσεις χωρίς άλλη επιλογή.",
      allowSkip: true,
    },
    optional_context: {
      stage: "optional_context",
      heading: "Θα βοηθούσε λίγο περισσότερο πλαίσιο;",
      body: "Προαιρετικό. Αυτό το κείμενο παραμένει στο check-in και δεν κοινοποιείται σε αυτή την επίδειξη. Μην συμπεριλάβεις ονόματα, στοιχεία επικοινωνίας ή άλλες πληροφορίες που μπορούν να σε ταυτοποιήσουν.",
      freeTextLimit: 500,
      allowSkip: true,
    },
    service_area: {
      stage: "service_area",
      heading: "Πού θα προτιμούσες να βρεις υποστήριξη;",
      body: "Διάλεξε περιοχή, οπουδήποτε στην Κύπρο ή online. Δεν ζητάμε την ακριβή τοποθεσία σου.",
    },
    preferences: {
      stage: "preferences",
      heading: "Προτιμήσεις υποστήριξης",
      body: "Εδώ πρέπει να εμφανίζονται μόνο προτιμήσεις που επηρεάζουν πραγματικά την εύρεση υπηρεσιών.",
      allowSkip: true,
    },
    review: {
      stage: "review",
      heading: "Σου φαίνονται σωστά;",
      body: "Αυτές είναι οι βασικές επιλογές που θα χρησιμοποιήσει το TalkPoint για να βρει σχετικές υπηρεσίες.",
    },
    complete: { stage: "complete", heading: "Σχετικές υπηρεσίες για να εξερευνήσεις" },
    ended: { stage: "ended", heading: "Το check-in ολοκληρώθηκε" },
  },
};

export function getConversationPrompt(language: ConversationLanguage, stage: ConversationStage): ConversationPrompt {
  return prompts[language][stage];
}
