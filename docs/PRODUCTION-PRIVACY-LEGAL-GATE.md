# TalkPoint Production Privacy / Legal Gate

Status: **engineering gate implemented; final privacy/legal review is not complete**.

PROD-12 provides fail-closed mechanics for a future authorised privacy/legal release package. It does not supply legal advice or make the missing legal determinations.

## Two independent gates

Production privacy/legal activation requires both:

1. a version-controlled `productionPrivacyConfiguration` whose review status, approved wording, consent version, retention values and evidence references pass validation; and
2. `TALKPOINT_PRODUCTION_PRIVACY_ENABLED=true` in the real server configuration.

The environment flag cannot self-approve legal/privacy content.

The repository ships with:

- review status `requires_privacy_legal_review`;
- version `unapproved`;
- no controller/privacy notice wording;
- no legal approval reference;
- no approved retention values;
- no approved data-subject procedure reference;
- operational privacy gate disabled.

## Approved package requirements

A future authorised configuration must contain:

- non-placeholder privacy package version;
- exact consent version;
- approval/evidence reference;
- review date and future next-review date;
- approved technical-integration-inventory version;
- approved data-subject procedure reference;
- exact approved retention values for ContactRequests, ConsentRecords, provider audit events and anonymous analytics;
- complete EN and EL privacy information.

The bilingual notice contract requires exact reviewed wording for:

- controller/operator identity;
- summary;
- anonymous exploration;
- analytics;
- assisted contact;
- provider-specific consent statement;
- retention;
- data-subject rights;
- privacy contact route;
- complaint route;
- international transfers where applicable;
- automated decision-making statement.

Engineering does not fill these fields with guessed legal language.

## Runtime binding

The approved consent version must exactly match `TALKPOINT_PRODUCTION_CONSENT_VERSION`.

The approved retention policy must exactly match the four runtime retention environment values.

A runtime configuration drift therefore invalidates the production privacy package until reviewed/configured consistently again.

## Production check-in

The production check-in now requires both an approved/current safety package and an approved/current privacy package.

If either gate is absent or stale, the check-in fails closed to the neutral unavailable state. It does not fall back to university-demo privacy/safety wording.

When an approved privacy package exists, its EN/EL notice is supplied from the server boundary and displayed in the production check-in.

## Assisted-contact consent

`POST /api/handoff/preview` and `POST /api/handoff` require the approved privacy package.

The Sharing Preview response includes:

- the approved privacy-notice version;
- the exact approved EN and EL assisted-contact consent statements;
- the existing exact recipient/share data and consent version.

The consent version remains persisted in the separate ConsentRecord. Governance must issue a new consent version whenever the approved assisted-contact consent wording materially changes.

This engineering convention does not determine the lawful basis for unrelated processing.

## Self-service request data copy

`POST /api/handoff/manage/access` accepts only:

- random public request ID;
- request-management credential.

It uses the same anti-enumeration credential boundary as withdrawal.

For an active request it can return a technical copy of:

- the identifiable ContactRequest fields;
- recipient/service names where resolvable;
- the separate ConsentRecord evidence.

It deliberately omits internal hashes/envelopes and does not re-link anonymous exploration or anonymous analytics.

After user withdrawal/deletion, the same valid credential returns only the minimal surviving deletion/consent evidence. Deleted contact details are not reconstructed.

This endpoint is a technical self-service mechanism, **not a legal determination that its payload exhausts every possible formal subject-access obligation**. The authorised procedure may require additional operational handling.

## Withdrawal and deletion continuity

The existing PROD-5 withdrawal path remains available independently of whether new production privacy approval is currently enabled. Existing users must not lose their request-deletion path merely because a future release gate is disabled.

Withdrawal deletes the identifiable ContactRequest transactionally and retains only the minimal consent/deletion tombstone already required for deletion/idempotency evidence.

Provider-side/downstream deletion coordination remains an operational/legal procedure where data has already been shared.

## Technical integration inventory

`docs/PRODUCTION-INTEGRATION-INVENTORY.md` records integrations visible in source code and the type of data they can technically receive.

It intentionally does not assign legal roles or assert DPA/transfer compliance. The approved production privacy configuration must reference the inventory version actually reviewed for the real deployment.

## Deployment preflight

Production preflight now requires:

- runtime/config safety checks;
- approved/current safety package;
- approved/current privacy/legal package;
- exact consent-version match;
- exact approved retention-policy match;
- database readiness.

Therefore infrastructure credentials alone cannot make the repository pass production preflight.

## Claim boundary

After PROD-12 it is defensible to say:

> The repository contains fail-closed engineering mechanisms for externally approved privacy wording, consent/version/retention binding, self-service request data copy, withdrawal/deletion continuity and technical integration inventory.

It is not defensible to say:

> TalkPoint is GDPR compliant, legally approved, has an approved lawful basis/DPIA, or has completed controller/processor/transfer determinations.

Those remain external legal/privacy evidence gates.
