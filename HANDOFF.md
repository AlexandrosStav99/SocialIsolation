# TalkPoint Continuation Handoff

Last updated: 2026-09-22
Repository: `AlexandrosStav99/SocialIsolation`
Current continuation branch: `main`
Latest completed UX stage: UX-3
UX-3 merge commit: `533ae587caf4594266e4e83b4b726ed2d413edc8`
Post-merge CI: run #128, **green**

## Read this first

This is the operational continuation document for TalkPoint. Before changing product behaviour, read these in order:

1. `docs/TALKPOINT-MVP-SPEC.md` — frozen MVP source of truth.
2. `docs/PRODUCT-UX-CONTRACT.md` — locked product/UX contract subordinate to the frozen spec.
3. `docs/IMPLEMENTATION-PLAN.md`
4. `docs/PHASE-0-REVIEW.md`
5. `components/check-in/IntegratedCheckIn.tsx`
6. `lib/handoff/types.ts`
7. `lib/handoff/preview.ts`
8. `lib/handoff/create-request.ts`
9. `app/api/demo-handoff/route.ts`
10. `lib/safety/router.ts`
11. `lib/safety/content.ts`
12. `lib/safety/validated-matrix.ts`
13. `tests/baseline.spec.ts`

Do not redesign the product from assumptions. The core architecture, privacy domains, deterministic routing and production-hardening work are established and should be reused unless a real defect requires change.

## Product boundary

TalkPoint is an anonymous-first support-navigation product for adults. Its value is the guided path from uncertainty to relevant support options.

It is not a therapist, AI therapist, diagnosis/assessment product, crisis service, generic chatbot, social network, booking platform or opaque AI recommendation engine.

The intended journey remains:

> I do not know exactly what help I need → I describe my situation through simple structured choices → TalkPoint helps me understand relevant options → I choose what happens next.

Preserve deterministic, explainable service discovery and the four-domain privacy architecture.

## Locked privacy / safety rules

Do not weaken these:

- Anonymous exploration remains separate from identifiable contact.
- No identity collection belongs in the anonymous check-in.
- Optional free text is bounded, optional, cannot independently determine routing/safety, and is not shared by default.
- Explicit provider-specific consent is required for assisted handoff.
- Provider identity is derived server-side for handoff; do not trust client spoofing.
- Anonymous analytics remain separate from identifiable requests.
- Immediate-support routing must not claim emergency/clinical capability.
- Real Cyprus immediate-support resources/copy require domain-expert validation before live deployment.
- Demo/synthetic services and disabled real requests must remain clearly disclosed.

---

# UX programme status

## UX-0 — Product Contract

**COMPLETE AND MERGED.** PR #22.

Locked proposition, boundaries, human/non-clinical interaction, deterministic explainable matching, no-dead-end recovery, privacy/consent expectations, safety validation boundary, accessibility baseline and out-of-scope features.

Primary file: `docs/PRODUCT-UX-CONTRACT.md`.

## UX-1 — Homepage & Positioning

**COMPLETE, CI GREEN, MERGED.** PR #23.

Merge commit: `957697d2e5aee66a6f40ac270c98ab8b9958ec1c`.

Implemented clear support-navigation positioning, `Start the check-in` CTA hierarchy, understandable privacy language, honest university-demo disclosure, user-journey-focused How It Works and provider positioning.

## UX-2 — Human Check-in

**COMPLETE, CI GREEN, MERGED.** PR #24.

Merge commit: `18c831b24935786928eafc256539e9585cb8a5b8`.
PR CI #124: **success**.
Post-merge CI #125: **success**.

Implemented:

- calm guided EN/EL interaction without chatbot/therapist theatre;
- non-numeric progress/context cues;
- improved selection hierarchy and Continue / Skip behaviour;
- Back navigation;
- language switching without restarting;
- removal of the valueless visible preferences step while preserving the deterministic internal state;
- explicit optional-context privacy guidance;
- clearing local optional text when the check-in ends/completes.

The deterministic conversation engine, discovery logic, privacy domains, consent boundary, handoff architecture, Payload/PostgreSQL and migrations were not redesigned.

## UX-3 — Review, Matching & Recovery

**COMPLETE, CI GREEN, MERGED.** PR #25.

Final PR head: `2454bf037e5342138ee6f42c4e4793c14d923d59`.
Merge commit: `533ae587caf4594266e4e83b4b726ed2d413edc8`.
PR CI #127: **success**.
Post-merge `main` CI #128: **success**.

Implemented:

- richer review showing main topic, related topics and support area;
- direct edit paths for routing inputs without a full restart;
- optional-context status without displaying the private text;
- bilingual deterministic `Why this may fit` explanations from actual service metadata;
- provider/service hierarchy, supported topics, coverage, delivery modes, languages, eligibility/access and availability where data exists;
- removal of misleading language that implied the UI language was an explicitly selected support-language preference;
- no-exact-match recovery that preserves selections;
- broader directory browsing clearly labelled as **not an exact match** rather than fabricating a match;
- restart kept secondary.

Explicitly unchanged:

- deterministic discovery algorithm and `MAX_RESULTS` behaviour;
- synthetic directory contents;
- four-domain privacy architecture;
- anonymous/identifiable separation;
- consent/handoff API architecture;
- safety routing;
- Payload/PostgreSQL/migrations.

---

# ACTIVE STAGE — UX-4: Trust, Consent & Safety

## Goal

Make the anonymous-to-identifiable boundary understandable, make the Sharing Preview genuinely useful before consent, preserve user control, and document the production safety-content validation gate without inventing crisis capability or resources.

## Current audit

The architecture is already strong and should **not** be rebuilt:

- `app/api/demo-handoff/route.ts` requires explicit consent server-side.
- The selected service determines provider organisation server-side; client-supplied provider identity is not trusted.
- Only integrated demo services can create an assisted demo request.
- `createConsentedContactRequest` requires explicit consent and creates a separate Consent Record.
- Optional notes require separate authorisation before they can enter a request.
- The controlled demo uses a fictional `.invalid` email and a synthetic support summary; no real request is sent.
- Existing tests verify optional check-in text does not leave the browser/storage path used by the demo.

The weaknesses are primarily comprehension/control in the current UI:

1. **Sharing Preview is a dense paragraph.** It should clearly answer: who receives data, exactly what is shared, why, and what is not shared.
2. **Recipient identity is too implicit.** Name the selected demonstration provider/service in the preview.
3. **Anonymous separation needs clearer wording.** The UI must not imply that starting the handoff retroactively identifies or shares the anonymous check-in.
4. **Consent wording is generic.** It should be provider-specific and tied to the listed data categories.
5. **There is no explicit cancel action.** The user must be able to close the Sharing Preview and continue exploring without losing service results.
6. **The safety route is honest but incomplete as a production boundary.** It correctly says TalkPoint is not an emergency/clinical service and does not invent resources, but UX-4 should make clear that production resources/copy remain blocked pending qualified domain/safeguarding validation.
7. **User agency on the safety route should remain visible.** The user may continue the normal navigation flow; do not turn the immediate-support notice into a forced terminal state.

## UX-4 implementation direction

Work on a dedicated branch from current green `main`, recommended: `ux/trust-consent-safety`.

Implement only within the locked MVP:

1. Replace the dense Sharing Preview paragraph with structured sections:
   - recipient provider/service;
   - purpose of the demo handoff;
   - exactly what will be shared;
   - explicitly what will **not** be shared.
2. State clearly that the anonymous exploration session is not retroactively identified or shared by this controlled demo action.
3. Make consent explicitly recipient-specific and tied to the listed sharing preview.
4. Add a clear Cancel / Keep exploring action that closes the preview without resetting results or selections and sends no request.
5. Keep the confirm action disabled until explicit consent is checked.
6. Preserve the server-side provider derivation and consent enforcement. Do not move trust to the client.
7. Keep optional private check-in text excluded from the demo handoff.
8. Improve the immediate-support notice only within validated boundaries: no invented phone numbers, organisations, resources or emergency instructions.
9. Add a safety-content validation checklist documenting what a qualified domain/safeguarding owner must verify before real deployment.
10. Keep EN/EL complete.
11. Extend regression coverage for preview content, cancel-without-request, provider-specific consent, optional-text exclusion, and continuing after the safety notice.

## Likely UX-4 files

Primary:

- `components/check-in/IntegratedCheckIn.tsx`
- `tests/baseline.spec.ts`
- new safety validation documentation under `docs/`

Inspect but change only if a real defect is found:

- `app/api/demo-handoff/route.ts`
- `lib/handoff/types.ts`
- `lib/handoff/preview.ts`
- `lib/handoff/create-request.ts`
- `lib/privacy/contact-request.ts`
- `lib/safety/router.ts`
- `lib/safety/content.ts`
- `lib/safety/validated-matrix.ts`

Do not add real identity collection or production crisis resources in this UX stage.

## UX-4 acceptance criteria

Before merge:

- Sharing Preview names the recipient provider/service.
- The user can understand exactly what is shared and what is not shared without reading implementation terminology.
- The UI explicitly preserves the anonymous/identifiable separation.
- Optional free text remains excluded unless a future formally scoped flow adds separate explicit authorisation; the current demo must not add that capability.
- Consent is explicit and provider-specific.
- Confirm stays disabled before consent.
- Cancel closes the preview, preserves service exploration and creates no request.
- Server-side provider derivation and consent checks remain unchanged or stronger.
- Immediate-support access remains available throughout the check-in.
- The safety notice does not invent resources or imply emergency capability.
- A production safety-content validation checklist exists and clearly states that current content/resources are not validated for real deployment.
- EN/EL behaviour is complete.
- Full CI is green, including security gate, lint, TypeScript, Phase 1–10 checks, migration/PostgreSQL checks, production build and Playwright.

---

# UX-5 — Accessibility, Mobile & Validation

**PLANNED AFTER UX-4.**

Final keyboard/focus, semantics, contrast/readability, reduced-motion, mobile/full-journey QA, loading/error/empty states, final regression coverage and structured usability-test plan.

Automated checks are not proof of usability or full WCAG compliance.

---

# Technical foundations that must not be accidentally undone

Working foundations include:

- PostgreSQL runtime integration;
- Payload CMS integration;
- provider organisations and provider-user/RBAC foundations;
- provider/service directory foundations;
- ephemeral anonymous conversation sessions;
- strict anonymous analytics separation;
- contact requests and separate consent records;
- privacy-safe/redacted logging;
- environment/secrets validation;
- real PostgreSQL CRUD verification in CI;
- committed/version-controlled Payload migration applied to clean PostgreSQL in CI;
- live PostgreSQL round-trip verification;
- production build and Playwright regression suite;
- dependency security gate.

Migration rule: do not reintroduce dynamic `migrate:create` in CI as a substitute for committed migrations.

# Working rules

1. Start each UX stage from current `main`.
2. Frozen MVP spec is authoritative.
3. Product & UX Contract governs presentation/interaction within that scope.
4. One UX stage per branch/PR.
5. Do not expand MVP scope during UX refinement.
6. Preserve deterministic routing and explainability.
7. Preserve the four-domain privacy architecture.
8. Never invent production safety/service claims.
9. Keep demo/synthetic disclosures honest.
10. Update tests when expected product behaviour intentionally changes; do not weaken them merely to get green CI.
11. Inspect the actual failing CI job/log before changing code.
12. Verify fixes are on the active PR branch.
13. Full CI must be green before merge.

# Immediate continuation

> Continue TalkPoint from `main` after UX-3. Read the frozen MVP spec, Product & UX Contract and this handoff. Take ownership of UX-4 Trust, Consent & Safety on a dedicated branch. Improve the Sharing Preview, consent comprehension, user cancellation/control and safety production-boundary documentation without changing the four-domain privacy architecture or inventing real-world safety resources. Keep EN/EL complete, update regression coverage, and require full green CI before merge.

# Current checkpoint

- Core architecture/data boundaries: complete and merged.
- Production migration/runtime hardening: complete and merged.
- UX-0 Product Contract: complete and merged.
- UX-1 Homepage & Positioning: complete and merged.
- UX-2 Human Check-in: complete and merged.
- UX-3 Review, Matching & Recovery: complete, PR #25 merged, post-merge CI #128 green.
- **UX-4 Trust, Consent & Safety: ACTIVE NEXT STAGE.**
- UX-5 Accessibility, Mobile & Validation: pending.
