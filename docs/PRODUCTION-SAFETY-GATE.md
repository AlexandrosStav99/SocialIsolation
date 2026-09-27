# TalkPoint Production Safety Gate

Status: **engineering gate implemented; safeguarding/domain approval is not complete**.

PROD-11 adds the technical boundary needed to prevent unreviewed immediate-support wording/resources from appearing in production. It does not perform or claim the required qualified safeguarding review.

## Two independent gates

Production safety activation requires **two independent gates**:

1. version-controlled safety configuration whose trigger matrix status, exact EN/EL wording, resource list, approval reference and review dates pass the production validator; and
2. the server-side operational flag `TALKPOINT_PRODUCTION_SAFETY_ENABLED=true`.

The environment flag does not self-approve safety content. Setting it to true while the version-controlled configuration remains unapproved still fails closed.

The repository currently ships with:

- `SAFETY_MATRIX_VALIDATION_STATUS=requires_domain_expert_validation`;
- production safety version `unapproved`;
- no approval reference;
- no approved presentation;
- no approved resources;
- `TALKPOINT_PRODUCTION_SAFETY_ENABLED=false` in the environment inventory.

No real Cyprus immediate-support resource is introduced by PROD-11.

## Version-controlled trigger rules

The deterministic trigger matrix remains in application code.

Payload is not a CMS-editable safety/routing rules engine. Provider/content administrators cannot change the immediate-support trigger logic through directory CMS fields.

The current structural triggers remain:

- `user_requests_help_now`;
- `immediate_danger_selected`;
- `recent_violence_selected`.

They remain structural placeholders pending the external review defined in `docs/SAFETY-CONTENT-VALIDATION-CHECKLIST.md`.

## Production check-in behaviour

The production `/check-in` server boundary resolves the production safety configuration before rendering the interactive check-in.

If the operational gate is disabled, the matrix is not approved, approval evidence is incomplete, wording is incomplete, resources are missing, or review/resource freshness has expired, the production check-in **fails closed** to a neutral temporarily-unavailable state.

It does not fall back to university-demo safety content and does not invent substitute resources.

Development/demo mode continues to use the clearly labelled university demonstration copy and zero real safety resources.

## Approval configuration requirements

A future approved production configuration must provide:

- matrix status `approved`;
- non-placeholder version;
- approval/evidence reference;
- review date;
- future next-review date;
- complete EN and EL action/heading/notice/continue/resource metadata labels;
- at least one independently checked approved immediate-support resource.

Every resource must include:

- stable ID;
- EN/EL name and description;
- EN/EL scope;
- EN/EL audience/eligibility;
- EN/EL availability;
- supported language list;
- approved phone or public HTTPS contact route;
- authoritative public HTTPS information source;
- checked date;
- future next-review date;
- explicit `immediateSupportApproved=true`.

The validator rejects stale resources, stale overall approval, incomplete bilingual copy, unsupported contact schemes and resources lacking explicit immediate-support approval.

## External review workflow

When real safeguarding evidence exists:

1. execute `docs/SAFETY-CONTENT-VALIDATION-CHECKLIST.md` with the qualified reviewer;
2. retain the real evidence reference outside public source code where appropriate;
3. update the version-controlled trigger-matrix approval status only to match that evidence;
4. add the exact approved EN/EL presentation and checked resources to the version-controlled production safety configuration;
5. add the approved version/reference/review dates;
6. run the full CI suite;
7. perform the manual accessibility/safety presentation checks required by the validation checklist;
8. only then enable `TALKPOINT_PRODUCTION_SAFETY_ENABLED=true` in the real production secret/configuration system;
9. run production preflight and deployment verification.

Changing code/configuration without the external review does not make the safety gate approved.

## Stale/failure behaviour

The production configuration and every resource have explicit review freshness boundaries.

If the next-review date passes, the production safety resolver rejects the configuration. The check-in then fails closed rather than displaying stale contact information.

A malformed or unavailable safety configuration follows the same fail-closed path.

## Resource rendering

Approved resources are rendered only from the server-selected production safety presentation. The client does not import the production configuration directly.

Phone contacts become `tel:` links. Web contacts and provenance links must be public HTTPS URLs.

The immediate-support state still:

- makes no diagnosis;
- performs no clinical risk scoring;
- sends no automatic third-party notification;
- does not use optional free text as an autonomous safety classifier;
- preserves the user's ability to continue the normal journey.

## Deployment preflight

`npm run deploy:preflight` now requires the approved production safety presentation in addition to the existing production runtime/database checks.

Therefore a production environment cannot pass the repository deployment preflight merely by supplying infrastructure credentials while safeguarding content remains unapproved.

## Claim boundary

After PROD-11 it is defensible to say:

> TalkPoint has a fail-closed, version-controlled production safety activation mechanism that can accept externally approved bilingual wording and checked resources.

It is not defensible to say:

> TalkPoint's safety matrix, wording or Cyprus immediate-support resources have been safeguarding-approved.

That remains an external evidence gate.
