# TalkPoint Continuation Handoff

Last updated: 2026-09-22
Repository: `AlexandrosStav99/SocialIsolation`
Current branch to continue from: `main`
Current `main` after UX-1 merge: `957697d2e5aee66a6f40ac270c98ab8b9958ec1c`

## Read this first

This file is the operational handoff for continuing TalkPoint without reconstructing prior context.

Before making changes, read these files in this order:

1. `docs/TALKPOINT-MVP-SPEC.md` — frozen MVP source of truth. Do not redesign or expand scope around it.
2. `docs/PRODUCT-UX-CONTRACT.md` — locked UX/product contract created in UX-0. This governs how the frozen MVP is expressed to users.
3. `docs/IMPLEMENTATION-PLAN.md`
4. `docs/PHASE-0-REVIEW.md`
5. `components/check-in/IntegratedCheckIn.tsx` — current integrated citizen journey and the main target for UX-2 onward.
6. `tests/baseline.spec.ts` — production regression coverage. Keep selectors aligned with intentional UX copy changes.

The project has already completed the core architecture/data-boundary work and the production-hardening work required to use committed Payload/PostgreSQL migrations. Do not reopen that architecture unless a real defect requires it.

## Overall goal

Turn the technically sound TalkPoint MVP into a calm, understandable, privacy-first support-navigation product without expanding the frozen MVP scope.

The intended user journey is:

> I do not know exactly what help I need → I describe my situation through simple structured choices → TalkPoint helps me understand relevant options → I choose what happens next.

TalkPoint is not primarily a directory, therapist, AI therapist, diagnostic tool, crisis service, social network, booking platform, or opaque AI recommendation engine.

Core implementation principle: preserve deterministic, explainable routing and the four-domain privacy architecture. Improve the interaction layer rather than hiding scope expansion behind UX work.

---

# Stage 1 of 6 — UX-0: Product Contract

## Goal

Lock product proposition, boundaries, UX principles, target journey, privacy/consent expectations, safety boundaries, accessibility baseline, and explicit out-of-scope features before changing the UI.

## Current state

**COMPLETE AND MERGED.**

PR #22 was merged into `main` before UX-1 began.

The contract explicitly establishes that:

- the frozen MVP specification remains authoritative;
- TalkPoint is anonymous-first support navigation;
- matching remains deterministic and explainable;
- the check-in may feel conversational but must not pretend to be a therapist or intelligent listener;
- no-match must not be a dead end;
- anonymous exploration and identifiable handoff remain separate;
- real crisis/support content requires domain-expert validation before live deployment;
- accounts, AI companion, booking, chat, community, mood tracking, gamification and opaque AI ranking remain out of scope.

## Active files

- `docs/PRODUCT-UX-CONTRACT.md`
- `docs/TALKPOINT-MVP-SPEC.md`
- `docs/IMPLEMENTATION-PLAN.md`
- `docs/PHASE-0-REVIEW.md`

## Changes made

Created `docs/PRODUCT-UX-CONTRACT.md` as the UX source of truth subordinate to the frozen MVP spec.

## Failed attempts / lessons

No substantive UX-0 failure. The key lesson is to prevent apparently useful features from entering later UX phases implicitly. UX refinement is not permission to redesign the MVP.

## Next steps

Do not modify this contract casually. If later implementation conflicts with it, first determine whether the implementation is wrong or whether a formal product decision is needed.

---

# Stage 2 of 6 — UX-1: Homepage & Positioning

## Goal

Make the first screen explain what TalkPoint actually does, preserve emotional warmth, improve CTA hierarchy, communicate privacy in human language, keep university-demo disclosure honest, and sharpen the provider-side proposition without changing routing or backend behaviour.

## Current state

**COMPLETE, CI GREEN, AND MERGED.**

PR #23: `UX-1: Homepage & positioning refinement`

Final PR head before merge: `3db53361855b5cedd674d10883b9e01a5f583ff3`
CI run #120: **success**
Merge commit on `main`: `957697d2e5aee66a6f40ac270c98ab8b9958ec1c`

The homepage now leads with:

> Not sure where to turn? Start here.

and explains that TalkPoint helps users explore what kind of support may fit and find relevant services privately without creating an account.

## Active files

- `components/HeroSection.tsx`
- `components/HowItWorks.tsx`
- `components/PrivacySection.tsx`
- `components/ForNGOs.tsx`
- `tests/baseline.spec.ts`
- `app/page.tsx` — composition/reference point

## Changes made

- Replaced the generic hero proposition with a clear support-navigation proposition.
- Added primary CTA `Start the check-in` and secondary CTA `See how it works`.
- Kept university MVP / demonstration status visible but secondary to the user value proposition.
- Added clear anonymous-exploration language: no account/name required to explore.
- Reframed How It Works around the user's journey rather than implementation terminology.
- Rewrote privacy messaging so anonymous exploration and identifiable handoff are understandable as separate stages.
- Strengthened provider/NGO positioning around consented requests and privacy-safe aggregate demand insight.
- Added reduced-motion handling to hero animation.
- Preserved the existing visual identity rather than redesigning the site.
- Updated Playwright regression coverage to use the new `Start the check-in` CTA.

## Failed attempts / lessons

The first UX-1 CI failed because `tests/baseline.spec.ts` still searched for the old CTA `View check-in demo` after the UI changed to `Start the check-in`.

A first fix was accidentally committed to the old `phase-1/core-architecture-data-boundaries` branch instead of the active `ux/homepage-positioning` branch. That did **not** fix PR #23. The same selector fix was then applied to the correct branch in commit `3db53361855b5cedd674d10883b9e01a5f583ff3`, after which CI #120 passed.

Operational lesson: after every intentional copy/interaction change, inspect Playwright selectors on the **active PR branch** before assuming CI reflects the fix.

## Next steps

UX-1 is closed. Do not continue polishing the homepage before UX-2 unless a concrete regression is found. The highest-value next work is the actual check-in experience.

---

# Stage 3 of 6 — UX-2: Human Check-in

## Goal

Transform the current questionnaire/wizard feeling into a calm guided interaction while preserving deterministic routing, privacy boundaries and frozen MVP behaviour.

The user should feel guided, not clinically assessed and not deceived into thinking an AI therapist is listening.

## Current state

**NEXT PHASE. NOT YET IMPLEMENTED.**

Current journey is broadly:

`age → primary concern → related concerns → optional context → area → preferences → review → services`

The underlying routing/state logic is valuable and should be preserved. The main UX problem is presentation: repeated question/button screens currently feel more like a form wizard than the promised calm support-navigation experience.

A known issue from the audit: the visible `Any support preferences?` stage currently offers essentially only `Continue without additional preferences`. A state-machine stage alone is not a valid reason for a user-facing screen. Either implement only preferences genuinely supported by routing/directory data, or remove/skip the visible stage while preserving required internal state.

## Active files

Primary:

- `components/check-in/IntegratedCheckIn.tsx`
- `lib/conversation/prompts.ts`
- `app/check-in/page.jsx`

Likely supporting files to inspect before editing:

- routing/service-discovery modules imported by `IntegratedCheckIn.tsx`
- locale/copy structures used by the integrated check-in
- `tests/baseline.spec.ts`
- any check-in styles/components already present under `components/check-in/`

## Changes made

None yet for UX-2.

## Failed attempts / constraints to remember

Do **not** replace deterministic routing with an LLM/chatbot.

Do **not** collect more sensitive information merely to make the flow feel personalised.

Do **not** remove the age/safety boundary for visual simplicity.

Do **not** expose a fake conversational agent or imply that someone is actively listening.

Do **not** change the privacy-domain architecture as part of UX work.

## Next steps

1. Create a fresh branch from current `main`, recommended name: `ux/human-check-in`.
2. Read `IntegratedCheckIn.tsx` end-to-end before editing.
3. Map each visible stage to a real routing/safety/product purpose.
4. Rewrite prompts/microcopy into calm human language in both EN and EL while preserving meaning.
5. Improve selection cards, progress/context, back/continue behaviour and mobile ergonomics.
6. Remove or bypass the valueless preferences screen unless real supported preferences exist in current directory/routing data.
7. Keep optional free text explicitly optional and local/private according to existing architecture.
8. Update Playwright tests in the same branch whenever labels/buttons change.
9. Run full CI. Do not merge red CI.
10. Open/merge UX-2 as a self-contained PR before starting UX-3.

---

# Stage 4 of 6 — UX-3: Review, Matching & Recovery

## Goal

Make the review step prove to the user that TalkPoint understood their selections, make service results explainable, and replace the current no-match dead end with transparent recovery options supported by real routing data.

## Current state

**PLANNED. NOT IMPLEMENTED.**

Audit findings to address:

- Review currently exposes too little information relative to its importance.
- Users should see the meaningful routing inputs that will be used and be able to correct them where feasible.
- Service cards should answer `Why this may fit` using deterministic, real directory attributes rather than machine-oriented reason strings.
- Do not introduce percentage match/confidence scores without a valid basis.
- Current no-match wording effectively tells the user to change area/topic or restart. That is too weak for a support-navigation product.

## Active files

Expected primary file:

- `components/check-in/IntegratedCheckIn.tsx`

Also inspect:

- deterministic service matching/routing modules
- service/provider directory data models and seed/demo data
- `tests/baseline.spec.ts`

## Changes made

None yet for UX-3.

## Failed attempts / constraints to remember

Never fabricate broader recommendations. Recovery may relax only constraints the routing/data model actually supports, and broadened results must be labelled as broader rather than exact matches.

Do not expose internal scoring as false clinical precision.

## Next steps

After UX-2 is merged:

1. Build a richer review summary with edit paths where feasible.
2. Define deterministic human-readable `why shown` explanations.
3. Improve service-card hierarchy: provider/service, support offered, why relevant, area/online availability, eligibility/access info where available, next action.
4. Implement no-match recovery such as broader geography, online support, or optional-filter relaxation only where current data supports it.
5. Preserve the user's selections during recovery.
6. Add regression tests for exact and broadened/no-match paths.

---

# Stage 5 of 6 — UX-4: Trust, Consent & Safety

## Goal

Polish the anonymous-to-identifiable transition, make sharing/consent understandable rather than merely compliant, and define a safe production boundary for immediate-support routing.

## Current state

**PLANNED. CORE ARCHITECTURE ALREADY EXISTS.**

The architecture already separates anonymous journey data from identifiable contact-request/consent data. The current handoff demo also has a sharing-preview step and explicit consent. This is a strong foundation and should be refined, not replaced.

The `I need help now` route exists as a deterministic safety state, but real Cyprus crisis/immediate-support content is **not production-ready without domain-expert/safeguarding validation**.

## Active files

Expected:

- `components/check-in/IntegratedCheckIn.tsx`
- `/api/demo-handoff` implementation
- contact-request / consent domain modules
- safety-routing modules/content
- privacy-domain tests
- `tests/baseline.spec.ts`

## Changes made

Core privacy separation, consent records, provider-specific handoff foundations and privacy-safe persistence were implemented before this UX programme. UX-4 should surface those guarantees clearly rather than redesign them.

## Failed attempts / constraints to remember

Do not imply that entering contact details retroactively identifies or shares the anonymous check-in.

Do not send the optional private/free-text check-in content unless the frozen specification explicitly allows it. Existing tests intentionally verify that fictional optional text does not leave the browser/storage path used by the demo.

Do not invent emergency resources or claim production safeguarding validation.

## Next steps

After UX-3:

1. Make the sharing preview explicit: what is shared, with whom, why, and what is not shared.
2. Preserve explicit consent and ability to cancel without losing service exploration.
3. Improve anonymous → identifiable transition copy.
4. Keep provider identity derived server-side rather than trusting client spoofing.
5. Produce a clear safety-content validation checklist for a qualified domain/safeguarding owner.
6. Add/extend regression tests for consent and safety states.

---

# Stage 6 of 6 — UX-5: Accessibility, Mobile & Validation

## Goal

Finish the UX programme with accessibility/responsive QA, robust loading/error/empty states, automated regression coverage and a structured usability-test plan.

## Current state

**PLANNED. SOME FOUNDATIONS ALREADY PRESENT.**

Existing work already includes semantic/accessibility-oriented controls, Playwright regression tests and reduced-motion handling in the UX-1 hero. This is not sufficient to call the full product accessible or mobile-validated.

## Active files

Whole user-facing surface, especially:

- `components/check-in/IntegratedCheckIn.tsx`
- homepage components
- navigation/footer components
- global CSS/theme files
- `tests/baseline.spec.ts`
- Playwright configuration

## Changes made

No dedicated UX-5 implementation yet.

## Failed attempts / constraints to remember

Do not treat automated accessibility checks as proof of usability.

Do not optimise desktop first and defer mobile. The check-in is likely to be used heavily on small screens, so tap targets, scroll behaviour, focus transitions and content density matter.

## Next steps

1. Keyboard/focus audit.
2. Semantic heading/landmark audit.
3. Contrast/readability audit.
4. Reduced-motion audit across all animated UI.
5. Mobile viewport QA across the full journey.
6. Loading/error/empty/offline-ish failure-state review where applicable.
7. Extend Playwright for the final intended journey and critical privacy/safety paths.
8. Prepare a structured usability-test script for approximately 5–8 participants.
9. Record issues as product evidence rather than adding speculative features.

---

# Technical state that must not be accidentally undone

The project previously spent substantial effort stabilising the real Payload/PostgreSQL runtime and CI. The following are considered working foundations:

- PostgreSQL runtime integration.
- Payload CMS integration.
- Provider organisations and provider-user/RBAC foundations.
- Provider/service directory foundations.
- Ephemeral anonymous conversation sessions.
- Strict anonymous analytics separation.
- Contact requests and consent records.
- Privacy-safe/redacted logging.
- Environment/secrets validation.
- Real PostgreSQL CRUD verification in CI.
- Committed/version-controlled Payload migration applied against a clean PostgreSQL database in CI.
- Production build and Playwright regression suite.
- Dependency security gate.

Important migration history: CI originally generated a Payload migration dynamically and normalised generated imports with shell/Node workarounds. This was deliberately replaced with a committed migration. Do **not** reintroduce `migrate:create` into CI as a substitute for version-controlled migrations.

Generated migrations are excluded from application ESLint because Payload-generated function signatures caused unused-argument warnings under `--max-warnings=0`; migrations are instead validated by actually applying them to a clean PostgreSQL database in CI.

---

# Working rules for the next engineer/agent

1. Start from `main`, not from old Phase 1 branches.
2. Treat `docs/TALKPOINT-MVP-SPEC.md` as frozen source of truth.
3. Treat `docs/PRODUCT-UX-CONTRACT.md` as the UX contract subordinate to the spec.
4. One UX stage per branch/PR.
5. Do not expand MVP scope while polishing UX.
6. Preserve deterministic routing and explainability.
7. Preserve the four-domain privacy architecture and anonymous/identifiable separation.
8. Never make production safety claims without validated content.
9. Update regression selectors whenever intentional UI copy changes.
10. Verify fixes are committed to the **active PR branch**.
11. Full CI must be green before merge.
12. If CI fails, inspect the actual failing job/log and fix it directly rather than adding broad workarounds.
13. Do not add advisory allowlists merely to silence dependency-security failures without review.
14. Do not weaken tests to make UX changes pass. Update tests only when the expected product behaviour intentionally changed.

# Immediate continuation command

The next person should begin with:

> Continue TalkPoint from `main` after UX-1. Read `HANDOFF.md`, `docs/TALKPOINT-MVP-SPEC.md`, `docs/PRODUCT-UX-CONTRACT.md`, and `components/check-in/IntegratedCheckIn.tsx`. Start UX-2 Human Check-in on a new branch from `main`. Preserve deterministic routing, privacy boundaries, bilingual EN/EL behaviour and frozen MVP scope. Implement the UX-2 goals in this handoff, update Playwright tests for intentional copy/interaction changes, run CI, fix any failures, and do not start UX-3 until UX-2 is green and merged.

# Current checkpoint

- Core architecture/data boundaries: complete and merged.
- Production committed-migration hardening: complete and merged.
- UX-0 Product Contract: complete and merged.
- UX-1 Homepage & Positioning: complete, CI #120 green, merged.
- **UX-2 Human Check-in: NEXT.**
- UX-3 Review, Matching & Recovery: pending.
- UX-4 Trust, Consent & Safety: pending.
- UX-5 Accessibility, Mobile & Validation: pending.
