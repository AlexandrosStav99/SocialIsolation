# Phase 5 Review - AI Conversation Layer

## Goal
AI may improve interpretation of optional free text, but the core journey must remain deterministic and fully usable when AI fails.

## Implemented
- Server-side provider abstraction.
- OpenAI Responses API adapter with a configurable model and frozen MVP default of GPT-5.4 mini.
- Strict JSON-schema output request plus application-side validation.
- Allowed-topic filtering after validation.
- Context minimisation and basic email/phone redaction before provider calls.
- No preferred name, email, phone or contact-request identifier in the AI input contract.
- Five-second timeout.
- Deterministic empty fallback on timeout, network error, invalid JSON or invalid output.
- Provider storage disabled in the request.
- No raw prompt/response logging.
- AI layer has no dependency on service discovery or Safety Routing.

## Important model note
The frozen MVP specifies GPT-5.4 mini. Model availability can change. The provider therefore supports OPENAI_CONVERSATION_MODEL configuration without changing the safety/privacy contract. Changing the model is an operational decision, not permission to expand AI authority.

## Boundary
AI suggestions are assistance only. They cannot make safety decisions, provider-routing decisions, eligibility decisions, clinical assessments or contact-handoff decisions.

## Exit assessment
Phase 5 is complete when cumulative CI passes and AI failure demonstrably falls back to the deterministic journey.
