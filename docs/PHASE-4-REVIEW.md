# Phase 4 Review - Service Discovery & Safety Routing

## Goal
Implement deterministic service discovery and the structural Safety Routing framework without allowing AI to decide provider routing or user safety.

## Service discovery
Hard filters use selected topic, service-area availability and optional language/delivery constraints. Primary-topic services are presented before secondary-topic services; stable directory order breaks ties. There is no opaque score. At most three results are returned with factual reasons based on explicit selections. No-match is a real state and offers change-area, change-preferences or browse-directory recovery.

This is relevance filtering, not a claim that a service is the best provider or clinically appropriate.

## Safety Routing
“I need help now” is a permanent bilingual action contract. Safety state uses explicit structured signals only. Free text and AI are not used for safety classification. There is no risk score and no automatic third-party notification. Immediate-support state is separate from normal discovery.

## Expert-validation gate
The exact safety trigger matrix, domain wording and real immediate-support resources are intentionally not declared validated. The validation status remains requires_domain_expert_validation. Structural signals demonstrate deterministic architecture only and are not a clinical instrument.

## Exit assessment
Phase 4 software implementation is complete when deterministic discovery/safety and cumulative CI checks pass. Domain-expert validation remains an explicit final academic-MVP validation gate and blocks any production or clinical safety claim.
