export interface OnboardingEvaluationValues {
  userName: string
}

export interface OnboardingEvaluationFunctions {
  continue: () => void
  skip: () => void
  goBack: () => void
}

export interface OnboardingEvaluationHookResult {
  values: OnboardingEvaluationValues
  functions: OnboardingEvaluationFunctions
}
