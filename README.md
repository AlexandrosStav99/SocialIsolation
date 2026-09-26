# TalkPoint

University prototype for support navigation for adults aged 18–30. Product scope is frozen in [the MVP specification](docs/TALKPOINT-MVP-SPEC.md); phased delivery is defined in [the implementation plan](docs/IMPLEMENTATION-PLAN.md).

The repository now contains the CI-verified controlled university MVP demonstration described in `docs/FINAL-MVP-READINESS.md`. It exercises the deterministic check-in, synthetic service discovery and a non-persistent fictional handoff into the provider workflow. It is not an operational support or emergency service and must use fictional input only.

## Local setup

Use Node 24 (`nvm use`), then:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The local `.env.example` uses development-only placeholders and `TALKPOINT_RUNTIME_MODE=development`. Production mode is deliberately stricter and refuses placeholder secrets, local/test database settings, demo-dashboard enablement, or synthetic-directory fallback. `/dashboard` returns 404 by default. To preview synthetic dashboard visuals in a controlled environment, set the **server-only** `TALKPOINT_ENABLE_DEMO_DASHBOARD=true` and restart. This flag is not authentication: never enable it with real provider/request data. Organisation isolation is enforced by the Phase 7 domain layer. Real deployment authentication/session infrastructure is an explicit deployment gate and is not simulated by this dashboard flag.

The optional `NEXT_PUBLIC_MAPBOX_TOKEN` is bundled into the browser at build time. Use only a restricted public Mapbox token with minimal read scopes and URL restrictions. A blank token shows a textual fallback and district totals without calling Mapbox. Enabling it contacts Mapbox for tiles/assets and is not a privacy guarantee. Never prefix API keys, database credentials or secret Mapbox tokens with `NEXT_PUBLIC_`. Keep local values in ignored `.env.local`; use your hosting secret manager for future server-only secrets. Commit only `.env.example` placeholders. Rotate any exposed credential before removing it from history.

## Verification

```sh
npm run audit
npm run lint
npm run typecheck
npm run build
npx playwright install --with-deps chromium
npm test
```

Tests launch two Next.js production servers in explicit `demo` runtime mode: the default deployment on 3100 and the explicitly enabled synthetic dashboard on 3101. Leave `NEXT_PUBLIC_MAPBOX_TOKEN` blank during build/tests. These tests do not contact real support providers.

CI runs all commands above with failure propagation, a zero-warning lint gate, strict TypeScript, and an all-severity dependency audit. Update packages through npm and commit the regenerated lockfile together with package.json. Do not hand-edit the lockfile, suppress advisories or bypass checks.

See [production readiness](docs/PRODUCTION-READINESS.md) for the production-hardening programme and blocker register, and [final MVP readiness](docs/FINAL-MVP-READINESS.md) for the controlled university implementation boundary.
