# TalkPoint Safety Content Validation Checklist

Status: **Not production validated**  
Applies to: immediate-support wording, trigger interpretation and Cyprus support-resource content  
Owner required before real deployment: qualified safeguarding / domain expert

## Purpose

This checklist defines the evidence required before TalkPoint may publish real immediate-support resources or claim that its safety-routing content is suitable for real-world use.

It is **not** evidence that the current safety content has already been validated. The current university demonstration intentionally keeps the safety matrix and real Cyprus resource content behind a validation boundary.

TalkPoint is support navigation, not an emergency, clinical-risk-assessment or crisis-response service.

## 1. Qualified owner and accountability

Before production use, record:

- named safeguarding/domain owner;
- role and relevant expertise;
- organisation or academic/pilot authority under which they are reviewing;
- review date;
- version of the trigger matrix and user-facing content reviewed;
- explicit approval, rejection or required changes.

A developer or product owner alone must not self-approve the production safety content.

## 2. Trigger matrix review

Review every structured trigger individually, including:

- `user_requests_help_now`;
- `immediate_danger_selected`;
- `recent_violence_selected`;
- any future trigger added through a formally approved specification change.

For each trigger confirm:

- the trigger is understandable and not framed as diagnosis;
- it does not infer a clinical risk score;
- it does not depend on optional free text in the MVP;
- it does not cause automatic third-party notification;
- the user retains agency to continue normal navigation;
- the resulting prominence/wording is proportionate and does not overstate TalkPoint capability.

## 3. Immediate-support resource verification

Every real resource displayed must have independently checked evidence for:

- official provider/organisation name;
- correct phone number, URL or other contact route;
- geographical scope, including whether it serves Cyprus nationally or only specific areas;
- intended audience / eligibility;
- operating hours and whether the channel is 24/7;
- language availability where claimed;
- whether the service is genuinely appropriate to label as immediate support;
- authoritative source URL or other provenance;
- date checked;
- revalidation/expiry date or review cadence.

Do not copy resources from unverified aggregators or generated content.

## 4. Wording review

The qualified reviewer must approve the exact EN and EL wording for:

- the persistent `I need help now` / `Χρειάζομαι βοήθεια τώρα` action;
- the immediate-support heading;
- explanatory notice;
- resource labels and descriptions;
- any statements about urgency, availability or provider capability;
- user choice to continue the normal TalkPoint journey.

The wording must not:

- imply that TalkPoint itself provides emergency intervention;
- claim that TalkPoint has detected a user as `high risk`;
- diagnose, assess severity or prescribe action;
- imply monitoring by a human or clinician;
- guarantee that an external resource is available or suitable.

## 5. Bilingual parity

English and Greek content must be reviewed as complete user-facing versions, not as a mechanical translation exercise.

Confirm that:

- meaning and urgency are equivalent;
- provider/resource names and contact details are identical where they should be;
- no safety qualifier exists in one language but not the other;
- terminology is understandable to the intended 18–30 audience.

## 6. Accessibility and interaction review

Validate the real safety presentation for:

- keyboard access;
- visible focus;
- screen-reader announcement without trapping the user;
- readable contrast;
- mobile readability and tap targets;
- no critical information conveyed by colour alone;
- continued access to the normal journey where permitted by the locked specification.

## 7. Privacy and data-boundary review

Confirm that safety routing does not weaken the frozen privacy architecture:

- no identity is collected merely because the safety notice is opened;
- optional free text is not used as an autonomous safety classifier in the MVP;
- safety-route history is not included in provider handoff by default;
- no automatic third-party notification occurs;
- operational logs do not contain raw user content.

## 8. Failure and stale-data behaviour

Define and test what happens when:

- a resource becomes unavailable;
- a phone number/URL changes;
- availability cannot be confirmed;
- the resource dataset is stale;
- a localisation is incomplete;
- the safety-content configuration fails to load.

The safe fallback must not invent replacement resources. Unverified content should be suppressed rather than presented as current fact.

## 9. Evidence package required for production sign-off

Retain:

- final reviewed trigger matrix version;
- final EN/EL copy;
- checked-resource table with source and checked date;
- reviewer identity/role and sign-off date;
- accessibility/manual QA notes;
- test evidence for critical safety routes;
- known limitations and unresolved risks;
- next scheduled revalidation date.

## 10. Release gate

Real immediate-support resources may be enabled only when all required items above have documented approval.

Until then:

- `SAFETY_MATRIX_VALIDATION_STATUS` remains `requires_domain_expert_validation`;
- the university demonstration must not invent or publish unvalidated Cyprus crisis/immediate-support contacts;
- product copy must continue to state that TalkPoint is not an emergency or clinical service.
