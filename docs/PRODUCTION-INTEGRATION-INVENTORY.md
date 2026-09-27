# TalkPoint Production Technical Integration Inventory

Status: **technical inventory only; legal/vendor role review is not complete**.

This file records integrations visible in the repository so the authorised privacy/legal review has a concrete starting point. It does not decide controller/processor/sub-processor roles, contractual sufficiency, transfer mechanisms, hosting regions or DPA status.

## Inventory rule

For every real production deployment, reconcile this repository inventory with the actual infrastructure and enabled configuration. An installed dependency is not automatically an active production recipient of data.

| Integration / boundary | Technical purpose | Data that code can send / store | Identifiable contact data? | Current repository state | Legal/operational evidence still required |
| --- | --- | --- | --- | --- | --- |
| Payload CMS + PostgreSQL | Primary application persistence | Directory records, provider identities/sessions, ephemeral anonymous sessions, anonymous aggregate events, ContactRequests, ConsentRecords, provider audit events, rate-limit buckets | **Yes**, for the identifiable request domain | Implemented; actual managed DB/hosting vendor not selected in-repo | Real hosting/operator identity, location, contracts/roles, encryption/backup/log settings, retention interaction |
| OpenAI Responses API | Optional bounded language assistance for the anonymous check-in | Language, allowlisted support topics, and bounded free text after email/phone-pattern redaction | **Forbidden by architecture** for ContactRequest identity/contact fields | Optional; used only when an API key/provider is configured; request sets `store:false`; deterministic fallback exists | Whether enabled in production, contractual/legal role, processing location/transfer assessment, retention/log settings, approved model/config |
| Mapbox browser assets | Optional map rendering for the controlled dashboard preview | Browser requests for map tiles/assets; current demo sends fixed synthetic district centroids, not user GPS/address | No intended ContactRequest identity | Optional public browser token; dashboard is server-gated demo functionality | Whether enabled in any real environment, privacy notice/cookie/network implications, account/region/config evidence |
| Real support provider recipient | Recipient chosen by the user for an approved assisted-contact request | Exact server-authoritative Sharing Preview fields and separately authorised optional note | **Yes**, only after provider-specific explicit consent | Engineering boundary exists; no real provider participation is claimed | Provider agreement, roles/responsibilities, security, retention/deletion coordination, incident contact, approved pilot scope |
| Hosting / reverse proxy / CDN / DNS | Application delivery and trusted ingress | Depends on selected infrastructure; network/HTTP metadata may exist outside application persistence | Deployment-specific | Not selected/provided in repository evidence | Real vendor inventory, logging, location, transfers, access controls, retention, DPA/contract review |
| Authentication email delivery | Provider account recovery/identity operations if enabled | Provider-user email/recovery metadata | Provider-user identity | No production delivery adapter/provider/credentials supplied | Vendor selection, role/contracts, delivery/log retention, security configuration |
| Monitoring / alerting / log destination | Operational monitoring | Privacy-safe application event vocabulary is implemented; infrastructure logs depend on selected platform | Must not be assumed absent | No external monitoring vendor selected in repository evidence | Real destination, access control, retention, redaction verification, incident ownership |

## OpenAI boundary

The code in `lib/ai/privacy.ts` truncates optional free text to 500 characters and redacts email/phone-shaped strings before it reaches the AI provider. The provider request contains language, minimised free text and the allowlisted topic vocabulary.

The AI provider must not receive:

- preferred name;
- email/phone contact fields from a ContactRequest;
- request-management credential;
- ContactRequest ID;
- provider-specific identifiable request record;
- raw safety history or AI chain-of-thought.

This technical minimisation does not replace a real privacy/legal assessment of the AI integration.

## Anonymous data is intentionally not re-linkable

The self-service request copy introduced in PROD-12 returns only the identifiable request/consent material linkable through the random request ID and management credential.

It does not join or infer:

- anonymous session history;
- anonymous analytics;
- browsing history;
- provider internal audit-user identities.

That separation is a privacy architecture boundary, not an assertion about the legal scope of every formal access request.

## Maintenance

Before production approval:

1. compare this file with the deployed architecture and environment variables;
2. add/remove integrations based on what is actually enabled;
3. record the real vendor/service identity where one exists;
4. have the authorised reviewer determine legal roles, contracts, transfers and notice requirements;
5. version the approved inventory and reference that version from the production privacy configuration.

Do not mark this technical inventory as a completed Article 30 record, DPA register, DPIA or legal vendor assessment.
