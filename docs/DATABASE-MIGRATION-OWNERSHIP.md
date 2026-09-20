# Database migration ownership

TalkPoint uses one PostgreSQL database, but schema ownership is explicit.

## Payload-owned runtime schema

Payload migrations are the sole migration authority for every collection registered in `payload.config.ts`, including directory, provider identity, ephemeral session, anonymous analytics, contact request, consent and provider audit collections.

Production-like environments must run committed Payload migrations before application startup/build. Payload development push mode is a local sandbox convenience only and must not be mixed with the legacy SQL baseline.

## Legacy Phase 1 SQL

`db/migrations/0001_phase1_boundaries.sql` is retained as an architectural/privacy baseline from Phase 1. It MUST NOT be executed against a database managed by the current Payload configuration because it defines overlapping table names with a different physical schema.

Any future non-Payload table must use a distinct table name and an explicitly documented migration owner.

## CI rule

CI provisions a real PostgreSQL service. The database integration gate must initialize Payload against that service and exercise actual create/read/delete operations. Structural source checks alone are not evidence of live persistence.
