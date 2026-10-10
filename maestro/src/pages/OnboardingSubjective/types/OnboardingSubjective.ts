export interface OnboardingSubjectiveValues {
  selectedId: string | null
  inputMode: 'text' | 'voice'
  canContinue: boolean
}

export interface OnboardingSubjectiveFunctions {
  selectOption: (id: string) => void
  setInputMode: (mode: 'text' | 'voice') => void
  continue: () => void
  goBack: () => void
}

export interface OnboardingSubjectiveHookResult {
  values: OnboardingSubjectiveValues
  functions: OnboardingSubjectiveFunctions
}
