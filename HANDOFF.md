# TalkPoint Continuation Handoff

Last updated: 2026-09-22
Repository: `AlexandrosStav99/SocialIsolation`
Current continuation branch: `main`
Latest completed UX stage: UX-4
UX-4 merge commit: `37eb9c0e3689c1d48304277f7ff3e385ae5a3fdc`
Post-merge CI: run #135, **green**

## Read this first

This is the operational continuation document for TalkPoint. Before changing product behaviour, read these in order:

1. `docs/TALKPOINT-MVP-SPEC.md` — frozen MVP source of truth.
2. `docs/PRODUCT-UX-CONTRACT.md` — locked product/UX contract subordinate to the frozen spec.
3. `docs/IMPLEMENTATION-PLAN.md`
4. `docs/PHASE-0-REVIEW.md`
5. `components/check-in/IntegratedCheckIn.tsx`
6. `components/check-in/HandoffPreview.tsx`
7. `components/Navbar.tsx`
8. `app/globals.css`
9. `docs/PHASE-9-ACCESSIBILITY-CHECKLIST.md`
10. `docs/SAFETY-CONTENT-VALIDATION-CHECKLIST.md`
11. `tests/baseline.spec.ts`

Do not redesign the product from assumptions. Core architecture, deterministic routing, the privacy domains, consent enforcement and production-hardening work are established and should be reused unless a real defect requires change.

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
- Real Cyprus immediate-support resources/copy require qualified safeguarding/domain validation before live deployment.
- Demo/synthetic services and disabled real requests must remain clearly disclosed.

---

# UX programme status

## UX-0 — Product Contract

**COMPLETE AND MERGED.** PR #22.

Locked proposition, boundaries, human/non-clinical interaction, deterministic explainable matching, no-dead-end recovery, privacy/consent expectations, safety validation boundary, accessibility baseline and out-of-scope features.

## UX-1 — Homepage & Positioning

**COMPLETE, CI GREEN, MERGED.** PR #23.

Merge commit: `957697d2e5aee66a6f40ac270c98ab8b9958ec1c`.

Implemented clear support-navigation positioning, CTA hierarchy, understandable privacy language, honest university-demo disclosure, user-journey-focused explanation and provider positioning.

## UX-2 — Human Check-in

**COMPLETE, CI GREEN, MERGED.** PR #24.

Merge commit: `18c831b24935786928eafc256539e9585cb8a5b8`.
PR CI #124: **success**.
Post-merge CI #125: **success**.

Implemented calm guided EN/EL interaction, non-numeric progress, selected states, Skip/Continue, Back navigation, non-destructive language switching, removal of the valueless visible preferences step, optional-context privacy guidance and local free-text clearing.

## UX-3 — Review, Matching & Recovery

**COMPLETE, CI GREEN, MERGED.** PR #25.

Merge commit: `533ae587caf4594266e4e83b4b726ed2d413edc8`.
PR CI #127: **success**.
Post-merge CI #128: **success**.

Implemented richer editable review, bilingual deterministic `Why this may fit`, provider/service detail hierarchy and honest no-exact-match recovery with broader directory records labelled as non-exact rather than fabricated matches.

## UX-4 — Trust, Consent & Safety

**COMPLETE, CI GREEN, MERGED.** PR #26.

Final PR head: `008a743b30914848de773e26fb6bcefc943a8437`.
Merge commit: `37eb9c0e3689c1d48304277f7ff3e385ae5a3fdc`.
PR CI #134: **success**.
Post-merge CI #135: **success**.

Implemented:

- structured bilingual Sharing Preview;
- exact recipient provider/service;
- explicit lists of what will and will not be shared;
- precise anonymous-session boundary: the anonymous session is not identified or linked to the fictional request; only the listed structured fields are copied after consent;
- provider-specific explicit consent;
- disabled confirmation before consent;
- `Cancel and keep exploring`, with no request created and results preserved;
- optional private free text, full check-in, safety history, viewed services, real contact details and exact location excluded from the demo handoff;
- corrected immediate-support wording that does not invent Cyprus resources or imply emergency capability;
- continuation of the existing check-in after closing the safety notice without losing progress;
- `docs/SAFETY-CONTENT-VALIDATION-CHECKLIST.md` as a production safety-content release gate;
- CI assertion that the safety content remains explicitly unvalidated pending qualified review.

Server-side consent enforcement, provider derivation, Consent Records, deterministic discovery, Payload/PostgreSQL and migrations were deliberately not redesigned.

---

# ACTIVE STAGE — UX-5: Accessibility, Mobile & Validation

## Goal

Finish the UX programme by correcting concrete accessibility/responsive defects, hardening loading/error behaviour, expanding browser regression coverage and documenting what automated evidence proves versus what still requires manual accessibility and target-user validation.

This stage is verification and hardening, not a new visual redesign and not a claim of WCAG conformance.

## Focused audit findings

### 1. Navbar has hidden-but-focusable desktop links

`components/Navbar.tsx` currently hides desktop navigation on scroll using opacity/translation and `pointer-events-none`. The links remain keyboard-focusable while visually hidden.

**Fix:** remove the scroll-hide behaviour rather than adding more state complexity. Keep primary navigation persistently visible on desktop.

### 2. Mobile-menu semantics and keyboard behaviour are incomplete

Current mobile toggle has a generic label but no `aria-expanded` or `aria-controls`. Escape does not close the menu or return focus to the toggle.

**Fix:** add explicit menu semantics, Escape-to-close and focus return. Keep tap targets usable on narrow screens.

### 3. Focus treatment is inconsistent outside the check-in

Several homepage/nav/footer links rely on browser defaults or hover only.

**Fix:** add explicit `focus-visible` treatment to primary navigation, secondary hero action, footer links, CTA links and provider contact link.

### 4. Document language remains English when the check-in switches to Greek

`app/layout.tsx` correctly defaults to `<html lang="en">`, but the client-side EL switch does not update the document language.

**Fix:** while the integrated check-in is mounted, sync `document.documentElement.lang` with EN/EL and restore the previous language on unmount.

### 5. Several real contrast failures exist

Theme audit:

- `#B8CBBF` (`sage`) on `#FBF6EE` is approximately 1.58:1 and must not be used for normal text.
- current `#6E756F` (`muted`) on the warm background is approximately 4.40:1, slightly below the normal-text 4.5:1 target.
- `#6E756F` on the dark CTA background is approximately 2.72:1 and fails.
- `#4A5249` on the dark CTA background is approximately 1.59:1 and fails.

**Fix direction:** minimally darken the global muted token for reliable normal-text contrast on the warm background and replace `text-sage` normal text on light surfaces. On the dark CTA section, use a sufficiently light text token. Preserve the visual system rather than recolouring the product broadly.

Known files with contrast issues include:

- `components/HeroSection.tsx`
- `components/HowItWorks.tsx`
- `components/PrivacySection.tsx`
- `components/ForNGOs.tsx`
- `components/Footer.tsx`
- `components/CTASection.tsx`

### 6. Landmark hierarchy can be improved

`app/page.tsx` and `app/about/page.tsx` currently wrap Navbar and Footer inside `<main>`.

**Fix:** Navbar and Footer should sit outside the page `<main>` landmark.

### 7. The handoff request has weak loading/failure behaviour

Current assisted-demo request can be submitted again while an in-flight request is running and a network exception is not converted into a useful user-facing state.

**Fix:**

- add explicit submitting state;
- disable duplicate submission while in flight;
- announce progress accessibly;
- handle network/server failure without losing discovery results or consent-preview context;
- allow retry;
- after success, close the preview/reset consent so the same request is not accidentally repeated;
- do not make false claims about request state if the client loses the response.

Do not change the server-side consent architecture unless testing exposes a real defect.

### 8. Mobile regression evidence is too weak

The accessibility checklist mentions a 375px overflow check but current browser coverage does not sufficiently exercise the final check-in/results/sharing-preview experience at a narrow viewport.

**Fix:** add explicit 375px regressions for homepage/mobile navigation and the integrated check-in through a meaningful result/preview state, including horizontal-overflow assertions.

### 9. Reduced-motion support exists but should be regression-locked

Global CSS and the hero already respect `prefers-reduced-motion`.

**Fix:** add browser evidence rather than redesigning animation.

### 10. Manual accessibility and usability evidence must remain honest

`docs/PHASE-9-ACCESSIBILITY-CHECKLIST.md` correctly says WCAG 2.2 AA is a target, not a certification, and deliberately leaves manual checks incomplete.

**Do not falsely mark manual items complete.** Automated browser checks are not proof of screen-reader usability, contrast compliance across every state, or WCAG conformance.

Create final validation documentation that separates:

- automated evidence completed by CI;
- static/implementation review completed in UX-5;
- manual accessibility checks still required;
- target-user usability work still required.

Create a structured usability-test plan for approximately 5–8 target participants aged 18–30. It is a **plan only** until sessions are actually run; do not invent participant findings.

## UX-5 implementation direction

Use a dedicated branch from the latest green `main`, recommended: `ux/accessibility-mobile-validation`.

Likely files:

- `app/globals.css`
- `app/page.tsx`
- `app/about/page.tsx`
- `components/Navbar.tsx`
- `components/Footer.tsx`
- `components/HeroSection.tsx`
- `components/HowItWorks.tsx`
- `components/PrivacySection.tsx`
- `components/ForNGOs.tsx`
- `components/CTASection.tsx`
- `components/check-in/IntegratedCheckIn.tsx`
- `components/check-in/HandoffPreview.tsx`
- `tests/baseline.spec.ts`
- `scripts/check-phase9-ux.mjs`
- `docs/PHASE-9-ACCESSIBILITY-CHECKLIST.md`
- new UX-5 validation/usability documents

## UX-5 acceptance criteria

Before merge:

- no visually hidden desktop navigation remains keyboard-focusable;
- mobile navigation exposes correct expanded state and closes via Escape with focus return;
- critical links/buttons have visible keyboard focus treatment;
- document `lang` tracks EN/EL in the check-in;
- known small-text contrast failures are corrected without broad visual redesign;
- homepage/about landmark hierarchy is semantically sound;
- assisted demo cannot be double-submitted while in flight;
- handoff network/server failures produce an accessible recoverable error state;
- successful handoff cannot be accidentally resubmitted from a stale consent preview;
- 375px homepage/check-in/Sharing Preview paths show no horizontal overflow;
- reduced-motion behaviour is regression-tested;
- EN/EL critical states remain complete;
- existing privacy, consent, safety, routing and no-match tests remain green;
- accessibility documentation distinguishes automated evidence from manual checks;
- usability-test plan exists but does not fabricate results;
- no WCAG compliance claim is made;
- full CI is green: dependency security, zero-warning lint, TypeScript, Phase 1–10 checks, Payload/PostgreSQL, migration verification, build and Playwright.

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
14. Automated accessibility tests are evidence, not a WCAG certification.
15. Do not fabricate usability-test results or safety/domain validation.

# Immediate continuation

> Continue TalkPoint from `main` after UX-4. Take ownership of UX-5 Accessibility, Mobile & Validation on a dedicated branch. Fix the concrete accessibility/responsive/error-state issues recorded in this handoff, strengthen automated evidence, document remaining manual validation honestly, create the target-user usability-test plan, run full CI and fix root causes before merge.

# Current checkpoint

- Core architecture/data boundaries: complete and merged.
- Production migration/runtime hardening: complete and merged.
- UX-0 Product Contract: complete and merged.
- UX-1 Homepage & Positioning: complete and merged.
- UX-2 Human Check-in: complete and merged.
- UX-3 Review, Matching & Recovery: complete and merged.
- UX-4 Trust, Consent & Safety: complete, PR #26 merged, post-merge CI #135 green.
- **UX-5 Accessibility, Mobile & Validation: ACTIVE FINAL UX STAGE.**
