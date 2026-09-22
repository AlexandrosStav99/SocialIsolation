# TalkPoint Product & UX Contract

Status: **Locked baseline for UX refinement**  
Scope: UX-0  
Source of truth priority: `TALKPOINT-MVP-SPEC.md` remains authoritative for MVP scope, privacy architecture and safety constraints. This contract governs how that frozen scope is expressed to users.

## 1. Product proposition

TalkPoint helps an adult who may not know where to turn understand what kind of support may fit their situation and explore relevant support services, privately and without creating an account.

The core journey is:

> I do not know exactly what help I need → I describe my situation through simple structured choices → TalkPoint helps me understand relevant options → I choose what happens next.

TalkPoint is not primarily a directory. The product value is the guided navigation layer between uncertainty and an appropriate next step.

## 2. What TalkPoint is

TalkPoint is:

- a privacy-first support-navigation product;
- an anonymous-first guided check-in;
- an explainable service-discovery experience;
- a user-controlled route to optional provider contact;
- a provider-facing foundation for consented requests and privacy-safe aggregate demand insight;
- currently a university MVP/demonstration and not a live support service.

## 3. What TalkPoint is not

The MVP must not present itself as therapy or counselling, a therapist or AI therapist, a crisis or emergency service, a diagnostic or clinical assessment tool, an autonomous AI recommendation engine, a social network, or a provider booking/messaging platform. It must not guarantee that a suggested service is suitable or available.

No UX refinement may silently introduce these capabilities.

## 4. Primary user promise

A user should understand within the first screen that they do not need to know what type of service they need, can explore without creating an account, TalkPoint uses their choices to find relevant services, they control whether identifiable information is shared, and the current public experience is a university demonstration.

The emotional message `You are not alone` may support this proposition, but must not replace the explanation of what TalkPoint does.

## 5. UX principles

### Human, not clinical
Use plain, calm language. Ask about what feels relevant rather than performing a clinical assessment.

### Guided, not chat theatre
The check-in may feel conversational, but must not pretend that a human or intelligent therapist is listening. Deterministic structured routing remains honest and understandable.

### Minimum necessary friction
Every visible step must change routing, protect the user, satisfy a frozen requirement, or materially improve informed choice. A state-machine stage alone is not a reason to show a screen.

### Explainable matching
Explain why a service may be relevant using real directory attributes and selected criteria. Do not use fabricated confidence percentages, opaque scores, clinical claims or unsupported suitability language.

### No dead ends
A no-match state must not simply tell a user to restart. Where data permits, offer transparent recovery such as broader geography, online services or relaxed optional filters. Broader results must be labelled honestly.

### Privacy through comprehension
When a user considers becoming identifiable, show what will be shared, with whom, why, and what will not be shared. Consent remains explicit and provider-specific where required by the frozen specification.

### User control
Before discovery, users should be able to review the routing information that will be used and correct it without restarting the whole journey where technically feasible.

### Safety without false capability
Immediate-support routing must be easy to find but must not imply TalkPoint provides emergency help. Real Cyprus resources and wording require domain-expert/safeguarding validation before live deployment.

### Accessible by default
Keyboard access, visible focus, semantic structure, reduced-motion support, readable contrast, responsive layouts and understandable error states are product requirements.

## 6. Target user journey

1. **Landing:** understand the product, anonymous exploration and demonstration status.
2. **Eligibility and safety:** simple age handling with immediate-support routing always reachable.
3. **Guided check-in:** primary concern, optional related concerns, optional non-identifying context, service area and only supported preferences.
4. **Review:** show meaningful routing inputs in plain language and offer edit paths where feasible.
5. **Service discovery:** show relevant services with useful information and an understandable reason each appears.
6. **Recovery:** if no exact match exists, offer valid broader routes rather than a dead end.
7. **Optional handoff:** identifiable action begins only after an active user choice, a clear sharing preview and required consent.

## 7. Service-result hierarchy

When supported by directory data, prioritise service name/provider, support offered, why it may be relevant, area/online availability, eligibility/access information, and a clear next action.

Do not expose internal routing terminology or machine-oriented reason strings when a deterministic human-readable explanation can be shown.

## 8. No-match contract

The no-match experience must say no **exact** match was found rather than implying no help exists, preserve current selections, offer only recovery options supported by the routing model, distinguish exact from broadened matches, retain immediate-support access where applicable, and make restart secondary rather than the only option.

## 9. Anonymous-to-identifiable contract

Anonymous check-in data and identifiable contact-request data remain separate according to the frozen privacy architecture.

The UI must never imply that entering contact details retroactively identifies or shares the full anonymous session. Before an identifiable handoff, show a concise sharing preview and obtain the required explicit consent.

## 10. Demonstration-language contract

The product must remain honest that it is a university demonstration using synthetic/demo services and that real contact requests are disabled where applicable.

Implementation language must not dominate the primary user narrative. Terms such as `deterministic service discovery`, `domain workflow`, `synthetic summary` and `MVP privacy target` belong in technical documentation or secondary evaluator disclosure unless needed for accuracy.

Communication hierarchy: explain user value, explain the next action, provide concise demonstration disclosure, then expose technical detail only where useful to prototype evaluators.

## 11. Provider-side principle

Provider functionality is valuable only if the user-side navigation creates useful, consented demand. Prioritise the citizen journey before expanding dashboards or analytics. Aggregate insights remain thresholded/privacy-safe and must not become individual-user surveillance.

## 12. Out of scope

Unless the frozen MVP specification is formally changed, UX-1 through UX-5 must not add user accounts/profiles, saved personal conversation history, AI companion functionality, provider-user chat, appointment booking, community/forums, mood tracking, gamification, opaque AI ranking, or new sensitive-data collection merely for personalisation.

## 13. UX programme

- **UX-1: Homepage & positioning**: proposition, CTA hierarchy, demo disclosure, privacy value and provider positioning.
- **UX-2: Human check-in**: calm guided interaction, microcopy/navigation and removal or implementation of valueless steps.
- **UX-3: Review, matching & recovery**: review/editability, explainable service cards and no-match recovery.
- **UX-4: Trust, consent & safety**: anonymous-to-identifiable transition, sharing preview, consent and production safety-route requirements.
- **UX-5: Accessibility, mobile & validation**: accessibility/responsive QA, loading/error/empty states, regression coverage and usability-testing plan.

## 14. Definition of done

A first-time user should understand without external explanation what TalkPoint does and does not do, how to begin, why meaningful questions are asked, why a service may be relevant, what to do without an exact match, whether they are anonymous, what will be shared before becoming identifiable, how to stop or change direction, where immediate support sits, and that the current environment is a university demonstration.

Technical success alone is not sufficient. The experience must preserve the frozen privacy and safety architecture while making the product understandable, calm, honest and useful.
