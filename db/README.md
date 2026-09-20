# Phase 1 database boundary

The SQL migration establishes the storage boundary before sensitive workflows are implemented.

Rules:

1. `ephemeral_sessions` may temporarily hold bounded user text and must be purged on completion/expiry.
2. `anonymous_analytics_events` has no relationship to session, user or contact-request identifiers.
3. `contact_requests` exists only for the later explicit assisted-contact flow.
4. `consent_records` is separate evidence of what was authorised, for which recipient and when.
5. Directory/identity data is separate from user-entered support data.
6. Super/platform administrators are platform-scoped identities; provider roles require an organisation.
7. Application/API authorisation remains mandatory. Database shape alone is not access control.

Exact production retention remains intentionally unresolved by the frozen specification.
