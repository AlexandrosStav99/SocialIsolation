# TalkPoint Validation Baseline RC1

Status: **frozen validation baseline**  
Baseline ID: `RC1-2026-09-27`  
Frozen branch: `validation/2026-09-27-rc1`  
Frozen commit: `dc8aeb6e4ef49a93605e7600e27376ca43b5f420`

## Purpose

This record fixes the exact repository revision to be used for the first real manual accessibility and target-user validation cycle.

Validation findings must reference this baseline unless a documented defect is corrected. If a correction is required, create a dedicated PR, run full CI, retest the finding and record the new build/commit used for the retest.

## Engineering evidence

The frozen commit is the merge result of PR #55, which only added/updated validation documentation.

Full CI evidence for the PR source tree:

- PR: **#55**
- CI run: **#283**
- CI result: **success**
- PR head SHA: `4808cc142e52a150fc7980853073bbf52d8cb6f8`
- frozen merge SHA: `dc8aeb6e4ef49a93605e7600e27376ca43b5f420`

A GitHub commit comparison between the green PR head and frozen merge SHA reports **0 changed files**. The merge adds no source-tree difference from the build exercised by CI #283.

CI #283 completed the full repository pipeline, including:

- dependency/security gates;
- lint and TypeScript;
- all phase boundary checks;
- production configuration/auth/workspace/handoff/retention/API/operations/deployment/accessibility/directory/safety/privacy engineering gates;
- clean PostgreSQL migration;
- persistence regressions;
- production build;
- Chromium installation;
- Playwright production regressions.

Green CI is engineering evidence only. It does not self-approve accessibility, safeguarding, privacy/legal, provider or target-user validation.

## Validation runtime

For university validation:

- use the controlled `demo` runtime;
- keep synthetic provider/service records clearly labelled;
- synthetic fallback may be used only within the documented demo boundary;
- do not send a real provider request;
- do not describe the environment as a live support service;
- do not enable real safety/provider/privacy production gates merely for testing.

## Frozen product boundaries

The validation build must continue to preserve:

- anonymous exploration separate from identifiable contact;
- no identity in anonymous check-in;
- bounded optional free text not shared by default;
- deterministic/explainable service discovery;
- no LLM provider selection or safety-state authority;
- provider-specific exact Sharing Preview and explicit consent;
- server-derived provider identity;
- anonymous analytics separate from identifiable requests;
- no emergency/clinical capability claim;
- explicit synthetic/demo disclosure.

## Change control during validation

Do not modify the frozen branch.

When validation exposes a material issue:

1. record the finding against `RC1-2026-09-27`;
2. reproduce it;
3. classify it as code, content/configuration or external-process;
4. create a narrowly scoped branch/PR only if repository change is justified;
5. run full CI;
6. merge only after green CI;
7. retest the original finding on the corrected build;
8. record the new commit and retest evidence;
9. create a new validation baseline only when the evaluated build materially changes.

## Evidence references

- Master execution plan: `docs/GO-LIVE-ACADEMIC-CLOSURE-CHECKLIST.md`
- Manual accessibility protocol: `docs/MANUAL-ACCESSIBILITY-TEST-PROTOCOL.md`
- Accessibility run template: `docs/ACCESSIBILITY-MANUAL-RUN-RECORD.md`
- Usability plan: `docs/UX-5-USABILITY-TEST-PLAN.md`
- Usability record template: `docs/USABILITY-SESSION-RECORD-TEMPLATE.md`
- Validation evidence matrix: `docs/VALIDATION-EVIDENCE-MATRIX.md`
- Academic closure template: `docs/ACADEMIC-CLOSURE-TEMPLATE.md`

## Baseline decision

**RC1 is frozen for the first external/manual validation cycle.**

This decision freezes an evaluated engineering build. It is not a production launch decision and does not change any external validation gate to complete.
