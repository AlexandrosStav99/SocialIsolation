# Phase 8 Review - Privacy-safe Analytics

## Implemented
- Analytics remain based exclusively on AnonymousAnalyticsEvent.
- No session ID, request ID, user ID, contact details or free text in the analytics domain.
- Operational aggregates: interactions, services shown, self-service selections, assisted-contact selections and no-match count.
- Support-topic aggregate counts.
- Service-area heatmap cells from aggregate data only.
- Minimum sample suppression threshold of 5 for topic, outcome and service-area presentation.
- Suppressed heatmap cells expose zero rather than the underlying small count.
- Synthetic university analytics require the explicit label “Demonstration Data”.
- Dashboard output carries its data label.

## Boundary
Analytics are deliberately structurally unlinkable from ContactRequest. No exact coordinates, GPS, postcode or user-level heatmap points exist.

## Interpretation
Minimum-sample suppression reduces disclosure risk but is not a complete statistical disclosure-control programme. Production analytics would require a privacy review covering dataset size, repeated-query attacks, exports and administrator access.

## Exit assessment
Phase 8 is complete when cumulative CI passes and dashboard analytics remain useful without exposing identifiable request details or presenting synthetic data as real.
