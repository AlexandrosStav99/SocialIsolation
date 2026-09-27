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


## Production migration-before-start contract

Production deployments must apply committed Payload migrations as a distinct migration step before the new application revision is started or rolled out.

Do not rely on every horizontally scaled application instance to race migration execution during startup.

Application rollback is allowed only when the previous application revision is backward-compatible with the schema already applied in the target database.

Do not automatically run down migrations as part of an application rollback. A schema rollback may be destructive and requires an approved recovery/change decision using real backup/restore evidence where necessary. Prefer a forward fix when that is the safer data-preserving path.
