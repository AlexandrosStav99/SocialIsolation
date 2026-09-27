import type { SafetySignal } from "./types";
/** Structural placeholder only. Not a clinically validated risk instrument. Exact production triggers, wording and resources require domain-expert validation. */
export const structuralSafetyTriggers: readonly SafetySignal[]=["user_requests_help_now","immediate_danger_selected","recent_violence_selected"];
export type SafetyMatrixValidationStatus = "requires_domain_expert_validation" | "approved";
export const SAFETY_MATRIX_VALIDATION_STATUS: SafetyMatrixValidationStatus = "requires_domain_expert_validation";
