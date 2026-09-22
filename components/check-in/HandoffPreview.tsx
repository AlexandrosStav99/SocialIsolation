"use client";

import { Check, LockKeyhole } from "lucide-react";
import type { ConversationLanguage } from "@/lib/conversation/types";

type HandoffPreviewProps = {
  language: ConversationLanguage;
  providerName: string;
  serviceName: string;
  primaryTopic: string;
  secondaryTopics: string[];
  serviceArea: string;
  consentAccepted: boolean;
  submitting: boolean;
  onConsentChange: (accepted: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function HandoffPreview({
  language,
  providerName,
  serviceName,
  primaryTopic,
  secondaryTopics,
  serviceArea,
  consentAccepted,
  submitting,
  onConsentChange,
  onConfirm,
  onCancel,
}: HandoffPreviewProps) {
  const en = language === "en";
  const primaryAction =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";
  const secondaryAction =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text transition hover:border-sage hover:bg-warm-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";

  const sharedItems = [
    en ? "Fictional demo email: fictional-user@example.invalid" : "Φανταστικό email επίδειξης: fictional-user@example.invalid",
    en ? `Main topic: ${primaryTopic}` : `Κύριο θέμα: ${primaryTopic}`,
    en
      ? `Related topics: ${secondaryTopics.length ? secondaryTopics.join(" · ") : "none selected"}`
      : `Σχετικά θέματα: ${secondaryTopics.length ? secondaryTopics.join(" · ") : "δεν επιλέχθηκαν"}`,
    en ? `Support area: ${serviceArea}` : `Περιοχή υποστήριξης: ${serviceArea}`,
    en
      ? "A synthetic controlled demonstration summary, not your private free text"
      : "Μια συνθετική ελεγχόμενη περίληψη επίδειξης, όχι το ιδιωτικό ελεύθερο κείμενό σου",
  ];

  const excludedItems = [
    en ? "Your optional private free text" : "Το προαιρετικό ιδιωτικό ελεύθερο κείμενό σου",
    en ? "The full check-in or conversation" : "Ολόκληρο το check-in ή η συνομιλία",
    en ? "Safety-route history" : "Το ιστορικό διαδρομής ασφάλειας",
    en ? "Other services you viewed" : "Άλλες υπηρεσίες που είδες",
    en ? "Real contact details or an exact location" : "Πραγματικά στοιχεία επικοινωνίας ή ακριβής τοποθεσία",
  ];

  return (
    <section
      aria-labelledby="sharing-preview-heading"
      aria-busy={submitting}
      className="mt-4 rounded-2xl border border-border bg-warm-bg/60 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <LockKeyhole size={20} className="mt-0.5 shrink-0 text-teal" aria-hidden="true" />
        <div>
          <h2 id="sharing-preview-heading" className="font-bold text-text">
            {en ? "Sharing preview" : "Προεπισκόπηση κοινοποίησης"}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {en
              ? "Review this before choosing whether to run the controlled assisted-handoff demo. Your anonymous session is not identified or linked to the fictional request; only the structured items listed below are copied into it."
              : "Δες τα παρακάτω πριν επιλέξεις αν θα εκτελέσεις την ελεγχόμενη επίδειξη υποβοηθούμενης παραπομπής. Η ανώνυμη συνεδρία σου δεν ταυτοποιείται ούτε συνδέεται με το φανταστικό αίτημα· αντιγράφονται μόνο τα δομημένα στοιχεία που αναφέρονται παρακάτω."}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            {en ? "Recipient" : "Παραλήπτης"}
          </dt>
          <dd className="mt-1 font-semibold text-text">{providerName}</dd>
          <dd className="mt-0.5 text-muted">{serviceName}</dd>
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            {en ? "Purpose" : "Σκοπός"}
          </dt>
          <dd className="mt-1 leading-relaxed text-text">
            {en
              ? "Demonstrate a user-directed provider contact request. No real contact attempt is made."
              : "Επίδειξη αιτήματος επικοινωνίας με πάροχο που ξεκινά ο χρήστης. Δεν γίνεται πραγματική προσπάθεια επικοινωνίας."}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="text-sm font-bold text-text">{en ? "What will be shared" : "Τι θα κοινοποιηθεί"}</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted">
            {sharedItems.map((item) => (
              <li key={item} className="flex gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-teal" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="text-sm font-bold text-text">{en ? "What will not be shared" : "Τι δεν θα κοινοποιηθεί"}</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-muted">
            {excludedItems.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-muted" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-white p-3 text-xs leading-relaxed text-muted">
        {en
          ? "Demonstration Data only. This demo can create a fictional request only for the service shown above, and only after you explicitly consent."
          : "Μόνο Δεδομένα Επίδειξης. Αυτή η επίδειξη μπορεί να δημιουργήσει φανταστικό αίτημα μόνο για την υπηρεσία που εμφανίζεται παραπάνω και μόνο αφού δώσεις ρητή συγκατάθεση."}
      </p>

      <label className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-white p-4 text-sm leading-relaxed text-text">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-teal"
          checked={consentAccepted}
          disabled={submitting}
          onChange={(event) => onConsentChange(event.target.checked)}
        />
        <span>
          {en
            ? `I explicitly consent to share the data listed above with ${providerName} for this provider-specific demonstration.`
            : `Συναινώ ρητά στην κοινοποίηση των παραπάνω δεδομένων με τον πάροχο ${providerName} για αυτή την επίδειξη που αφορά τον συγκεκριμένο πάροχο.`}
        </span>
      </label>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button type="button" className={secondaryAction} disabled={submitting} onClick={onCancel}>
          {en ? "Cancel and keep exploring" : "Ακύρωση και συνέχιση εξερεύνησης"}
        </button>
        <button type="button" className={primaryAction} disabled={!consentAccepted || submitting} onClick={onConfirm}>
          {submitting
            ? en
              ? "Running demo…"
              : "Εκτέλεση επίδειξης…"
            : en
              ? "Confirm and run demo"
              : "Επιβεβαίωση και εκτέλεση επίδειξης"}
        </button>
      </div>
    </section>
  );
}
