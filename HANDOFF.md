# TalkPoint Continuation Handoff

Last updated: 2026-09-22
Repository: `AlexandrosStav99/SocialIsolation`
Current continuation branch: `main`
UX-2 merge commit: `18c831b24935786928eafc256539e9585cb8a5b8`
Post-merge CI: run #125, **green**

## Read this first

This is the operational continuation document for TalkPoint. Before changing product behaviour, read these in order:

1. `docs/TALKPOINT-MVP-SPEC.md` — frozen MVP source of truth.
2. `docs/PRODUCT-UX-CONTRACT.md` — locked product/UX contract subordinate to the frozen spec.
3. `docs/IMPLEMENTATION-PLAN.md`
4. `docs/PHASE-0-REVIEW.md`
5. `components/check-in/IntegratedCheckIn.tsx`
6. `lib/routing/discovery.ts`
7. `lib/routing/types.ts`
8. `lib/directory/contracts.ts`
9. `data/demo-directory.ts`
10. `tests/baseline.spec.ts`

Do not redesign the product from assumptions. The core architecture, privacy domains and production-hardening work are already established and should be reused unless a real defect requires change.

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

Locked the product proposition, boundaries, human/non-clinical interaction principle, deterministic explainable matching, no-dead-end requirement, privacy/consent contract, safety validation boundary, accessibility baseline and explicit out-of-scope list.

Primary file: `docs/PRODUCT-UX-CONTRACT.md`.

## UX-1 — Homepage & Positioning

**COMPLETE, CI GREEN, MERGED.** PR #23.

Merge commit: `957697d2e5aee66a6f40ac270c98ab8b9958ec1c`.

Implemented clear support-navigation positioning, `Start the check-in` CTA hierarchy, understandable privacy language, honest university-demo disclosure, user-journey-focused How It Works and sharper provider positioning.

Important lesson: intentional UI copy changes require Playwright selectors to be updated on the active PR branch.

## UX-2 — Human Check-in

**COMPLETE, CI GREEN, MERGED.** PR #24.

Final PR head: `f8a206cb4d49e656c7072d5c300a50acf19ca2aa`.
Merge commit: `18c831b24935786928eafc256539e9585cb8a5b8`.
PR CI #124: **success**.
Post-merge `main` CI #125: **success**.

Implemented:

- calmer guided interaction without chatbot/therapist theatre;
- plain EN/EL non-clinical prompts;
- non-numeric progress/context cues;
- improved primary/secondary selection hierarchy;
- deliberate Continue / Skip behaviour;
- Back navigation;
- language switching without restarting the check-in;
- removal of the meaningless visible preferences step while preserving the internal deterministic state;
- explicit optional-context privacy guidance and character feedback;
- clearing of the local optional-text copy when the check-in ends/completes;
- visual alignment with the existing TalkPoint design tokens and UX-1 direction.

The deterministic conversation engine, discovery logic, privacy domains, consent boundary, handoff architecture, Payload/PostgreSQL and migrations were not redesigned.

CI note: an earlier red PR browser run was caused by a stale accessibility selector using the pre-UX-2 age-gate label. The selector was corrected to the intentional new copy while preserving keyboard focus/Enter behaviour. No test requirement was bypassed.

---

# ACTIVE STAGE — UX-3: Review, Matching & Recovery

## Goal

Make the review step prove what TalkPoint understood, make service results explainable using actual deterministic directory attributes, and replace the current no-match dead end with transparent recovery options supported by the existing data/routing model.

## Current audit

The merged UX-2 flow is strong enough to build on. The main remaining weaknesses are after the check-in:

1. **Review is too thin.** It currently shows only main topic and area. It should also show related topics and offer direct edit paths where technically feasible.
2. **Current result cards are under-informative.** They mainly show service name plus machine-oriented reason strings. The locked hierarchy calls for provider/service, support offered, why relevant, area/online availability, eligibility/access info and a clear next action when supported by directory data.
3. **Reason strings are currently English implementation output.** User-facing explanation must be bilingual and based directly on deterministic attributes. Do not expose scores or fake confidence.
4. **Interface language currently participates in discovery as a language constraint.** Do not describe this as an explicit user “language preference” unless the user actually selected one. User-facing copy should state factual availability such as “Available in English/Greek”.
5. **No-match is a dead end.** Current copy says to change area/topic or restart. UX-3 must preserve selections and offer controlled recovery.
6. **The routing model already returns recovery capabilities**: `change_area`, `change_preferences`, `browse_directory`. The visible preferences step was intentionally removed in UX-2 because the MVP currently exposes no genuine preferences, so do not resurrect a meaningless preference screen merely because the recovery enum exists.
7. **The current synthetic directory is very small.** Do not invent production coverage or false “better matches” to demonstrate recovery. Broader/browse results must be clearly labelled as non-exact and based only on existing synthetic directory records.

## Existing deterministic discovery behaviour

`lib/routing/discovery.ts`:

- filters by selected topics;
- accepts exact selected area, `anywhere_cyprus` or `online` coverage;
- filters by language/delivery modes when provided;
- prioritises services supporting the primary topic;
- returns up to 3 results;
- returns `no_match` rather than forcing a match;
- does not use scores.

Do not replace this with AI ranking or opaque suitability scoring.

## UX-3 implementation direction

Work on a dedicated branch from current green `main`, recommended: `ux/review-matching-recovery`.

Implement only what the frozen spec/data can support:

1. Enrich the review summary with main topic, related topics and service area.
2. Add direct edit actions for those routing inputs without forcing a full restart.
3. Keep optional free text out of matching claims. If its status is surfaced, say clearly that it is private/not used for matching in this demonstration.
4. Render bilingual human-readable “Why this may fit” explanations from actual service attributes and selected criteria.
5. Show provider identity from the synthetic provider directory, service name, relevant supported topics, coverage/online mode, delivery mode, eligibility/availability where present, and demo status.
6. Keep integrated handoff action only where `service.integrated === true`; do not imply a provider action exists where it does not.
7. Replace no-match dead-end copy with:
   - edit the selected topic/area;
   - browse existing demonstration services as broader, explicitly non-exact options where appropriate;
   - keep restart secondary.
8. Preserve the user’s existing selections during recovery/editing.
9. Never label broader directory browsing as a match when it does not satisfy the selected topic/area.
10. Add EN/EL regression coverage for review edits, explainable result content and no-match recovery.

## Likely files for UX-3

Primary:

- `components/check-in/IntegratedCheckIn.tsx`
- `tests/baseline.spec.ts`

Inspect and change only if required by a clean deterministic implementation:

- `lib/routing/discovery.ts`
- `lib/routing/types.ts`
- `lib/directory/contracts.ts`
- `data/demo-directory.ts`

Avoid changing conversation-engine, privacy, handoff, Payload/PostgreSQL or migrations unless a real blocker is discovered.

## UX-3 acceptance criteria

Before merge:

- Review shows all meaningful routing inputs in plain EN/EL language.
- User can correct main topic, related topics and area without restarting the full journey.
- Exact result cards explain why they appear using real service metadata.
- No scores, percentages, “best match”, clinical suitability or unsupported recommendation language appears.
- Provider/service hierarchy and relevant access information are understandable.
- Demo/synthetic disclosure remains visible.
- No-match says no **exact** match was found, not that no help exists.
- Recovery preserves current selections.
- Broader/browse results are explicitly labelled as broader/non-exact.
- Optional free text still does not leave the browser through discovery/handoff/storage paths already protected by tests.
- Immediate-support access remains available.
- EN/EL behaviour remains complete.
- Full CI is green, including security gate, lint, TypeScript, Phase 1–10 checks, migration/PostgreSQL checks, production build and Playwright.

---

# UX-4 — Trust, Consent & Safety

**PLANNED AFTER UX-3.**

Refine the anonymous-to-identifiable transition, sharing preview, consent comprehension and safety production-boundary documentation. Reuse the existing privacy/consent architecture rather than redesigning it.

Do not imply that entering contact details retroactively identifies the anonymous check-in. Do not invent emergency resources.

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

> Continue TalkPoint from `main` after UX-2. Read the frozen MVP spec, Product & UX Contract and this handoff. Take ownership of UX-3 Review, Matching & Recovery on a dedicated branch. Improve review/editability, deterministic explainability and no-match recovery without inventing matches or changing the four-domain privacy architecture. Keep EN/EL complete, update regression coverage, and require full green CI before merge.

# Current checkpoint

- Core architecture/data boundaries: complete and merged.
- Production migration/runtime hardening: complete and merged.
- UX-0 Product Contract: complete and merged.
- UX-1 Homepage & Positioning: complete and merged.
- UX-2 Human Check-in: complete, PR #24 merged, post-merge CI #125 green.
- **UX-3 Review, Matching & Recovery: ACTIVE NEXT STAGE.**
- UX-4 Trust, Consent & Safety: pending.
- UX-5 Accessibility, Mobile & Validation: pending.
