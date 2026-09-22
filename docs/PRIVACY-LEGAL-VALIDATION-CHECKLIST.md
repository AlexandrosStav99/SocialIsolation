# TalkPoint Privacy & Legal Validation Checklist

Status: **not legally validated**. This checklist structures the final Cyprus/EU privacy/legal review required before real operation. It is not legal advice and does not claim that any item has been approved.

Qualified review is required before converting the university demonstration into a real service.

## 1. Roles and accountability

Record and approve:

- controller(s) for anonymous analytics, provider directory and contact requests;
- processor/sub-processor roles where applicable;
- responsibilities of any university, platform operator and participating provider;
- contact point for privacy/data-subject requests;
- records of processing / governance ownership where required.

## 2. Lawful basis and purpose limitation

For each data domain in the frozen architecture, document:

- purpose;
- data categories;
- lawful basis relied upon;
- whether explicit consent is used and what it authorises;
- recipients;
- retention rule;
- whether any special-category-data implications arise in the real deployment context;
- why the collection is necessary and proportionate.

Do not treat the provider-specific handoff consent as a blanket legal basis for unrelated processing.

## 3. Anonymous exploration boundary

Confirm that real deployment preserves:

- no account/identity requirement for anonymous exploration;
- no date of birth collection, only 18+ confirmation;
- no GPS/postcode/exact-address collection in the check-in;
- optional free text remains optional and bounded;
- raw anonymous conversation is not retained after expiry/end;
- anonymous analytics are not directly linkable to identifiable contact requests;
- optional free text is not shared without separate explicit authorisation.

## 4. Assisted-contact transparency and consent

Review exact EN/EL Sharing Preview and consent wording for:

- clear recipient provider;
- purpose;
- exact data categories shared;
- excluded data categories;
- optional-note treatment;
- withdrawal/deletion mechanism;
- consequences of declining consent;
- versioning/audit evidence.

Confirm consent is freely given, specific, informed and unambiguous where it is relied upon.

## 5. Privacy notice and user information

Review final EN/EL notices for:

- operator/controller identity;
- purposes and lawful bases;
- recipient categories;
- international transfer information where applicable;
- retention criteria;
- data-subject rights;
- complaint route;
- automated decision-making statement where relevant;
- distinction between anonymous exploration, analytics and provider contact.

Do not use unsupported “GDPR compliant” language.

## 6. Retention and deletion

Approve exact production retention rules for:

- abandoned/expired anonymous sessions;
- identifiable contact requests by lifecycle/status;
- consent records;
- provider operational audit metadata;
- anonymous analytics;
- logs/backups.

Confirm technical deletion/anonymisation procedures match the policy and can be evidenced.

## 7. Data-subject and withdrawal procedures

Validate the random request-ID / secure management mechanism and operational process for:

- consent withdrawal;
- deletion requests;
- access/correction where applicable;
- identity verification proportionate to the request without creating unnecessary account data;
- provider coordination where data has already been shared.

## 8. Vendors and transfers

For every real third party, including hosting, email/contact infrastructure, analytics and AI provider where enabled, record:

- role;
- data received;
- contractual basis / DPA where required;
- hosting/processing location;
- transfer mechanism where relevant;
- retention/logging configuration;
- security configuration;
- whether contact identity or sensitive content is exposed.

The frozen architecture forbids contact details and assisted-request identity fields from being sent to the AI provider.

## 9. Security and operational controls

Legal/privacy review should confirm the production plan covers, as applicable:

- authentication and MFA;
- organisation-scoped access;
- least privilege;
- audit logs;
- secrets management;
- encryption in transit/at rest;
- backups and deletion interaction;
- incident response and breach procedures;
- vulnerability/security review;
- environment separation.

Green university CI is not a substitute for production security assessment.

## 10. DPIA / risk-assessment decision

Record whether a DPIA or other formal privacy-risk assessment is required for the intended deployment, by whom that determination was made and the rationale.

If required, complete it before real operation and link the approved version here.

## Sign-off record

- Reviewer name/role:
- Qualification/authority:
- Review date:
- Build/spec version reviewed:
- Decision: Approved / Approved with conditions / Changes required / Rejected
- Required changes:
- Evidence links:
- Next review date:

## Release gate

Until this review is actually completed, TalkPoint must remain described as a controlled university implementation rather than legally/privacy validated for live operation.
