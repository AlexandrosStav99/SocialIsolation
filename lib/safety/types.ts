export type SafetySignal = "user_requests_help_now" | "immediate_danger_selected" | "recent_violence_selected";
export type SafetyRoutingState = "standard" | "immediate_support";
export type SafetyRoutingInput = { explicitSignals: SafetySignal[] };
export type SafetyRoutingResult = { state: SafetyRoutingState; trigger?: SafetySignal; showImmediateSupportAction: true; automaticThirdPartyNotification: false; };
