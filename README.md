# TalkPoint

University prototype for support navigation for adults aged 18–30. Product scope is frozen in [the MVP specification](docs/TALKPOINT-MVP-SPEC.md); phased delivery is defined in [the implementation plan](docs/IMPLEMENTATION-PLAN.md).

Phase 0 hardens the existing visual prototype. It is not an operational support service, emergency service, AI counsellor, checked directory or provider workspace. Use fictional input only.

## Local setup

Use Node 24 (`nvm use`), then:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

No secrets are needed for the default prototype. `/dashboard` returns 404 by default. To preview synthetic dashboard visuals in a controlled environment, set the **server-only** `TALKPOINT_ENABLE_DEMO_DASHBOARD=true` and restart. This flag is not authentication: never enable it with real provider/request data. Actual authentication and organisation isolation belong to Phase 7.

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

Tests launch two production servers: the default deployment on 3100 and the explicitly enabled synthetic dashboard on 3101. Leave `NEXT_PUBLIC_MAPBOX_TOKEN` blank during build/tests. These tests do not contact real support providers.

CI runs all commands above with failure propagation, a zero-warning lint gate, strict TypeScript, and an all-severity dependency audit. Update packages through npm and commit the regenerated lockfile together with package.json. Do not hand-edit the lockfile, suppress advisories or bypass checks.

See [Phase 0 review](docs/PHASE-0-REVIEW.md) for security findings, verification and the intentionally deferred work.
