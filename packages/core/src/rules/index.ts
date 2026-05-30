import type { Rule } from "../types";
import { loadingStateRule } from "./loading-state";
import { emptyStateRule } from "./empty-state";
import { errorStateRule } from "./error-state";
import { formValidationRule } from "./form-validation";
import { disabledSubmitRule } from "./disabled-submit";
import { successFeedbackRule } from "./success-feedback";

export const ALL_RULES: Rule[] = [
  loadingStateRule,
  emptyStateRule,
  errorStateRule,
  formValidationRule,
  disabledSubmitRule,
  successFeedbackRule,
];

/**
 * Map of config-key -> rule id. The config uses camelCase keys
 * (loadingState) while rule ids are snake_case (missing_loading_state).
 */
export const CONFIG_KEY_TO_RULE_ID: Record<string, string> = {
  loadingState: "missing_loading_state",
  emptyState: "missing_empty_state",
  errorState: "missing_error_state",
  formValidation: "missing_form_validation",
  disabledSubmit: "missing_disabled_submit",
  successFeedback: "missing_success_feedback",
};
