# TalkPoint Production Directory Onboarding

Status: **production-directory mechanics implemented; no real provider records, partnerships or live directory approval are claimed**.

This runbook defines how future verified real provider/service data can enter the production directory without weakening the frozen synthetic/real separation.

## Core rule

A record existing in Payload is **not** enough for production publication.

Production directory publication fails closed unless the provider and service both satisfy all required provenance/freshness gates, and the service has its explicit final publication switch enabled.

No real provider records are seeded by the repository.

## Provider onboarding fields

A provider must have:

- authoritative `informationSource`;
- `informationCheckedAt` at or before the current time;
- `productionDirectoryVerified=true`;
- `productionDirectorySuppressed=false`;
- a permitted `productionDirectorySourceType`;
- a future `productionDirectoryNextReviewAt`.

These production verification controls are super-admin managed.

Verification means the directory information has passed the agreed content-check process. It **does not imply a partnership**, endorsement, assisted-contact permission or provider participation in a pilot.

## Service onboarding fields

A service must independently have:

- authoritative `informationSource`;
- `informationCheckedAt` at or before the current time;
- `productionDirectoryVerified=true`;
- `productionDirectorySuppressed=false`;
- a permitted `productionDirectorySourceType`;
- a future `productionDirectoryNextReviewAt`;
- `productionDirectoryEnabled=true`.

The service is excluded when any of those conditions fail, even when the provider remains eligible.

## Provenance categories

Permitted production provenance categories are:

- `official_provider_source`;
- `public_authority_source`;
- `provider_operational_confirmation`;
- `other_authoritative_source`.

The exact source remains recorded separately in `informationSource`.

A provider operational confirmation verifies information only. It does not grant permission for assisted contact.

Synthetic university demonstration provenance is always excluded from production directory eligibility.

## Freshness and next recheck

Every production-eligible provider and service requires a future next recheck time.

When `productionDirectoryNextReviewAt` is reached, the record automatically **fails closed** from production results without requiring a cleanup job or trusting an operator to remove it manually.

A next recheck must also be later than `informationCheckedAt`.

The repository does not invent a universal recheck cadence. The real directory owner must set cadence based on the approved operating process and the volatility of each service record.

## Suppression workflow

Use `productionDirectorySuppressed=true` whenever information becomes uncertain, stale, temporarily unavailable, disputed or operationally unsuitable for public display.

Suppression overrides prior verification and publication.

After corrected information is rechecked, the authorised operator may update the source/check date/next recheck and deliberately release suppression again.

## Directory-only vs integrated

Publication and assisted contact are separate decisions.

A service can be **Directory-only** with:

- `productionDirectoryEnabled=true`;
- `integrated=false`;
- `productionHandoffEnabled=false`.

That service may appear as a checked directory option while the user remains responsible for contacting it independently.

A service must not become integrated merely because public information exists or because the directory record is verified.

## Assisted-contact boundary

Production assisted contact still requires all existing handoff controls in addition to directory eligibility:

- `integrated=true`;
- `productionHandoffEnabled=true`;
- approved `productionHandoffProvider`;
- approved `productionHandoffOrganisation`;
- exact Sharing Preview;
- provider-specific explicit consent;
- non-synthetic eligible provider/service records.

The production handoff resolver rechecks production directory eligibility. A service that becomes stale, suppressed or unpublished after a Sharing Preview therefore fails closed rather than continuing to receive a request.

## Admin workflow

For a future real record:

1. create/update provider and service content from an authoritative source;
2. keep production gates closed while information is being checked;
3. classify the provenance source;
4. record the actual checked date;
5. record the approved next recheck date;
6. verify provider and service records;
7. ensure neither is suppressed;
8. enable the service for production directory publication;
9. verify the public production directory output;
10. keep the service Directory-only unless separate provider participation evidence supports integration.

Do not place provider agreements, personal operational-contact details or sensitive evidence documents into public directory fields.

## External evidence still required

PROD-10 does not complete:

- real provider participation or partnership approval;
- checked Cyprus provider/service dataset collection;
- ownership of ongoing rechecks;
- provider operational acceptance;
- safeguarding review;
- privacy/legal approval;
- production deployment evidence.

Use `docs/PROVIDER-VALIDATION-CHECKLIST.md` to record those real-world checks when they actually occur.
