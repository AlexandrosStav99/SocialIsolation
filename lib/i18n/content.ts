export const supportedLanguages=["en","el"] as const;
export type SupportedLanguage=(typeof supportedLanguages)[number];
export const checkInContent={
 en:{title:"Check-in Demonstration",status:"Prewritten replies · fictional text only",conversation:"Demo conversation",input:"Fictional demo message",placeholder:"Enter fictional text to preview the interface",send:"Send demo message",latest:"Scroll to latest message",helpNow:"I need help now",empty:"No messages yet.",loading:"Loading…",noMatch:"No matching services were found. You can change your area or preferences, or browse the directory."},
 el:{title:"Επίδειξη check-in",status:"Προκαθορισμένες απαντήσεις · μόνο φανταστικό κείμενο",conversation:"Συνομιλία επίδειξης",input:"Φανταστικό μήνυμα επίδειξης",placeholder:"Γράψε φανταστικό κείμενο για προεπισκόπηση της διεπαφής",send:"Αποστολή μηνύματος επίδειξης",latest:"Μετάβαση στο πιο πρόσφατο μήνυμα",helpNow:"Χρειάζομαι βοήθεια τώρα",empty:"Δεν υπάρχουν ακόμη μηνύματα.",loading:"Φόρτωση…",noMatch:"Δεν βρέθηκαν σχετικές υπηρεσίες. Μπορείς να αλλάξεις περιοχή ή προτιμήσεις ή να δεις τον κατάλογο."}
} as const;
