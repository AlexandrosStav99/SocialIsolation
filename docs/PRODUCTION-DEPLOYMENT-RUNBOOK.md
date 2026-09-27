# TalkPoint Production Deployment Runbook

Status: **deployment contract implemented; no real production deployment, hosting platform, DNS, TLS, secrets or restore evidence is claimed**.

This runbook defines the repository-side PROD-8 deployment contract. It is intentionally hosting-vendor neutral.

## Environment separation

Development, controlled demo and production must be operated as separate trust environments.

Production must use:

- `TALKPOINT_RUNTIME_MODE=production`;
- its own PostgreSQL database and credentials;
- its own Payload secret;
- its own handoff credential secret and rate-limit HMAC secret if those production features are configured;
- its canonical HTTPS public origin;
- a client-IP header supplied/overwritten only by the trusted ingress;
- synthetic directory fallback explicitly disabled;
- the demo dashboard disabled.

Do not copy production ContactRequest, ConsentRecord, provider-user session or other identifiable operational data into development or demo environments.

Development/demo credentials and databases must not be reused for production.

The repository does not name a hosting vendor, CDN, DNS provider, certificate provider or secret manager because none has been selected as repository evidence.

## Production configuration inventory

The committed `.env.example` is the configuration-name inventory, not a production secret file.

Production/deployment operators must source real values from the selected secret/configuration mechanism rather than committing them.

Application/startup production controls include:

- `DATABASE_URL`;
- `PAYLOAD_SECRET`;
- `TALKPOINT_RUNTIME_MODE`;
- `TALKPOINT_ALLOW_SYNTHETIC_DIRECTORY_FALLBACK`;
- `TALKPOINT_ENABLE_DEMO_DASHBOARD`;
- `TALKPOINT_PUBLIC_APP_ORIGIN`;
- `TALKPOINT_TRUSTED_CLIENT_IP_HEADER`;
- `TALKPOINT_RATE_LIMIT_HASH_SECRET`.

Production assisted-contact configuration, when approved for use, additionally includes:

- `TALKPOINT_PRODUCTION_CONSENT_VERSION`;
- `TALKPOINT_HANDOFF_CREDENTIAL_SECRET`.

Retention automation uses its separately approved retention values and enable flag. Their presence in the inventory does not approve any legal duration.

## Release source

Deploy only an immutable revision that has passed the repository CI gates.

The release record should retain at least:

- Git commit SHA;
- CI run identity/result;
- migration set included in that revision;
- deployment environment;
- operator/change reference used by the real organisation.

Do not mark a revision deployed merely because its CI is green.

## Migration-before-start

Production-like schema changes use committed Payload migrations as defined in `docs/DATABASE-MIGRATION-OWNERSHIP.md`.

Deployment order:

1. confirm the intended release commit and green CI;
2. confirm the deployment target and production configuration are the intended environment;
3. confirm the real backup/restore prerequisite required by the deployment owner has been satisfied;
4. run the committed database migrations **once** against the target production database before starting the new application revision;
5. run `npm run deploy:preflight` in the target environment;
6. start/roll out the application revision only after preflight succeeds;
7. run post-deploy verification against the canonical public HTTPS origin;
8. observe readiness/operational signals before considering the technical rollout complete.

The exact mechanism for a single migration job/lock belongs to the selected deployment platform. Do not let every horizontally scaled application instance race to run schema migrations at startup.

## Target-side preflight

Run:

```sh
npm run deploy:preflight
```

The preflight requires production runtime mode, executes the existing fail-closed production configuration validation and verifies application readiness against the target PostgreSQL schema.

It emits only constrained operational success/failure events. It does not print production connection strings or raw exception messages.

## Post-deploy verification

After the application is reachable on its canonical HTTPS origin, run:

```sh
npm run deploy:verify -- https://talkpoint.example
```

Replace the example origin with the real approved origin.

The verifier:

- requires a clean HTTPS origin;
- follows no redirects;
- sends no cookies or authorization credentials;
- checks `/api/health/live`;
- checks `/api/health/ready`;
- requires non-cacheable health responses;
- verifies the baseline `nosniff` response header.

This is technical reachability/readiness evidence only. It does not validate real providers, safety content, legal approval or user usability.

## Rollback

Application rollback and database rollback are separate decisions.

### Application revision rollback

A previous application artifact may be redeployed only when it is known to be **backward-compatible with the schema already migrated in production**.

Before rolling application code back:

1. identify the currently applied schema/migrations;
2. confirm the previous revision can safely operate on that schema;
3. stop/disable any incompatible new scheduled jobs;
4. deploy the previous compatible artifact;
5. rerun liveness/readiness verification;
6. record the rollback reason and evidence.

### Database/schema rollback

**Do not automatically run down migrations as part of application rollback.**

Down migrations can be destructive and older application revisions may not understand partially reverted data.

If a schema rollback is genuinely required, the operating organisation must use an approved recovery/change procedure. Depending on the real incident and migration, the safe option may be a forward fix or restore from a verified backup into a controlled target.

The repository does not claim a production restore has been tested. Restore evidence remains an external deployment/operations gate.

## Secrets and credential rotation

Production secrets must live in the selected secret-management system, not in Git.

If a deployment exposes or invalidates a secret:

- stop using the affected credential;
- rotate it through the real secret-management process;
- assess dependent encrypted/token material before rotation where key continuity matters;
- redeploy/restart components that require the new value;
- verify readiness after the change.

The handoff credential secret protects management-credential replay envelopes. Rotating it without a controlled migration/continuity plan can make existing encrypted replay envelopes unrecoverable.

## TLS and HSTS

The application requires a canonical HTTPS origin for production browser-origin controls.

HSTS remains a deployment decision until the real TLS termination, canonical hostname and subdomain policy are known. Do not enable `includeSubDomains` or preload semantics without confirming that every affected hostname is permanently HTTPS-capable.

PROD-8 therefore documents the HSTS decision gate rather than inventing a domain/TLS topology.

## Production handoff activation

A successful technical deployment does not activate live assisted handoff by itself.

The service-level `productionHandoffEnabled` control remains fail-closed and should only be enabled for a validated real service after the required provider, directory, safeguarding and privacy/legal evidence exists.

## Evidence boundary

PROD-8 can prove that the repository has a reproducible deployment/preflight/verification/rollback contract.

It cannot prove that:

- production deployment has succeeded;
- a production database or backup exists;
- DNS/TLS is configured;
- a real ingress is overwriting the trusted client-IP header;
- monitoring or alert delivery is connected;
- a restore drill has succeeded;
- production secrets have been provisioned;
- external provider/safety/privacy/accessibility gates are approved.

Record those claims only from real deployment evidence.
