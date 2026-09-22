# Phase 10 - Limitations and Production Requirements

This document records limitations that still apply **after** the completed UX-0 through UX-5 implementation and current green CI. It must not preserve stale limitations that have already been resolved.

- University MVP / controlled demonstration, not a production social, healthcare or emergency system.
- Safety trigger matrix, wording and real immediate-support resources still require qualified domain-expert validation.
- Target-user usability validation with adults aged 18–30 remains external human research.
- WCAG 2.2 AA is a target; no compliance certification is claimed.
- Real deployment requires Cyprus/EU legal and privacy review, operational retention decisions and provider agreements.
- **Payload/PostgreSQL runtime integration is implemented and CI-verified**, including committed migration application to clean PostgreSQL and a live round-trip check. What remains open is real environment provisioning, operational deployment and any production DB-backed provider-contact workflow required by a future pilot.
- The university demo handoff deliberately remains controlled/synthetic and does not send a real provider request; technical integration evidence must not be described as a live-provider pilot.
- Production authentication/IdP, MFA, organisation onboarding, infrastructure hardening, monitoring, incident response and environment-specific security assessment remain outside the controlled university deployment evidence.
- Complete real Cyprus directory data, provider participation and a repeatable service-information recheck process remain validation/operational work.
- Final legal/privacy wording, lawful-basis assessment, controller/processor responsibilities and exact production retention duration remain open pending authorised review.
- Manual accessibility evidence, including screen-reader, zoom/reflow and physical-device checks, remains incomplete until the protocol is actually executed.
- AI remains assistive and must never become the routing, safety, eligibility or handoff decision-maker.

Green CI is evidence of the tested controlled implementation. It is not evidence that the unresolved human, legal, provider, safety or production-operational gates have passed.
