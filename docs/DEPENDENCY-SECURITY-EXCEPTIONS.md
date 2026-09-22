# Dependency security exceptions

Reviewed: 2026-09-20

This file documents temporary upstream dependency findings introduced by Payload CMS 3.90.1. CI still runs the full npm audit and fails on any advisory not explicitly allow-listed by `scripts/check-dependency-security.mjs`.

## Monaco / DOMPurify

Payload's admin UI dependency chain currently resolves `monaco-editor@0.56.0`, which pins `dompurify@3.4.8`. The following advisories are temporarily accepted pending an upstream Monaco release that updates its bundled DOMPurify:

- GHSA-c2j3-45gr-mqc4
- GHSA-cmwh-pvxp-8882
- GHSA-vxr8-fq34-vvx9
- GHSA-55q2-fjhq-7xh7

A package-manager override is deliberately not used: Monaco ships DOMPurify in its built editor artifacts, so changing only the lockfile resolution would not reliably remediate the shipped bundle.

## Drizzle tooling / esbuild

`@payloadcms/db-postgres@3.90.1` depends on `drizzle-kit@0.31.7`, which brings the deprecated `@esbuild-kit/esm-loader` chain and an old nested esbuild affected by:

- GHSA-67mh-4wv8-2f99

npm reports no fix through the current Payload dependency chain. The advisory concerns esbuild development-server exposure. TalkPoint must not expose development servers in deployment.

## Policy

These are not treated as resolved. They are reviewed temporary exceptions. Any new npm advisory fails CI automatically. Re-check these exceptions whenever Payload/Monaco/Drizzle dependencies are upgraded, and remove each exception as soon as upstream remediation is available.
