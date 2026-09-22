"use client";

import { useEffect, useMemo, useState } from "react";
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
import type { ProviderDirectoryRecord, ServiceDirectoryRecord } from "@/lib/directory/contracts";
import { discoverServices } from "@/lib/routing/discovery";
import { routeSafety } from "@/lib/safety/router";
import { safetyContent } from "@/lib/safety/content";
import { demoProviders, demoServices } from "@/data/demo-directory";
import HandoffPreview from "./HandoffPreview";

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

const deliveryLabels: Record<
  ConversationLanguage,
  Record<ServiceDirectoryRecord["deliveryModes"][number], string>
> = {
  en: { online: "Online", in_person: "In person", phone: "Phone" },
  el: { online: "Online", in_person: "Με φυσική παρουσία", phone: "Τηλεφωνικά" },
};

const languageLabels: Record<ConversationLanguage, Record<"en" | "el", string>> = {
  en: { en: "English", el: "Greek" },
  el: { en: "Αγγλικά", el: "Ελληνικά" },
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

type SerializedProvider = Omit<ProviderDirectoryRecord, "information"> & {
  information: { source: string; checkedAt: string };
};

type SerializedService = Omit<ServiceDirectoryRecord, "information"> & {
  information: { source: string; checkedAt: string };
};

type DirectoryApiResponse = {
  providers?: SerializedProvider[];
  services?: SerializedService[];
};

function providerNameFor(service: ServiceDirectoryRecord, providers: ProviderDirectoryRecord[]) {
  return providers.find((provider) => provider.id === service.providerId)?.name ?? "Demonstration provider";
}

function explainService(
  service: ServiceDirectoryRecord,
  language: ConversationLanguage,
  primaryTopic: SupportTopic,
  secondaryTopics: SupportTopic[],
  serviceArea: ServiceArea,
) {
  const explanations: string[] = [];

  if (service.topics.includes(primaryTopic)) {
    explanations.push(
      language === "en"
        ? `Supports your main topic: ${topicLabels.en[primaryTopic]}`
        : `Υποστηρίζει το κύριο θέμα σου: ${topicLabels.el[primaryTopic]}`,
    );
  } else {
    const relatedTopic = secondaryTopics.find((topic) => service.topics.includes(topic));
    if (relatedTopic) {
      explanations.push(
        language === "en"
          ? `Supports a related topic you selected: ${topicLabels.en[relatedTopic]}`
          : `Υποστηρίζει σχετικό θέμα που επέλεξες: ${topicLabels.el[relatedTopic]}`,
      );
    }
  }

  if (service.coverage.includes(serviceArea)) {
    explanations.push(
      language === "en"
        ? `Available for your selected support area: ${areaLabels.en[serviceArea]}`
        : `Διαθέσιμη για την περιοχή υποστήριξης που επέλεξες: ${areaLabels.el[serviceArea]}`,
    );
  } else if (service.coverage.includes("anywhere_cyprus")) {
    explanations.push(language === "en" ? "Available across Cyprus" : "Διαθέσιμη σε όλη την Κύπρο");
  } else if (service.coverage.includes("online")) {
    explanations.push(language === "en" ? "Available online" : "Διαθέσιμη online");
  }

  return explanations;
}

export default function IntegratedCheckIn() {
  const [language, setLanguage] = useState<ConversationLanguage>("en");
  const [state, setState] = useState<ConversationState>(() => createConversation(crypto.randomUUID(), "en"));
  const [secondary, setSecondary] = useState<SupportTopic[]>([]);
  const [text, setText] = useState("");
  const [demoStatus, setDemoStatus] = useState("");
  const [pendingDemo, setPendingDemo] = useState<{ serviceId: string } | null>(null);
  const [demoConsent, setDemoConsent] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [safetySignal, setSafetySignal] = useState(false);
  const [browseAll, setBrowseAll] = useState(false);
  const [directoryProviders, setDirectoryProviders] = useState<ProviderDirectoryRecord[]>(demoProviders);
  const [directoryServices, setDirectoryServices] = useState<ServiceDirectoryRecord[]>(demoServices);

  useEffect(() => {
    const root = document.documentElement;
    const previousLanguage = root.lang || "en";
    root.lang = language;

    return () => {
      root.lang = previousLanguage;
    };
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateDirectory() {
      try {
        const response = await fetch("/api/directory", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as DirectoryApiResponse;
        if (!Array.isArray(data.providers) || !Array.isArray(data.services)) return;

        const providers = data.providers.map((provider) => ({
          ...provider,
          information: {
            ...provider.information,
            checkedAt: new Date(provider.information.checkedAt),
          },
        }));
        const services = data.services.map((service) => ({
          ...service,
          information: {
            ...service.information,
            checkedAt: new Date(service.information.checkedAt),
          },
        }));

        if (!cancelled && providers.length > 0 && services.length > 0) {
          setDirectoryProviders(providers);
          setDirectoryServices(services);
        }
      } catch {
        // The static synthetic directory remains the explicit university-demo fallback.
      }
    }

    void hydrateDirectory();
    return () => {
      cancelled = true;
    };
  }, []);

  const prompt = getConversationPrompt(language, state.stage);
  const safety = routeSafety({ explicitSignals: safetySignal ? ["user_requests_help_now"] : [] });
  const currentProgress = progressByStage[state.stage];
  const canGoBack = Boolean(previousStage[state.stage]);

  const results = useMemo(
    () =>
      state.stage === "complete" && state.primarySupportTopic && state.serviceArea
        ? discoverServices(directoryServices, {
            primaryTopic: state.primarySupportTopic,
            secondaryTopics: state.secondarySupportTopics,
            serviceArea: state.serviceArea,
            preferredLanguages: [language],
          })
        : null,
    [directoryServices, state, language],
  );

  const pendingService = useMemo(
    () =>
      pendingDemo
        ? directoryServices.find((service) => service.id === pendingDemo.serviceId) ?? null
        : null,
    [directoryServices, pendingDemo],
  );

  function clearResultActions() {
    setBrowseAll(false);
    setPendingDemo(null);
    setDemoConsent(false);
    setDemoSubmitting(false);
    setDemoStatus("");
  }

  function cancelDemoHandoff() {
    if (demoSubmitting) return;
    setPendingDemo(null);
    setDemoConsent(false);
    setDemoStatus("");
  }

  function dispatch(action: ConversationAction) {
    clearResultActions();
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
    setSafetySignal(false);
    clearResultActions();
    setState(createConversation(crypto.randomUUID(), language));
  }

  function goBack() {
    const target = previousStage[state.stage];
    if (!target) return;

    if (target === "secondary_topics") {
      setSecondary(state.secondarySupportTopics);
    }

    clearResultActions();
    setState((current) => ({ ...current, stage: target }));
  }

  function reopenForEdit(target: "primary_topic" | "secondary_topics" | "service_area") {
    if (target === "secondary_topics") {
      setSecondary(state.secondarySupportTopics);
    }

    clearResultActions();
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
    clearResultActions();
  }

  async function runDemoHandoff() {
    if (
      demoSubmitting ||
      !pendingDemo ||
      !demoConsent ||
      !state.primarySupportTopic ||
      !state.serviceArea
    ) {
      return;
    }

    setDemoSubmitting(true);
    setDemoStatus(language === "en" ? "Running controlled handoff…" : "Εκτέλεση ελεγχόμενης επίδειξης…");

    try {
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

      if (response.ok && data.requestCreated && data.queueVisible && data.realRequestSent === false) {
        setDemoStatus(
          language === "en"
            ? `Demo handoff completed. Provider queue status: ${data.status}. No real request was sent.`
            : `Η επίδειξη handoff ολοκληρώθηκε. Κατάσταση ουράς παρόχου: ${data.status}. Δεν στάλθηκε πραγματικό αίτημα.`,
        );
        setPendingDemo(null);
        setDemoConsent(false);
      } else {
        setDemoStatus(
          language === "en"
            ? "The demo handoff could not be confirmed. You can keep exploring or try again."
            : "Η επίδειξη handoff δεν μπόρεσε να επιβεβαιωθεί. Μπορείς να συνεχίσεις την εξερεύνηση ή να δοκιμάσεις ξανά.",
        );
      }
    } catch {
      setDemoStatus(
        language === "en"
          ? "The demo handoff could not be confirmed. You can keep exploring or try again."
          : "Η επίδειξη handoff δεν μπόρεσε να επιβεβαιωθεί. Μπορείς να συνεχίσεις την εξερεύνηση ή να δοκιμάσεις ξανά.",
      );
    } finally {
      setDemoSubmitting(false);
    }
  }

  const primaryAction =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45";
  const secondaryAction =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text transition hover:border-sage hover:bg-warm-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2";
  const quietAction =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2";
  const editAction =
    "mt-2 inline-flex min-h-9 items-center rounded-lg px-2 text-xs font-semibold text-teal underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal";
  const choiceClass = (selected = false, disabled = false) =>
    `group flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 ${
      selected ? "border-teal bg-warm-surface text-text" : "border-border bg-white text-text hover:border-sage hover:bg-warm-bg"
    } ${disabled ? "cursor-not-allowed opacity-45" : ""}`;

  function renderServiceCard(service: ServiceDirectoryRecord, exact: boolean) {
    const explanations =
      exact && state.primarySupportTopic && state.serviceArea
        ? explainService(service, language, state.primarySupportTopic, state.secondarySupportTopics, state.serviceArea)
        : [];

    return (
      <article key={service.id} className="rounded-2xl border border-border bg-white p-4 sm:p-5">
        {!exact && (
          <p className="mb-3 inline-flex rounded-full bg-warm-surface px-3 py-1 text-xs font-bold text-text">
            {language === "en" ? "Broader directory option · not an exact match" : "Ευρύτερη επιλογή καταλόγου · όχι ακριβής αντιστοίχιση"}
          </p>
        )}

        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {providerNameFor(service, directoryProviders)}
        </p>
        <h2 className="mt-1 text-lg font-bold text-text">{service.name}</h2>

        {!exact && (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {language === "en"
              ? "This synthetic service is shown only for broader directory browsing. It may not match the topic or area you selected."
              : "Αυτή η συνθετική υπηρεσία εμφανίζεται μόνο για ευρύτερη περιήγηση στον κατάλογο. Μπορεί να μην ταιριάζει με το θέμα ή την περιοχή που επέλεξες."}
          </p>
        )}

        {exact && explanations.length > 0 && (
          <div className="mt-4 rounded-xl bg-warm-bg/70 p-3">
            <h3 className="text-sm font-bold text-text">{language === "en" ? "Why this may fit" : "Γιατί μπορεί να είναι σχετική"}</h3>
            <ul className="mt-2 grid gap-1.5 text-sm leading-relaxed text-muted">
              {explanations.map((explanation) => (
                <li key={explanation} className="flex gap-2">
                  <Check size={15} className="mt-0.5 shrink-0 text-teal" aria-hidden="true" />
                  <span>{explanation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {language === "en" ? "Support offered" : "Υποστήριξη"}
            </dt>
            <dd className="mt-1 leading-relaxed text-text">
              {service.topics.map((topic) => topicLabels[language][topic]).join(" · ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {language === "en" ? "Coverage" : "Κάλυψη"}
            </dt>
            <dd className="mt-1 leading-relaxed text-text">
              {service.coverage.map((area) => areaLabels[language][area]).join(" · ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {language === "en" ? "How support is offered" : "Τρόπος υποστήριξης"}
            </dt>
            <dd className="mt-1 leading-relaxed text-text">
              {service.deliveryModes.map((mode) => deliveryLabels[language][mode]).join(" · ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              {language === "en" ? "Languages available" : "Διαθέσιμες γλώσσες"}
            </dt>
            <dd className="mt-1 leading-relaxed text-text">
              {service.languages.map((availableLanguage) => languageLabels[language][availableLanguage]).join(" · ")}
            </dd>
          </div>
          {service.eligibility.length > 0 && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                {language === "en" ? "Eligibility / access" : "Προϋποθέσεις / πρόσβαση"}
              </dt>
              <dd className="mt-1 leading-relaxed text-text">{service.eligibility.join(" · ")}</dd>
            </div>
          )}
          {service.availability && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                {language === "en" ? "Availability" : "Διαθεσιμότητα"}
              </dt>
              <dd className="mt-1 leading-relaxed text-text">{service.availability}</dd>
            </div>
          )}
        </dl>

        <p className="mt-4 text-xs font-semibold text-teal">
          {language === "en"
            ? "Synthetic demonstration service. No real request will be sent."
            : "Συνθετική υπηρεσία επίδειξης. Δεν θα σταλεί πραγματικό αίτημα."}
        </p>

        {service.integrated ? (
          <button
            className={`${primaryAction} mt-4`}
            onClick={() => {
              setPendingDemo({ serviceId: service.id });
              setDemoConsent(false);
              setDemoStatus("");
            }}
          >
            {language === "en" ? "Preview assisted handoff demo" : "Προεπισκόπηση επίδειξης υποβοηθούμενης παραπομπής"}
          </button>
        ) : (
          <p className="mt-4 text-xs leading-relaxed text-muted">
            {language === "en"
              ? "Assisted handoff is not enabled for this demonstration service."
              : "Η υποβοηθούμενη παραπομπή δεν είναι ενεργοποιημένη για αυτή την υπηρεσία επίδειξης."}
          </p>
        )}
      </article>
    );
  }

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
            {safetyContent[language].action}
          </button>
        </div>

        {safety.state === "immediate_support" && (
          <div className="mb-5 rounded-2xl border border-clay/60 bg-white p-4 text-sm leading-relaxed text-text shadow-sm">
            <div role="status">
              <p className="font-semibold">{safetyContent[language].heading}</p>
              <p className="mt-1 text-muted">{safetyContent[language].notice}</p>
            </div>
            <button
              type="button"
              className={`${secondaryAction} mt-3`}
              onClick={() => setSafetySignal(false)}
            >
              {safetyContent[language].continueAction}
            </button>
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
                  <dl className="grid gap-3 text-sm">
                    <div className="rounded-2xl border border-border bg-warm-bg/60 p-4">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {language === "en" ? "Main topic" : "Κύριο θέμα"}
                      </dt>
                      <dd className="mt-1 font-semibold text-text">
                        {state.primarySupportTopic && topicLabels[language][state.primarySupportTopic]}
                      </dd>
                      <button className={editAction} onClick={() => reopenForEdit("primary_topic")}>
                        {language === "en" ? "Edit main topic" : "Αλλαγή κύριου θέματος"}
                      </button>
                    </div>

                    <div className="rounded-2xl border border-border bg-warm-bg/60 p-4">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {language === "en" ? "Related topics" : "Σχετικά θέματα"}
                      </dt>
                      <dd className="mt-1 font-semibold leading-relaxed text-text">
                        {state.secondarySupportTopics.length
                          ? state.secondarySupportTopics.map((topic) => topicLabels[language][topic]).join(" · ")
                          : language === "en"
                            ? "Nothing else selected"
                            : "Δεν επιλέχθηκε κάτι άλλο"}
                      </dd>
                      <button className={editAction} onClick={() => reopenForEdit("secondary_topics")}>
                        {language === "en" ? "Edit related topics" : "Αλλαγή σχετικών θεμάτων"}
                      </button>
                    </div>

                    <div className="rounded-2xl border border-border bg-warm-bg/60 p-4">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {language === "en" ? "Support area" : "Περιοχή υποστήριξης"}
                      </dt>
                      <dd className="mt-1 font-semibold text-text">
                        {state.serviceArea && areaLabels[language][state.serviceArea]}
                      </dd>
                      <button className={editAction} onClick={() => reopenForEdit("service_area")}>
                        {language === "en" ? "Edit area" : "Αλλαγή περιοχής"}
                      </button>
                    </div>
                  </dl>

                  {state.optionalFreeText && (
                    <div className="rounded-2xl border border-border bg-white p-4 text-sm">
                      <p className="font-semibold text-text">
                        {language === "en" ? "Optional private context added" : "Προστέθηκε προαιρετικό ιδιωτικό πλαίσιο"}
                      </p>
                      <p className="mt-1 leading-relaxed text-muted">
                        {language === "en"
                          ? "Your text is not shown here, is not used to match services in this demonstration, and is not shared with providers."
                          : "Το κείμενό σου δεν εμφανίζεται εδώ, δεν χρησιμοποιείται για αντιστοίχιση υπηρεσιών σε αυτή την επίδειξη και δεν κοινοποιείται σε παρόχους."}
                      </p>
                    </div>
                  )}

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
                  <div className="rounded-2xl bg-warm-bg/60 p-4 text-sm leading-relaxed text-muted">
                    {language === "en"
                      ? "These synthetic services meet the structured criteria from your check-in. TalkPoint does not score or clinically assess suitability."
                      : "Αυτές οι συνθετικές υπηρεσίες πληρούν τα δομημένα κριτήρια του check-in σου. Το TalkPoint δεν βαθμολογεί ούτε αξιολογεί κλινικά την καταλληλότητα."}
                  </div>
                  {results.services.map(({ service }) => renderServiceCard(service, true))}
                </div>
              )}

              {pendingDemo && pendingService && state.primarySupportTopic && state.serviceArea && (
                <HandoffPreview
                  language={language}
                  providerName={providerNameFor(pendingService, directoryProviders)}
                  serviceName={pendingService.name}
                  primaryTopic={topicLabels[language][state.primarySupportTopic]}
                  secondaryTopics={state.secondarySupportTopics.map((topic) => topicLabels[language][topic])}
                  serviceArea={areaLabels[language][state.serviceArea]}
                  consentAccepted={demoConsent}
                  submitting={demoSubmitting}
                  onConsentChange={setDemoConsent}
                  onConfirm={runDemoHandoff}
                  onCancel={cancelDemoHandoff}
                />
              )}

              {demoStatus && <p role="status" aria-live="polite" className="mt-4 text-sm leading-relaxed text-text">{demoStatus}</p>}

              {state.stage === "complete" && results?.kind === "no_match" && (
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-border bg-warm-bg/60 p-4 sm:p-5">
                    <h2 className="text-lg font-bold text-text">
                      {language === "en" ? "No exact demonstration match found" : "Δεν βρέθηκε ακριβής αντιστοίχιση επίδειξης"}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {language === "en"
                        ? "The current synthetic directory does not contain a service that matches these structured choices. That does not mean suitable support does not exist."
                        : "Ο τρέχων συνθετικός κατάλογος δεν περιέχει υπηρεσία που να ταιριάζει με αυτές τις δομημένες επιλογές. Αυτό δεν σημαίνει ότι δεν υπάρχει κατάλληλη υποστήριξη."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className={secondaryAction} onClick={() => reopenForEdit("primary_topic")}>
                        {language === "en" ? "Change main topic" : "Αλλαγή κύριου θέματος"}
                      </button>
                      <button className={secondaryAction} onClick={() => reopenForEdit("service_area")}>
                        {language === "en" ? "Change area" : "Αλλαγή περιοχής"}
                      </button>
                      <button className={secondaryAction} onClick={() => setBrowseAll(true)}>
                        {language === "en" ? "Browse all demonstration services" : "Προβολή όλων των υπηρεσιών επίδειξης"}
                      </button>
                    </div>
                    <button className={`${quietAction} mt-2`} onClick={reset}>
                      {language === "en" ? "Start again" : "Ξεκίνα ξανά"}
                    </button>
                  </div>

                  {browseAll && (
                    <section aria-labelledby="broader-directory-heading" className="grid gap-4">
                      <div>
                        <h2 id="broader-directory-heading" className="text-lg font-bold text-text">
                          {language === "en" ? "Broader demonstration directory" : "Ευρύτερος κατάλογος επίδειξης"}
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {language === "en"
                            ? "These are existing synthetic directory records, not replacements for an exact match. Review their details before choosing any next action."
                            : "Αυτές είναι υπάρχουσες συνθετικές εγγραφές καταλόγου και όχι αντικατάσταση μιας ακριβούς αντιστοίχισης. Δες τις πληροφορίες τους πριν επιλέξεις οποιοδήποτε επόμενο βήμα."}
                        </p>
                      </div>
                      {directoryServices.map((service) => renderServiceCard(service, false))}
                    </section>
                  )}
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
