# TalkPoint Production API Hardening Operations

Status: **application boundary implemented; deployment ingress/WAF policy is not selected in-repo**.

This document records the operational contract added in PROD-6. It does not claim that a production reverse proxy, CDN, WAF, monitoring platform or hosting environment has been provisioned.

## Required production configuration

Production runtime now requires:

- `TALKPOINT_PUBLIC_APP_ORIGIN` — the canonical HTTPS application origin used for browser-origin checks.
- `TALKPOINT_TRUSTED_CLIENT_IP_HEADER` — the HTTP header that the selected trusted ingress will set or overwrite with the validated client IP.
- `TALKPOINT_RATE_LIMIT_HASH_SECRET` — a dedicated server-side secret, at least 32 characters, used only to HMAC rate-limit subjects.

The application does **not** silently trust `x-forwarded-for` in production.

The selected production ingress must strip or overwrite the configured client-IP header so that an internet client cannot choose its own rate-limit identity. That infrastructure contract remains a deployment responsibility.

## Shared rate limiting

Production/live DB-backed API limits use PostgreSQL fixed-window counters. They are shared between application instances and therefore do not rely on process-local memory.

Current application limits:

| Boundary | Limit |
| --- | ---: |
| Production directory read | 240 / minute / client |
| Production Sharing Preview | 30 / minute / client |
| Production handoff submission | 12 / minute / client |
| Production request withdrawal | 12 / minute / client |
| Provider workspace reads | 240 / minute / authenticated provider user |
| Provider workspace mutations | 120 / minute / authenticated provider user |

The rate-limit table stores an HMAC bucket key, scope, count and window timestamps. It does not store the raw client IP. Expired buckets are opportunistically removed during new-window activity.

If the shared rate-limit store is unavailable, protected production routes fail closed rather than silently disabling rate limiting.

These application limits are abuse controls, not a substitute for deployment-level volumetric protection or a WAF.

## Request/body boundaries

Custom JSON mutation routes reject unsupported media types and read request bodies through a byte-bounded streaming parser.

Current maximum JSON sizes:

- production Sharing Preview: 16 KiB;
- production handoff submission: 16 KiB;
- production request withdrawal: 4 KiB;
- provider workspace mutation: 4 KiB;
- controlled synthetic demo handoff: 4 KiB.

Both declared `Content-Length` and actual streamed bytes are enforced. Invalid UTF-8 or invalid JSON is rejected.

The controlled demo handoff intentionally does not use the shared production limiter or production browser-origin gate. It remains synthetic, sends no real provider request and preserves the frozen database-independent demonstration fallback.

## Browser-origin / CSRF boundary

For production handoff endpoints, a supplied browser `Origin` must equal `TALKPOINT_PUBLIC_APP_ORIGIN`.

For provider workspace mutations, cookie-authenticated browser requests require a valid same-origin `Origin`. A cookie-authenticated mutation with no Origin fails closed.

This protects browser ambient-authority paths without blocking legitimate non-browser requests that do not rely on ambient cookies.

## Response security headers

The Next.js application applies the current baseline headers globally:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `X-Frame-Options: DENY`;
- `X-Permitted-Cross-Domain-Policies: none`;
- a restrictive `Permissions-Policy` for unused powerful features;
- a baseline CSP covering `base-uri`, `frame-ancestors`, `object-src` and `form-action`.

HSTS is intentionally not asserted in repository configuration yet because the final TLS termination, canonical host and subdomain policy belong to deployment readiness. PROD-8 must decide that against the real production environment.

## Framework-managed authentication routes

Provider authentication remains Payload-managed and already has the PROD-2 account lockout/password/session controls.

Application rate limiting does not claim to replace ingress-level protection for framework-managed authentication endpoints or distributed volumetric attacks. The selected deployment should apply appropriate edge controls once the real ingress is known.

## Dependency security

PROD-6 upgrades Next.js and `eslint-config-next` from 16.3.5 to the 16.3.6 security patch. Dependency audit/gate, clean install, production build and Playwright regressions remain mandatory CI steps.

## Verification

CI now covers:

- static API-hardening invariants;
- production configuration fail-closed checks;
- direct runtime browser-origin/cookie mutation guards;
- clean PostgreSQL migration;
- live PostgreSQL shared rate-limit counters, 429 enforcement and new-window recovery;
- confirmation that raw client network identity is not stored in the rate-limit table;
- security-header browser regression;
- unsupported-media-type and oversized-body regression;
- all earlier provider, handoff, retention and privacy regressions.

Green CI is engineering evidence only. It is not proof that the final ingress, WAF, TLS, monitoring or security operations configuration has been approved.
