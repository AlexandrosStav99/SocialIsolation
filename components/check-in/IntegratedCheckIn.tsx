"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, LifeBuoy, LockKeyhole } from "lucide-react";
import { createConversation, transitionConversation } from "@/lib/conversation/engine";
import { getConversationPrompt } from "@/lib/conversation/prompts";
import type {
  ConversationAction,
  ConversationLanguage,
  ConversationStage,
  ConversationState,
} from "@/lib/conversation/types";
import {
  serviceAreas,
  supportTopics,
  type ServiceArea,
  type SupportTopic,
} from "@/lib/domain/data-boundaries";
import { discoverServices } from "@/lib/routing/discovery";
import { routeSafety } from "@/lib/safety/router";
import { demoServices } from "@/data/demo-directory";

const topicLabels: Record<ConversationLanguage, Record<SupportTopic, string>> = {
  en: {
    social_connection: "Loneliness & Social Connection",
    emotional_wellbeing: "Emotional & Mental Wellbeing",
    family_relationships: "Family & Relationships",
    work_unemployment: "Work & Unemployment",
    financial_basic_needs: "Financial & Basic Needs",
    housing_living: "Housing & Living Situation",
    personal_safety: "Abuse, Violence & Personal Safety",
    education_student: "Education & Student Support",
    other_unsure: "Something else / I’m not sure",
  },
  el: {
    social_connection: "Μοναξιά & Κοινωνική Σύνδεση",
    emotional_wellbeing: "Συναισθηματική & Ψυχική Ευεξία",
    family_relationships: "Οικογένεια & Σχέσεις",
    work_unemployment: "Εργασία & Ανεργία",
    financial_basic_needs: "Οικονομικά & Βασικές Ανάγκες",
    housing_living: "Στέγαση & Συνθήκες Διαβίωσης",
    personal_safety: "Κακοποίηση, Βία & Προσωπική Ασφάλεια",
    education_student: "Εκπαίδευση & Φοιτητική Υποστήριξη",
    other_unsure: "Κάτι άλλο / Δεν είμαι σίγουρος/η",
  },
};

const areaLabels: Record<ConversationLanguage, Record<ServiceArea, string>> = {
  en: {
    nicosia: "Nicosia",
    limassol: "Limassol",
    larnaca: "Larnaca",
    paphos: "Paphos",
    famagusta: "Famagusta",
    anywhere_cyprus: "Anywhere in Cyprus",
    online: "Online",
  },
  el: {
    nicosia: "Λευκωσία",
    limassol: "Λεμεσός",
    larnaca: "Λάρνακα",
    paphos: "Πάφος",
    famagusta: "Αμμόχωστος",
    anywhere_cyprus: "Οπουδήποτε στην Κύπρο",
    online: "Online",
  },
};

const stageLabels: Record<ConversationLanguage, Partial<Record<ConversationStage, string>>> = {
  en: {
    primary_topic: "What matters",
    secondary_topics: "Anything else",
    optional_context: "Optional context",
    service_area: "Where support works",
    review: "Review",
  },
  el: {
    primary_topic: "Τι έχει σημασία",
    secondary_topics: "Κάτι ακόμη",
    optional_context: "Προαιρετικό πλαίσιο",
    service_area: "Πού σε εξυπηρετεί",
    review: "Έλεγχος",
  },
};

const progressByStage: Partial<Record<ConversationStage, number>> = {
  primary_topic: 0,
  secondary_topics: 1,
  optional_context: 2,
  service_area: 3,
  review: 4,
};

const previousStage: Partial<Record<ConversationStage, ConversationStage>> = {
  primary_topic: "age_gate",
  secondary_topics: "primary_topic",
  optional_context: "secondary_topics",
  service_area: "optional_context",
  preferences: "service_area",
  review: "service_area",
};

export default function IntegratedCheckIn() {
  const [language, setLanguage] = useState<ConversationLanguage>("en");
  const [state, setState] = useState<ConversationState>(() => createConversation(crypto.randomUUID(), "en"));
  const [secondary, setSecondary] = useState<SupportTopic[]>([]);
  const [text, setText] = useState("");
  const [demoStatus, setDemoStatus] = useState("");
  const [pendingDemo, setPendingDemo] = useState<{ serviceId: string } | null>(null);
  const [demoConsent, setDemoConsent] = useState(false);
  const [safetySignal, setSafetySignal] = useState(false);

  const prompt = getConversationPrompt(language, state.stage);
  const safety = routeSafety({ explicitSignals: safetySignal ? ["user_requests_help_now"] : [] });
  const currentProgress = progressByStage[state.stage];
  const canGoBack = Boolean(previousStage[state.stage]);

  const results = useMemo(
    () =>
      state.stage === "complete" && state.primarySupportTopic && state.serviceArea
        ? discoverServices(demoServices, {
            primaryTopic: state.primarySupportTopic,
            secondaryTopics: state.secondarySupportTopics,
            serviceArea: state.serviceArea,
            preferredLanguages: [language],
          })
        : null,
    [state, language],
  );

  function dispatch(action: ConversationAction) {
    setState((current) => {
      let next = transitionConversation({ ...current, language }, action);

      // Preferences remain part of the deterministic state machine, but the MVP currently
      // exposes no genuine preference choices. Skip the empty user-facing stage rather than
      // asking for a meaningless extra click.
      if (next.stage === "preferences") {
        next = transitionConversation(next, { type: "set_preferences", preferences: [] });
      }

      return next;
    });
  }

  function changeLanguage(nextLanguage: ConversationLanguage) {
    setLanguage(nextLanguage);
    setState((current) => ({ ...current, language: nextLanguage }));
  }

  function reset() {
    setSecondary([]);
    setText("");
    setDemoStatus("");
    setPendingDemo(null);
    setDemoConsent(false);
    setSafetySignal(false);
    setState(createConversation(crypto.randomUUID(), language));
  }

  function goBack() {
    const target = previousStage[state.stage];
    if (!target) return;

    if (target === "secondary_topics") {
      setSecondary(state.secondarySupportTopics);
    }

    setPendingDemo(null);
    setDemoConsent(false);
    setDemoStatus("");
    setState((current) => ({ ...current, stage: target }));
  }

  function selectPrimaryTopic(topic: SupportTopic) {
    setSecondary(topic === state.primarySupportTopic ? state.secondarySupportTopics : []);
    dispatch({ type: "select_primary_topic", topic });
  }

  function submitReview() {
    dispatch({ type: "confirm_review" });
    setText("");
  }

  function endSession() {
    dispatch({ type: "end_session" });
    setText("");
    setSecondary([]);
    setPendingDemo(null);
    setDemoConsent(false);
    setDemoStatus("");
  }

  async function runDemoHandoff() {
    if (!pendingDemo || !demoConsent || !state.primarySupportTopic || !state.serviceArea) return;

    setDemoStatus(language === "en" ? "Running controlled handoff…" : "Εκτέλεση ελεγχόμενης επίδειξης…");
    const response = await fetch("/api/demo-handoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: pendingDemo.serviceId,
        consentAccepted: true,
        primarySupportTopic: state.primarySupportTopic,
        secondarySupportTopics: state.secondarySupportTopics,
        serviceArea: state.serviceArea,
      }),
    });
    const data = (await response.json()) as {
      requestCreated?: boolean;
      queueVisible?: boolean;
      status?: string;
      realRequestSent?: boolean;
    };

    setDemoStatus(
      response.ok && data.requestCreated && data.queueVisible && data.realRequestSent === false
        ? language === "en"
          ? `Demo handoff completed. Provider queue status: ${data.status}. No real request was sent.`
          : `Η επίδειξη handoff ολοκληρώθηκε. Κατάσταση ουράς παρόχου: ${data.status}. Δεν στάλθηκε πραγματικό αίτημα.`
        : language === "en"
          ? "Demo handoff could not be completed."
          : "Η επίδειξη handoff δεν ολοκληρώθηκε.",
    );
  }

  const primaryAction =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";
  const quietAction =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2";
  const choiceClass = (selected = false, disabled = false) =>
    `group flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 ${
      selected ? "border-teal bg-warm-surface text-text" : "border-border bg-white text-text hover:border-sage hover:bg-warm-bg"
    } ${disabled ? "cursor-not-allowed opacity-45" : ""}`;

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-warm-bg px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs leading-relaxed text-muted">
            <LockKeyhole size={14} className="shrink-0 text-teal" aria-hidden="true" />
            <span>
              {language === "en"
                ? "University demonstration · synthetic services only"
                : "Πανεπιστημιακή επίδειξη · μόνο συνθετικές υπηρεσίες"}
            </span>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-white p-1" aria-label={language === "en" ? "Language" : "Γλώσσα"}>
            {(["en", "el"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeLanguage(option)}
                aria-pressed={language === option}
                className={`min-h-9 rounded-lg px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
                  language === option ? "bg-teal text-white" : "text-muted hover:bg-warm-bg"
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            onClick={() => setSafetySignal(true)}
          >
            <LifeBuoy size={16} aria-hidden="true" />
            {language === "en" ? "I need help now" : "Χρειάζομαι βοήθεια τώρα"}
          </button>
        </div>

        {safety.state === "immediate_support" && (
          <div role="status" className="mb-5 rounded-2xl border border-clay/60 bg-white p-4 text-sm leading-relaxed text-text shadow-sm">
            <p className="font-semibold">{language === "en" ? "Immediate support" : "Άμεση υποστήριξη"}</p>
            <p className="mt-1 text-muted">
              {language === "en"
                ? "TalkPoint does not provide emergency or clinical services. Immediate-support wording and Cyprus resources require domain-expert validation before real use."
                : "Το TalkPoint δεν παρέχει υπηρεσίες έκτακτης ανάγκης ή κλινικές υπηρεσίες. Η διατύπωση και οι πόροι άμεσης υποστήριξης στην Κύπρο απαιτούν επικύρωση από ειδικό πριν από πραγματική χρήση."}
            </p>
          </div>
        )}
        <span className="sr-only">Safety route: {safety.state}</span>

        <section className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
          {currentProgress !== undefined && (
            <div className="border-b border-border/70 px-5 py-4 sm:px-7" aria-label={language === "en" ? "Check-in progress" : "Πρόοδος check-in"}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{stageLabels[language][state.stage]}</p>
                <p className="text-xs text-muted">
                  {language === "en" ? "A few short choices" : "Μερικές σύντομες επιλογές"}
                </p>
              </div>
              <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((step) => (
                  <span key={step} className={`h-1.5 rounded-full ${step <= currentProgress ? "bg-teal" : "bg-warm-surface"}`} />
                ))}
              </div>
            </div>
          )}

          <div className="p-5 sm:p-7">
            {canGoBack && (
              <button type="button" onClick={goBack} className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal">
                <ArrowLeft size={16} aria-hidden="true" />
                {language === "en" ? "Back" : "Πίσω"}
              </button>
            )}

            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold leading-tight text-text sm:text-3xl">{prompt.heading}</h1>
              {prompt.body && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{prompt.body}</p>}
            </div>

            <div className="mt-7 grid gap-3">
              {state.stage === "age_gate" && (
                <>
                  <button className={choiceClass()} onClick={() => dispatch({ type: "confirm_age", confirmed: true })}>
                    <span>{language === "en" ? "Yes, I’m 18 or over" : "Ναι, είμαι 18 ετών ή άνω"}</span>
                    <ChevronRight size={17} className="shrink-0 text-sage transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                  <button className={choiceClass()} onClick={() => dispatch({ type: "confirm_age", confirmed: false })}>
                    <span>{language === "en" ? "No, I’m under 18" : "Όχι, είμαι κάτω των 18"}</span>
                    <ChevronRight size={17} className="shrink-0 text-sage transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {language === "en"
                      ? "No name or account is required to explore this demonstration."
                      : "Δεν χρειάζεται όνομα ή λογαριασμός για να εξερευνήσεις αυτή την επίδειξη."}
                  </p>
                </>
              )}

              {state.stage === "primary_topic" &&
                supportTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className={choiceClass(state.primarySupportTopic === topic)}
                    aria-pressed={state.primarySupportTopic === topic}
                    onClick={() => selectPrimaryTopic(topic)}
                  >
                    <span>{topicLabels[language][topic]}</span>
                    <ChevronRight size={17} className="shrink-0 text-sage transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                ))}

              {state.stage === "secondary_topics" && (
                <>
                  {supportTopics
                    .filter((topic) => topic !== state.primarySupportTopic)
                    .map((topic) => {
                      const selected = secondary.includes(topic);
                      const disabled = !selected && secondary.length >= 2;
                      return (
                        <label key={topic} className={choiceClass(selected, disabled)}>
                          <span className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 shrink-0 accent-teal"
                              checked={selected}
                              disabled={disabled}
                              onChange={(event) =>
                                setSecondary((current) =>
                                  event.target.checked ? [...current, topic] : current.filter((item) => item !== topic),
                                )
                              }
                            />
                            <span>{topicLabels[language][topic]}</span>
                          </span>
                          {selected && <Check size={17} className="shrink-0 text-teal" aria-hidden="true" />}
                        </label>
                      );
                    })}
                  <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted">
                      {language === "en"
                        ? `${secondary.length} of 2 selected`
                        : `${secondary.length} από 2 επιλεγμένα`}
                    </p>
                    <button
                      className={primaryAction}
                      onClick={() => dispatch({ type: "select_secondary_topics", topics: secondary })}
                    >
                      {secondary.length
                        ? language === "en"
                          ? "Continue"
                          : "Συνέχεια"
                        : language === "en"
                          ? "Nothing else"
                          : "Τίποτα άλλο"}
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}

              {state.stage === "optional_context" && (
                <>
                  <div className="rounded-2xl border border-border bg-warm-bg/60 p-4">
                    <label className="text-sm font-semibold text-text" htmlFor="optional-context">
                      {language === "en" ? "In your own words (optional)" : "Με δικά σου λόγια (προαιρετικό)"}
                    </label>
                    <textarea
                      id="optional-context"
                      maxLength={500}
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      className="mt-3 min-h-32 w-full resize-y rounded-xl border border-border bg-white p-3 text-sm leading-relaxed text-text outline-none transition placeholder:text-muted/70 focus:border-teal focus:ring-2 focus:ring-teal/20"
                      placeholder={
                        language === "en"
                          ? "Add only what feels useful. Avoid names or identifying details."
                          : "Πρόσθεσε μόνο ό,τι θεωρείς χρήσιμο. Απόφυγε ονόματα ή στοιχεία ταυτοποίησης."
                      }
                    />
                    <div className="mt-2 flex flex-wrap items-start justify-between gap-2 text-xs text-muted">
                      <span>
                        {language === "en"
                          ? "This text stays in this check-in and is not shared in this demonstration."
                          : "Αυτό το κείμενο παραμένει σε αυτό το check-in και δεν κοινοποιείται στην επίδειξη."}
                      </span>
                      <span aria-live="polite">{text.length}/500</span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button className={primaryAction} onClick={() => dispatch({ type: "set_optional_context", text })}>
                      {text.trim()
                        ? language === "en"
                          ? "Continue"
                          : "Συνέχεια"
                        : language === "en"
                          ? "Skip this question"
                          : "Παράλειψη ερώτησης"}
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}

              {state.stage === "service_area" &&
                serviceAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    className={choiceClass(state.serviceArea === area)}
                    aria-pressed={state.serviceArea === area}
                    onClick={() => dispatch({ type: "select_service_area", area })}
                  >
                    <span>{areaLabels[language][area]}</span>
                    <ChevronRight size={17} className="shrink-0 text-sage transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                ))}

              {state.stage === "review" && (
                <>
                  <dl className="grid gap-3 rounded-2xl border border-border bg-warm-bg/60 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {language === "en" ? "Main topic" : "Κύριο θέμα"}
                      </dt>
                      <dd className="mt-1 font-semibold text-text">
                        {state.primarySupportTopic && topicLabels[language][state.primarySupportTopic]}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {language === "en" ? "Support area" : "Περιοχή υποστήριξης"}
                      </dt>
                      <dd className="mt-1 font-semibold text-text">
                        {state.serviceArea && areaLabels[language][state.serviceArea]}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex justify-end">
                    <button className={primaryAction} onClick={submitReview}>
                      {language === "en" ? "Explore relevant services" : "Δες σχετικές υπηρεσίες"}
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}

              {state.stage === "complete" && results?.kind === "matches" && (
                <div className="grid gap-4">
                  {results.services.map(({ service, reasons }) => (
                    <article key={service.id} className="rounded-2xl border border-border p-4 sm:p-5">
                      <h2 className="font-bold text-text">{service.name}</h2>
                      <p className="mt-2 text-xs leading-relaxed text-muted">{reasons.join(" · ")}</p>
                      <p className="mt-3 text-xs font-semibold text-teal">
                        {language === "en"
                          ? "Demonstration service. No real request will be sent."
                          : "Υπηρεσία επίδειξης. Δεν θα σταλεί πραγματικό αίτημα."}
                      </p>
                      {service.integrated && (
                        <button
                          className={`${primaryAction} mt-4`}
                          onClick={() => {
                            setPendingDemo({ serviceId: service.id });
                            setDemoConsent(false);
                            setDemoStatus("");
                          }}
                        >
                          {language === "en" ? "Run controlled handoff demo" : "Εκτέλεση ελεγχόμενης επίδειξης handoff"}
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}

              {pendingDemo && (
                <div className="mt-4 rounded-2xl border border-border bg-warm-bg/60 p-4 sm:p-5">
                  <h2 className="font-bold text-text">{language === "en" ? "Sharing preview" : "Προεπισκόπηση κοινοποίησης"}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {language === "en"
                      ? "Demonstration Data only. The selected service will receive a fictional .invalid email, your selected support topics and area, and a synthetic summary. No optional text or real contact data will be shared."
                      : "Μόνο Δεδομένα Επίδειξης. Η επιλεγμένη υπηρεσία θα λάβει ένα φανταστικό email .invalid, τα επιλεγμένα θέματα και την περιοχή σου, και μια συνθετική περίληψη. Δεν θα κοινοποιηθεί προαιρετικό κείμενο ή πραγματικό στοιχείο επικοινωνίας."}
                  </p>
                  <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-text">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-teal"
                      checked={demoConsent}
                      onChange={(event) => setDemoConsent(event.target.checked)}
                    />
                    <span>
                      {language === "en"
                        ? "I explicitly consent to run this fictional provider-specific demonstration."
                        : "Συναινώ ρητά στην εκτέλεση αυτής της φανταστικής επίδειξης για τον συγκεκριμένο πάροχο."}
                    </span>
                  </label>
                  <button className={`${primaryAction} mt-4`} disabled={!demoConsent} onClick={runDemoHandoff}>
                    {language === "en" ? "Confirm and run demo" : "Επιβεβαίωση και εκτέλεση επίδειξης"}
                  </button>
                </div>
              )}

              {demoStatus && <p role="status" className="mt-4 text-sm leading-relaxed text-text">{demoStatus}</p>}

              {state.stage === "complete" && results?.kind === "no_match" && (
                <div>
                  <p className="text-sm leading-relaxed text-muted">
                    {language === "en"
                      ? "No matching demonstration services were found. Change your area/topic or restart."
                      : "Δεν βρέθηκαν αντίστοιχες υπηρεσίες επίδειξης. Άλλαξε περιοχή/θέμα ή ξεκίνησε ξανά."}
                  </p>
                  <button className={`${primaryAction} mt-4`} onClick={reset}>
                    {language === "en" ? "Start again" : "Ξεκίνα ξανά"}
                  </button>
                </div>
              )}

              {state.stage === "ended" && (
                <div>
                  {state.ageConfirmed === false && (
                    <p className="mb-4 text-sm leading-relaxed text-muted">
                      {language === "en"
                        ? "This TalkPoint check-in is currently for adults aged 18 or over."
                        : "Αυτό το check-in του TalkPoint απευθύνεται προς το παρόν σε ενήλικες 18 ετών και άνω."}
                    </p>
                  )}
                  <button className={primaryAction} onClick={reset}>
                    {language === "en" ? "Start again" : "Ξεκίνα ξανά"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {state.stage !== "ended" && state.stage !== "complete" && (
          <div className="mt-4 flex justify-center">
            <button className={quietAction} onClick={endSession}>
              {language === "en" ? "End check-in" : "Τερματισμός check-in"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
