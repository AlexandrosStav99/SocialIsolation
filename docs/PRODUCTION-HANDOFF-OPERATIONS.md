# Production Handoff Operations Boundary

Status: **PROD-4 engineering complete; not evidence of real-provider participation or privacy/legal approval**.

## Entry points

- `POST /api/handoff/preview` creates the server-authoritative Sharing Preview.
- `POST /api/handoff` persists the explicitly consented request represented by that preview.

Both routes are production-only. The controlled `/api/demo-handoff` path remains separate and synthetic.

## Recipient authority

The client supplies only a selected service identifier and structured user choices. The server:

1. loads the selected service from Payload/PostgreSQL;
2. requires `integrated=true`;
3. requires `productionHandoffEnabled=true`;
4. rejects records marked with the synthetic demonstration information source;
5. verifies the service still matches the submitted support context;
6. derives the provider and provider organisation server-side.

The production handoff enable flag defaults closed and is restricted to super-admin mutation.

## Exact Sharing Preview

The production preview is generated server-side and contains the exact provider/service recipient and exact data categories proposed for sharing.

A signed preview token binds:

- selected service;
- provider identity;
- provider organisation;
- exact contact details;
- structured support topics/area;
- optional preferred name;
- optional note when separately authorised;
- configured consent version.

The final handoff rejects a missing, forged or stale preview token.

The structured support summary is generated server-side from controlled structured fields. Client-supplied arbitrary summary text is not accepted.

The current frozen UX exposes no real support-preference options, therefore production handoff rejects non-empty preference values rather than allowing an arbitrary string channel.

## Persistence and idempotency

ContactRequest and ConsentRecord are created in the same PostgreSQL transaction.

The final route requires an `Idempotency-Key` header. TalkPoint stores:

- SHA-256 hash of the idempotency key;
- hash of the exact final payload;
- a unique database index on the idempotency-key hash.

Exact retries return the original request. Reuse of the same key for a different payload is rejected.

## Request-management credential

The request-management identifier remains a random bearer credential, consistent with the frozen Phase 6 contract.

For production persistence:

- a fresh 256-bit random management identifier is generated;
- only its SHA-256 hash is stored for later verification;
- an AES-256-GCM encrypted envelope is stored only to support exact idempotent response replay;
- plaintext management credentials are not stored;
- providers do not receive the management credential.

The envelope uses the dedicated server secret `TALKPOINT_HANDOFF_CREDENTIAL_SECRET`, not the Payload authentication secret. Secret rotation requires an explicit migration/rotation plan because previous retry envelopes cannot be decrypted under a new key.

## Required deployment configuration

Production assisted handoff additionally requires:

- an approved/current PROD-12 privacy/legal configuration;
- `TALKPOINT_PRODUCTION_PRIVACY_ENABLED=true`;
- `TALKPOINT_PRODUCTION_CONSENT_VERSION` matching the approved privacy package;
- `TALKPOINT_HANDOFF_CREDENTIAL_SECRET` of at least 32 characters;
- verified real provider/service records;
- explicit per-service `productionHandoffEnabled=true`.

The Sharing Preview also returns the approved privacy-notice version and exact EN/EL assisted-contact consent statements from the server-side privacy package. The repository does not provide real providers, legal approval or enable the gates automatically.

## Privacy boundary

The production request does not persist or join:

- anonymous session identifier/history;
- anonymous optional free text;
- candidate signals;
- safety-routing history;
- AI internals/reasoning;
- browsing history or other services viewed.

Optional handoff note is separate and requires explicit authorisation.

## PROD-5 dependency

Retention/deletion automation must preserve this boundary.

In particular:

- expired anonymous sessions may be purged independently;
- identifiable ContactRequests can be deleted according to configured policy;
- the frozen withdrawal contract requires minimal consent evidence to be retainable after request deletion;
- provider audit-event retention must be separately configurable;
- final retention durations must not be invented by engineering and remain subject to privacy/legal approval.
