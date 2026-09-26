# Production Authentication Operations

Status: **PROD-2 engineering hardening in progress**. This document does not claim that production identity infrastructure or MFA has been externally approved or deployed.

## Implemented authentication controls

The Payload `provider-users` collection is the authentication authority for the provider/admin control plane.

Implemented controls:

- revocable database-backed sessions are explicitly enabled;
- auth API responses do not return bearer tokens;
- production auth cookies are HTTPS-only and use `SameSite=Lax`;
- session/token lifetime is limited to eight hours;
- five failed login attempts trigger a 15-minute account lock;
- password input has a minimum length of 12 characters;
- password reset tokens expire after 30 minutes;
- repeat reset requests for the same user are throttled to at least one minute;
- API-key authentication is disabled;
- administrator-created accounts default to inactive;
- the guarded first-user bootstrap creates an active `super_admin`;
- inactive users cannot log in and are denied by the platform-admin RBAC boundary;
- changing role, organisation or active state clears existing sessions so stale claims cannot retain old authority;
- the final active `super_admin` cannot be demoted, deactivated or deleted;
- only a `super_admin` can create/update/delete provider-user records or unlock locked users;
- platform roles remain unscoped to provider organisations;
- provider roles continue to require organisation scope.

Payload's session model also ends other sessions after a password change and supports explicit all-session logout. These behaviours are regression-tested through the mounted Payload runtime where practical.

## Password recovery boundary

Payload exposes secure forgot-password/reset-password token mechanics, and TalkPoint configures token lifetime and per-account request spacing.

**Production email delivery is not configured in source control.** Payload requires an email adapter for real reset-email delivery. No SMTP/API provider, sender identity or credentials are invented by this repository.

Before production authentication can be considered operational, deployment owners must provide and validate:

- an approved email delivery adapter/provider;
- production sender identity/from address;
- server-side credentials in the deployment secret manager;
- successful end-to-end reset-email delivery testing;
- abuse monitoring/rate-limit policy appropriate to the deployed endpoint.

Until then, password recovery is **code-ready but externally blocked for real delivery**.

## Account activation and provisioning

Provider/admin accounts are provisioned, not publicly self-registered.

1. The first guarded bootstrap account may only be a `super_admin`.
2. A `super_admin` creates subsequent accounts.
3. New accounts default to inactive unless the `super_admin` explicitly activates them.
4. Provider roles require an organisation relationship; platform roles must have none.
5. Deactivation invalidates existing sessions and prevents new login.
6. Role or organisation changes also invalidate existing sessions.

PROD-3 may add a provider-facing workspace, but it must consume this server-authoritative identity and must not trust a client-supplied organisation.

## MFA readiness

No second factor is currently claimed.

Payload supports custom authentication strategies, so the current revocable-session architecture leaves a clean integration point for an approved MFA or external identity strategy. Selecting and operating the real second factor requires a deployment identity decision, enrolment/recovery design and, if external, provider credentials.

Before a real production release, the deployment owner must decide and document either:

- an approved MFA mechanism for privileged/provider accounts; or
- an approved external identity provider/SSO strategy that enforces MFA.

Do not mark MFA as enabled from a database flag alone. A second factor must actually be challenged and validated in the authentication path.

## Operational checks before release

- verify HTTPS and secure-cookie behaviour on the real production hostname;
- verify login, lockout, unlock and all-session logout;
- verify deactivation immediately invalidates active sessions;
- verify role/organisation changes cannot preserve stale privilege;
- verify reset emails are delivered only through the approved adapter;
- verify reset tokens expire as configured and cannot be reused;
- verify production logs/monitoring do not capture passwords, reset tokens or session tokens;
- execute the later PROD-6 abuse-hardening checks for auth endpoints.

## External blockers added by PROD-2

- approved production auth-email delivery adapter/provider and credentials;
- approved MFA / external identity strategy and any required credentials;
- production hostname/TLS environment for final secure-cookie verification.

These blockers do not justify weakening the implemented session, RBAC or account-lifecycle controls.
