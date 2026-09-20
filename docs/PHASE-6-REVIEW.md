# Phase 6 Review - Assisted Contact & Consent

## Goal
No identifiable request may exist unless the user deliberately chooses assisted contact, sees what will be shared and gives provider-specific explicit consent.

## Implemented
- Self-service contact path that creates no identifiable request.
- Sharing Preview contract.
- Optional preferred name.
- Exactly one contact method: email or phone.
- Provider/service-specific assisted-contact input.
- Explicit consent gate before request creation.
- Separately consented optional note.
- Minimum-data ContactRequest creation.
- Separate ConsentRecord with consent version, recipient, authorised categories and timestamp.
- Random request ID, consent ID and separate random management ID.
- Demo withdrawal/deletion mechanism: management ID authorises deletion of the identifiable request and marks the minimal consent record withdrawn.
- No transcript, raw answers, AI reasoning, safety trigger history or browsing history in the handoff contract.

## Boundary
The management ID must be treated as a secret bearer credential in any UI/storage implementation. Production retention durations and legal wording remain subject to legal/privacy review.

## Exit assessment
Phase 6 is complete when cumulative CI passes and creation of an identifiable request is structurally impossible without explicit consent.
