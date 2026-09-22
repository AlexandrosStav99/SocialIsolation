# TalkPoint MVP v1.0 Technical Specification

**Status:** 🔒 Product scope frozen  
**Purpose:** Source of truth for implementation, QA, validation and academic evaluation.  
**Brand:** TalkPoint  
**Internal descriptor:** Social Support Routing & Analytics Platform (SSRAP)

## 1. Product boundary

TalkPoint is a **Support Navigation & User-Directed Referral Platform** for adults aged 18–30.

It helps a user navigate checked support-service information using information and preferences that the user chooses to provide.

TalkPoint does **not**:
- diagnose;
- provide therapy;
- provide medical, legal or other professional advice;
- determine treatment;
- claim that a service is clinically appropriate for a user;
- replace emergency or professional services.

Responsibility is deliberately separated:

- **AI:** natural conversation and constrained structured extraction.
- **TalkPoint:** guided navigation, deterministic service discovery, safety routing and consented transmission.
- **User:** controls disclosure, chooses services and chooses whether to request contact.
- **Provider:** eligibility, professional assessment where applicable, advice, support and case handling.

## 2. Actors and access

### Anonymous user
No account. Explicit 18+ confirmation is required before check-in. Do not collect date of birth.

### Super Admin
Platform administration including organisations, users, roles, directory, taxonomy, integrations and configuration. This role does not receive unrestricted identifiable-request access by default.

### Platform Admin
Day-to-day directory/content/provider administration and aggregate analytics. No identifiable request access by default.

### Provider Manager
Restricted to their organisation. Can access permitted consented requests, assign work, update statuses and view organisation operational analytics.

### Provider Staff
Restricted to their organisation and preferably to assigned requests. Can process permitted requests and update outcomes.

Security model: **RBAC + organisation scope + least privilege + audit logging**.

## 3. Core journey

1. Landing page.
2. Explicit 18+ confirmation.
3. Anonymous conversational check-in.
4. Broad support topic identification.
5. Progressive structured clarification.
6. Optional bounded free text.
7. Structured Support Context.
8. Safety Routing when applicable.
9. Deterministic Service Discovery.
10. Up to 3 relevant services with factual “why you are seeing this” explanations.
11. User chooses self-service contact or, where supported, “Ask this service to contact me”.
12. Assisted path shows an exact Sharing Preview.
13. Minimum contact data + provider-specific explicit consent.
14. Contact request enters provider queue.
15. Provider records operational outcome.
16. Separate anonymous aggregate analytics.

## 4. Conversational check-in

The interface must feel conversational rather than like a form.

Requirements:
- one question at a time;
- progressive disclosure;
- no “Question 3/8” framing;
- restrained non-clinical language;
- no fake counsellor behaviour;
- deterministic/testable branching underneath;
- typical path approximately 5–8 structured interactions;
- one primary support topic and up to two secondary topics;
- service area and relevant preferences used only as routing constraints.

### Support Context
- Primary support topic
- Up to 2 secondary support topics
- User-selected preferences/constraints
- Service-area preference

Do not frame Support Context as diagnosis or clinical needs assessment.

## 5. Support taxonomy v1

1. Loneliness & Social Connection
2. Emotional & Mental Wellbeing
3. Family & Relationships
4. Work & Unemployment
5. Financial & Basic Needs
6. Housing & Living Situation
7. Abuse, Violence & Personal Safety
8. Education & Student Support
9. Something else / I’m not sure

Substance Use is a candidate extension only if checked service coverage is sufficient.

## 6. Optional free text

- Shown only after broad topic identification.
- Optional.
- Maximum 500 characters.
- Warn users not to include names or identifying details.
- Cannot independently determine service routing or safety routing.
- Not shared with providers by default.
- Can be included in an assisted request only through separate explicit user choice.
- Deleted when the session ends unless explicitly included in the assisted request.
- No full conversation transcript retention.

## 7. AI architecture

MVP provider: **OpenAI API, GPT-5.4 mini**. Expected university usage is at most approximately 30 check-ins.

AI is assistive, not authoritative.

AI may:
- improve natural conversational wording;
- clarify user input;
- extract constrained candidate topics/intents;
- produce validated structured candidate signals.

AI must not:
- diagnose;
- provide therapy/professional advice;
- autonomously select or recommend a provider;
- invent resources;
- autonomously determine safety status;
- generate uncontrolled crisis instructions.

Flow:

```text
User
  ↓
TalkPoint backend
  ↓
Minimum necessary AI context
  ↓
Constrained structured output
  ↓
Application validation
  ↓
Deterministic rules
  ↓
Service Discovery
```

API keys are server-side only. Contact details and assisted-request identity fields are not sent to the AI.

### AI fallback
The complete core journey must remain usable when the AI API fails, times out or returns invalid output. Fallback is a deterministic guided conversation using controlled copy and choices.

Use an AI-provider abstraction so the model/provider can later be replaced without rewriting core application logic.

## 8. Deterministic Service Discovery

The LLM does not choose providers.

Service metadata includes:
- supported topics;
- district/coverage;
- age eligibility;
- online/in-person;
- language;
- eligibility requirements;
- contact channels;
- availability/hours;
- provider type;
- immediate-support capability where relevant;
- information source;
- information checked date.

Process:
1. Hard eligibility filters.
2. Deterministic fit filtering from Support Context.
3. Return up to 3 relevant services.
4. Explain factual reasons each service appears.

Do not show scores, percentages, “Best Match”, “recommended for you” or clinical-appropriateness claims.

### No-match recovery
Never fabricate or force a match. Offer controlled recovery paths such as broader service area, online services, adjusted preferences, directory browsing or restart. Immediate-support information remains available where relevant.

## 9. Provider ecosystem

MVP provider types:
1. NGOs / non-profits
2. Public / community services
3. Mental-health / counselling services
4. University / student support services
5. Helplines / immediate-support services

The MVP is not a marketplace of arbitrary private professionals.

### Directory-only
Checked information is displayed and the user contacts the service themselves.

### Integrated
Can receive a user-directed assisted contact request through the provider workspace.

The university MVP uses **real checked directory information + controlled demo assisted handoff** unless a formal real pilot agreement exists.

Do not imply partnerships that do not exist.

Avoid “Verified Provider” as a quality endorsement. Record objective provenance such as information source and **Information checked: date**.

## 10. Safety Routing

Safety functionality is navigation, not clinical assessment.

- “I need help now” remains available throughout check-in.
- Predefined structured triggers may make checked immediate-support resources prominent.
- User retains agency and may continue the normal navigation flow.
- No clinical risk score.
- No AI safety classification from optional free text in MVP.
- No automatic third-party notification.
- No “high risk detected” user-facing claim.
- Exact trigger matrix, wording and immediate-support resources require domain-expert validation before real deployment.

## 11. Location

Collect only where the user wants support:
- Nicosia
- Limassol
- Larnaca
- Paphos
- Famagusta
- Anywhere in Cyprus
- Online

No GPS, postcode or exact address. Service area is a routing constraint, not an identity field.

## 12. User-directed assisted contact

Only for integrated/demo providers.

Minimum data:
- optional preferred/first name;
- one contact method: phone **or** email;
- selected provider;
- relevant Support Context fields;
- controlled Structured Support Summary;
- optional note only if explicitly selected.

Do not collect surname, DOB, gender, ID or exact address.

Before submission show a **Sharing Preview** with exactly what will be shared, with whom, why and whether the optional note is included.

Consent is explicit and provider-specific.

## 13. Provider queue

Lifecycle:

```text
New → Assigned → Contact attempted → Contacted → Accepted for support → Closed
```

Alternative outcomes:
- Unable to reach
- Referred elsewhere
- User declined

The queue supports assignment, status updates and outcome tracking. It is not a clinical CRM, appointment system or full case-management platform.

Providers do not receive by default:
- full conversation;
- raw answers;
- AI reasoning;
- safety-trigger history;
- browsing history;
- other services viewed;
- internal routing data;
- exact location;
- unconsented data.

## 14. Data domains

### A. Ephemeral Conversation
Temporary random session ID, stage, structured selections, temporary free text, validated AI candidate signals and safety-routing state. Raw conversation is deleted on session expiry/end.

### B. Anonymous Analytics
De-identified structured fields such as topics, service area, outcome, services-shown count, self-service/assisted selection and no-match outcome.

Do not create a direct relationship that makes anonymous analytics trivially linkable to an identifiable request.

### C. Identifiable Contact Request
Created only after explicit assisted-contact choice and consent. Contains minimum operational data required for the selected provider.

### D. Consent Record
Separate audit object containing request reference, consent version, recipient provider, authorised data categories, optional-note authorisation, timestamp and withdrawal status.

### E. Directory / Identity
Provider/service directory data plus organisations, provider users, roles and permissions.

## 15. Retention and deletion

- Raw anonymous conversation is not retained after session expiry/end.
- Optional free text is deleted unless explicitly included in the assisted request.
- Abandoned sessions expire automatically.
- Identifiable requests remain only while operationally necessary, then are deleted/anonymised under the final validated retention policy.
- Consent evidence is a minimal separate audit record.
- A random request ID / secure management mechanism allows withdrawal/deletion requests without requiring an account.

Exact production retention duration remains intentionally open pending legal/pilot validation.

## 16. Logging

Never log:
- raw free text;
- contact details;
- preferred name;
- sensitive structured summaries;
- raw AI prompts/responses containing user content.

Operational logs may contain protected non-content metadata such as request ID, provider ID, event type, status, timestamp and error code where necessary.

## 17. Analytics and heatmaps

### Operational analytics
New, Contacted, Accepted, Closed, Unable to Reach and related workflow metrics.

### Anonymous support analytics
Selected topics, demand, no-match rate, routing outcomes and service gaps.

Geographic visualisation:
- district/service-area aggregation only;
- no user GPS/exact coordinates;
- no individual cases on maps;
- minimum sample threshold;
- suppress low-sample groups;
- derive from anonymous aggregate events, not identifiable provider requests.

No random points masquerading as real users.

University synthetic analytics/heatmaps must be clearly labelled **Demonstration Data**.

## 18. Languages

MVP is complete in **Greek and English**.

Conversation copy, safety wording, consent, errors, directory-facing content and critical UI must not be left partially translated.

## 19. Accessibility

Target **WCAG 2.2 AA** without claiming compliance until tested.

Minimum:
- keyboard operability;
- visible focus;
- semantic HTML;
- correct labels;
- sufficient contrast;
- screen-reader-compatible forms/status messages;
- no information conveyed by colour alone;
- responsive/mobile-first UI;
- automated and manual accessibility checks.

## 20. Demo vs real data

University MVP:
- checked real-world directory information where appropriate;
- controlled demo provider users;
- controlled demo assisted requests;
- synthetic/demo operational analytics and heatmaps.

Demo data must be clearly labelled. Do not imply live partnerships, live demand, live monitoring or real-time operation where none exists.

## 21. Technology baseline

- Next.js
- Payload CMS
- PostgreSQL
- OpenAI API behind a server-side provider abstraction

Payload owns directory/content/admin data. Routing and safety rules remain version-controlled application logic with automated tests. Payload must not become a CMS-editable safety/routing rules engine.

The existing repository is migrated rather than rewritten from scratch.

## 22. Prototype migration

### KEEP
- TalkPoint branding and visual direction
- landing foundation
- reusable Next.js structure
- conversational UI as visual starting point
- dashboard visuals only as design reference where useful

### REWORK
- `/check-in` into progressive conversational flow
- dashboard into authenticated provider workspace + privacy-safe analytics
- directory into Payload-backed data
- routing into deterministic Service Discovery
- heatmap into district-level aggregate visualisation

### REMOVE
- sensitive text in URL query parameters
- scripted/fake conversation presented as real intelligence
- random Mapbox user datapoints
- hard-coded metrics/requests presented as live
- public provider dashboard
- unsupported “Live”, “Updated just now” and “GDPR compliant” claims

## 23. Validation gates

Before the project is called complete:

1. **Problem validation:** evidence chain from research to requirements/design.
2. **End-to-end validation:** happy paths and critical edge cases work.
3. **Routing validation:** representative scenarios are reproducible, explainable and tested.
4. **Safety validation:** exact safety rules/resources/copy reviewed by appropriate domain expertise before real deployment.
5. **Privacy/security validation:** RBAC, organisation isolation, data boundaries, deletion and logging tested.
6. **Target-user validation:** structured usability evaluation with target users aged 18–30, findings documented and material problems iterated.
7. **Academic evaluation:** successes, failures, limitations, trade-offs and unvalidated assumptions reported honestly.

## 24. Definition of Done

TalkPoint MVP v1.0 is DONE only when evidence supports:

**Problem validated → solution justified → complete product implemented → routing verified → safety reviewed → privacy/security tested → target users evaluated → material findings incorporated → limitations documented.**

Core demonstrable flow:

```text
Anonymous adult user
→ conversational check-in
→ Support Context
→ Safety Routing where relevant
→ deterministic Service Discovery
→ relevant checked services
→ self-service OR explicit user-directed assisted contact
→ consent + Sharing Preview
→ provider queue
→ operational outcome
→ separate privacy-safe aggregate analytics
```

### Viva rule
For every material feature or architectural choice, the team must be able to answer **“Why was it designed this way?”** using evidence, a requirement, a safety/privacy constraint or a documented trade-off.

## 25. Scope freeze

🔒 **TalkPoint MVP v1.0 product scope is frozen.**

A new feature enters MVP only when evidence shows it is required to correct a critical functional, safety, privacy/security, accessibility or validation failure.

Nice-to-have ideas are deferred.

## 26. Intentionally open validation items

Do not invent answers to these merely to make the specification look complete:

- exact production retention duration;
- final safety trigger matrix and wording;
- final legal/privacy wording and lawful-basis assessment;
- complete checked Cyprus service dataset;
- final AI prompts and structured-output schemas;
- final usability-study sample size/methodology;
- requirements for a future real-provider pilot.

These are research, implementation or validation tasks, not reasons to reopen product scope.
