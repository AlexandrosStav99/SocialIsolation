# TalkPoint Presentation GPT Brief

## Purpose

Use this file as the master prompt for GPT when asking it to create the most accurate possible academic presentation for the TalkPoint MVP.

The goal is **not** to make TalkPoint sound more advanced than it is. The goal is to present the implemented product clearly, visually and defensibly, with every important claim tied to the repository evidence.

---

# MASTER PROMPT FOR GPT

Copy the prompt below into a new GPT conversation that has access to this repository or attach the referenced files.

```text
You are creating the final academic presentation for TalkPoint, a university MVP.

Your priority is factual accuracy, traceability and strong presentation design. Do not exaggerate the product, invent evidence or turn technical implementation into unsupported claims of real-world validation.

PROJECT
TalkPoint is a Support Navigation & User-Directed Referral Platform for adults aged 18–30.

Its purpose is to help an anonymous adult user navigate support-service information using information and preferences that the user chooses to provide. The system uses a conversational structured check-in, deterministic service discovery, factual matching explanations, no-match recovery and an optional provider-specific assisted-contact path with an exact Sharing Preview and explicit consent.

TalkPoint is NOT:
- a therapist;
- a diagnostic system;
- a medical or clinical recommender;
- an emergency service;
- a replacement for professional support;
- a production-ready live support platform.

AUTHORITATIVE SOURCE ORDER
Before writing the presentation, read these repository files in this order:

1. docs/TALKPOINT-MVP-SPEC.md
2. docs/FINAL-MVP-READINESS.md
3. README.md
4. docs/VALIDATION-EVIDENCE-MATRIX.md
5. docs/PRODUCT-UX-CONTRACT.md
6. HANDOFF.md
7. docs/PHASE-1-REVIEW.md through docs/PHASE-9-REVIEW.md where relevant
8. docs/PHASE-10-VALIDATION-EVIDENCE.md
9. docs/UX-5-VALIDATION-STATUS.md
10. docs/DEMO-VIDEO-INSTRUCTIONS.md
11. docs/MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md
12. docs/UX-5-USABILITY-TEST-PLAN.md
13. docs/PRIVACY-LEGAL-VALIDATION-CHECKLIST.md
14. docs/SAFETY-CONTENT-VALIDATION-CHECKLIST.md
15. docs/PROVIDER-VALIDATION-CHECKLIST.md

If two documents appear to conflict, prefer the frozen MVP specification first and the latest final-readiness/handoff state second. Do not rely on older phase wording when later documents explicitly correct it.

CURRENT IMPLEMENTATION FACTS
Treat the following as implemented unless a repository file contradicts them:

- Next.js application.
- Payload CMS integrated with PostgreSQL.
- Version-controlled Payload migration.
- Clean PostgreSQL migration verified in CI.
- Live PostgreSQL round-trip verification in CI.
- Synthetic directory seed into Payload/PostgreSQL.
- Public /api/directory endpoint reads the demo directory from Payload/PostgreSQL when configured.
- Static synthetic directory exists only as an explicit fallback.
- Browser regression verifies the CI runtime serves the directory from payload_postgres.
- Two fictional providers and two fictional services in the controlled synthetic dataset.
- Anonymous-first 18+ check-in.
- English and Greek critical journey.
- One primary support topic and up to two related topics.
- Optional bounded free text with privacy guidance.
- Deterministic service discovery.
- Up to three relevant services where available.
- Factual “Why this may fit” explanations.
- No scores, percentages, “Best Match” or clinical appropriateness claims.
- Honest no-match recovery.
- Persistent Help now / safety-navigation entry point.
- Exact Sharing Preview before assisted contact.
- Provider-specific explicit consent.
- Controlled fictional assisted handoff using .invalid data and no real provider request.
- Provider organisation / provider user / RBAC foundations.
- Provider queue and workflow foundations.
- Separate anonymous analytics architecture.
- Accessibility/mobile/reduced-motion browser regressions.
- Full CI across security, lint, TypeScript, Phase 1–10 checks, PostgreSQL migration/seed/round-trip, production build and Playwright.

IMPORTANT PRODUCT LOGIC
The LLM does NOT choose providers.

The routing sequence is:
User input → structured Support Context → deterministic eligibility/filtering rules → service discovery → factual explanation.

AI is assistive only and is behind a server-side provider abstraction. The complete core journey has a deterministic fallback.

PRIVACY ARCHITECTURE
Present the data architecture accurately. The key separation is:

1. Ephemeral Conversation
2. Anonymous Analytics
3. Identifiable Contact Request
4. Consent Record
5. Directory / Identity

Emphasise that identifiable contact data is not collected during anonymous exploration and is not sent to the AI provider.

Contact details enter the flow only if the user explicitly chooses assisted contact and continues past the Sharing Preview and provider-specific consent step.

SAFETY BOUNDARY
Safety functionality is navigation, not clinical assessment.

Do not claim:
- clinical risk scoring;
- AI crisis classification;
- automatic third-party notification;
- clinically validated safety logic;
- real immediate-support resources unless repository evidence proves they have been qualified and validated.

The MVP keeps Help now available and uses deterministic safety-routing boundaries, but real safety wording/resources still require qualified domain review before real deployment.

DEMO DATA BOUNDARY
The current university MVP uses controlled synthetic provider/service data for the integrated demonstration.

Do NOT imply:
- live provider partnerships;
- comprehensive Cyprus service coverage;
- live demand;
- live monitoring;
- real provider requests;
- real operational analytics;
- real production users.

Use the phrase “Demonstration Data” where relevant.

CURRENT STATUS
The strongest accurate status statement is:

“TalkPoint’s frozen MVP product implementation is technically complete for the controlled university demonstration, with reproducible automated evidence for the core journey and architecture. External validation and production readiness remain separate open gates.”

Do NOT state that the full frozen academic Definition of Done has been satisfied.

OPEN VALIDATION ITEMS
These are real open items and should be presented honestly:

- final problem-validation academic synthesis;
- manual accessibility validation;
- qualified safeguarding/domain review;
- privacy/legal review for real operation;
- target-user study with real adults aged 18–30;
- real provider/directory validation for any pilot;
- final academic closure/evaluation.

Do not invent participant results, quotes, expert approvals, compliance conclusions or provider feedback.

PRESENTATION OBJECTIVE
Create a professional university presentation that answers four questions clearly:

1. What problem is TalkPoint trying to solve?
2. Why was the product designed this way?
3. What exactly has been implemented and verified?
4. What remains unvalidated or outside MVP scope?

The presentation must feel like a product/engineering case study, not a sales deck.

DESIGN DIRECTION
- 16:9 widescreen.
- Clean, modern, calm visual language.
- Use the existing TalkPoint UI and brand direction rather than inventing a new visual identity.
- Prefer actual screenshots from the implemented product when available.
- If a screenshot is unavailable, use a clearly marked screenshot placeholder instead of fabricating UI.
- Use diagrams for architecture, journey, privacy boundaries and deterministic routing.
- Keep text concise on-slide.
- Use speaker notes for detail and evidence.
- Avoid decorative stock photography unless it adds real explanatory value.
- Avoid overly corporate consulting visuals.
- Avoid generic AI imagery.

WRITING STYLE
- Academic but natural.
- Clear, direct and non-marketing.
- Minimal jargon unless it is explained.
- No exaggerated claims.
- No generic filler such as “revolutionary”, “seamless”, “cutting-edge” or “empowering” unless strongly justified.
- Prefer concrete statements over slogans.

DEFAULT DECK STRUCTURE
Build approximately 13–15 main slides. Use this as the default structure unless repository evidence clearly suggests a better one.

SLIDE 1 — TalkPoint
Subtitle: Support Navigation & User-Directed Referral Platform
Include team/course placeholders if names are not available.
Visual: strongest actual product screenshot or calm branded title treatment.

SLIDE 2 — The problem and target user
Explain the problem TalkPoint addresses and the 18–30 target group.
IMPORTANT: use only real research/evidence found in the repository. If quantitative evidence is not available in the repository, do not invent statistics. Use a qualitative problem statement and flag where the final academic report should supply a cited source.

SLIDE 3 — Product boundary
Show what TalkPoint does and does not do.
Strong visual idea: two-column “TalkPoint does / TalkPoint does not”.
Include the distinction between navigation and professional assessment.

SLIDE 4 — Core user journey
Visual flow:
Anonymous user → 18+ → check-in → Support Context → deterministic discovery → service explanation → self-service / assisted contact → Sharing Preview → consent → provider workflow boundary.
Include no-match recovery as a visible branch.

SLIDE 5 — Why the journey is anonymous-first
Explain data minimisation, user agency and delayed identity collection.
Show that contact details only enter after explicit assisted-contact choice.

SLIDE 6 — Deterministic service discovery
Explain that the LLM does not choose providers.
Visual:
Structured context → eligibility/coverage/language/delivery filters → service results → factual reasons.
Mention no scores, Best Match or clinical appropriateness claims.

SLIDE 7 — AI: constrained, optional, replaceable
Explain what AI may do and what it may not do.
Show the server-side abstraction and deterministic fallback.
Do not make AI the centre of the product story.

SLIDE 8 — Privacy architecture
Visualise the separated data domains:
Ephemeral Conversation / Anonymous Analytics / Contact Request / Consent Record / Directory & Identity.
Show boundaries rather than one giant database box.

SLIDE 9 — Payload CMS + PostgreSQL
Explain the implemented database layer.
Include:
- Payload/PostgreSQL runtime;
- committed migration;
- synthetic seed;
- Payload-backed directory API;
- static fallback;
- CI proof of payload_postgres.
Visual: architecture diagram or actual /api/directory proof screenshot.

SLIDE 10 — Trust, consent and safety boundaries
Show the exact Sharing Preview concept and safety-navigation boundary.
Explain what is not shared with a provider by default.
Mention that real safety resources/copy require qualified review before deployment.

SLIDE 11 — UX, bilingual and accessibility work
Cover:
- conversational one-question-at-a-time flow;
- English/Greek critical journey;
- keyboard/focus/mobile/reduced-motion regressions;
- manual accessibility validation still open.
Do not claim WCAG compliance.

SLIDE 12 — What the MVP demonstrates
Use 3 small product screenshots if available:
1. structured check-in/review;
2. explainable service result;
3. Sharing Preview or no-match recovery.
Keep captions factual.

SLIDE 13 — Engineering verification
Show the technical evidence:
- security gate;
- zero-warning lint;
- strict TypeScript;
- Phase 1–10 checks;
- migration + seed + PostgreSQL round trip;
- build;
- Playwright.
Prefer a pipeline/evidence diagram over a dense list.
State clearly that green CI proves technical behaviour, not legal/safety/usability validation.

SLIDE 14 — Limitations and validation still open
Present open validation honestly.
This is not a weakness to hide. Frame it as methodological discipline.
Use three groups if useful:
Human validation / Domain & legal validation / Real-world operation.

SLIDE 15 — Conclusion
Suggested message:
“TalkPoint demonstrates a privacy-aware, explainable and user-directed support-navigation MVP while deliberately separating technical implementation from claims that require real-world evidence.”
End with what the project has proven and what a future pilot would need to prove next.

OPTIONAL APPENDIX
Create appendix slides only if useful:
- detailed technology stack;
- provider RBAC roles;
- service taxonomy;
- CI evidence matrix;
- data-retention boundary;
- validation protocols;
- no-match scenario;
- exact demo script.

VIVA PREPARATION RULE
For every major slide, add one speaker-note line answering:
“Why was it designed this way?”

The answer must come from one of:
- frozen requirement;
- privacy/safety constraint;
- usability principle;
- deterministic/testability requirement;
- documented trade-off;
- available evidence.

Do not use unsupported retrospective storytelling.

SOURCE TRACEABILITY
For every slide, include in speaker notes:
- Source file(s)
- Exact claim(s) supported by those files
- Any assumption or open evidence item

If you cannot support a claim from the repository, either remove it or label it clearly as a proposed/future statement.

SCREENSHOT RULES
If you have browser access to the running project:
- capture the real product;
- do not recreate UI in Figma-like mockups;
- use clean crops;
- remove browser clutter when possible;
- preserve visible “Demonstration Data” labels.

If you do not have access to the running product:
- use placeholders such as [INSERT ACTUAL CHECK-IN SCREENSHOT];
- tell the user exactly which screen to capture;
- never fabricate screenshots.

CHART / DATA RULES
Do not create charts containing fake user metrics.

Synthetic operational analytics may be shown only if explicitly labelled “Demonstration Data”.

Do not present random synthetic points as real user geography or demand.

FINAL OUTPUT REQUIRED
First produce:
1. a slide-by-slide content plan;
2. the evidence/source used for every slide;
3. a list of actual screenshots needed;
4. any unresolved factual questions or missing source material.

Then create the final presentation.

For the final presentation:
- keep the main deck to approximately 13–15 slides;
- create concise slide copy;
- include speaker notes;
- include source/evidence references in notes;
- ensure visual hierarchy is strong;
- use real project screenshots wherever possible;
- include an appendix only for material that helps the viva.

Before finishing, run a CLAIM AUDIT:
For every statement that could be interpreted as clinical, legal, accessibility, provider-partnership, research or production-readiness evidence, verify that the repository actually supports it. If not, rewrite or remove it.
```

---

# Recommended files to attach to GPT

If GPT cannot access the GitHub repository directly, attach at minimum:

1. `README.md`
2. `docs/TALKPOINT-MVP-SPEC.md`
3. `docs/FINAL-MVP-READINESS.md`
4. `docs/VALIDATION-EVIDENCE-MATRIX.md`
5. `docs/PRODUCT-UX-CONTRACT.md`
6. `HANDOFF.md`
7. `docs/DEMO-VIDEO-INSTRUCTIONS.md`

For a stronger technical presentation also attach:

- `.github/workflows/ci.yml`
- `payload.config.ts`
- `app/api/directory/route.ts`
- `lib/routing/discovery.ts`
- `components/check-in/IntegratedCheckIn.tsx`
- `tests/baseline.spec.ts`
- `tests/ux5.spec.ts`
- `tests/directory-persistence.spec.ts`

---

# Screenshots GPT should request or use

The presentation is more credible when it uses the real product. Recommended captures:

1. Landing page.
2. 18+ confirmation.
3. Primary-topic selection.
4. Review screen showing editable structured inputs.
5. Exact service result with `Why this may fit`.
6. Sharing Preview.
7. Consent / controlled assisted-handoff state.
8. No exact demonstration match screen.
9. Broader-directory result labelled as not an exact match.
10. Greek version of one critical screen.
11. `/api/directory` showing `source: payload_postgres`.
12. Optional synthetic dashboard screenshot clearly showing that it is demonstration data.
13. GitHub Actions green production CI screenshot if useful for the engineering evidence slide.

Do not use all screenshots simply because they exist. Use only those that strengthen the story.

---

# Claims that are safe to use

These are generally defensible when phrased accurately:

- “Controlled university MVP.”
- “Anonymous-first support navigation.”
- “Deterministic service discovery.”
- “Explainable factual matching reasons.”
- “No-match recovery instead of forced matching.”
- “Provider-specific Sharing Preview and explicit consent.”
- “Payload CMS + PostgreSQL database integration.”
- “Payload-backed synthetic demonstration directory.”
- “English and Greek critical journey.”
- “CI-verified technical implementation.”
- “Automated accessibility-related regressions.”
- “Target WCAG 2.2 AA, with manual validation still open.”
- “No real provider request is sent in the controlled demo.”

---

# Claims that must NOT be used without new evidence

- “GDPR compliant.”
- “WCAG 2.2 AA compliant.”
- “Clinically validated.”
- “Safe for real crisis use.”
- “Production ready.”
- “Live provider network.”
- “Verified providers” as a quality endorsement.
- “Real-time demand analytics.”
- “AI recommends the best provider.”
- “The system identifies the user’s mental-health condition.”
- “The directory covers Cyprus comprehensively.”
- “Users preferred X” unless real usability evidence exists.
- Any completion percentage, satisfaction rate or participant quote that has not actually been collected.

---

# Final quality test for the deck

The presentation is ready only if an examiner can ask any of the following and the deck/notes can answer without improvisation:

- Why is the journey anonymous-first?
- Why does AI not choose providers?
- Why is matching deterministic?
- Why are analytics separated from identifiable requests?
- What exactly is shared with a provider?
- Why is optional free text constrained?
- What happens when there is no exact match?
- What does PostgreSQL actually store?
- How do you know the directory is really database-backed?
- What does green CI prove?
- What does green CI not prove?
- Which claims still require real users, domain experts or legal review?
- Why is the current dataset synthetic and deliberately small?
- What would be required before a real provider pilot?

If the deck answers these accurately, it is aligned with the strongest current TalkPoint evidence rather than merely looking polished.
