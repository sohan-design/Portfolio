export interface OnboardingMcqValues {
  selectedId: string | null
  inputMode: 'text' | 'voice'
  canProceed: boolean
}

export interface OnboardingMcqFunctions {
  selectOption: (id: string) => void
  setInputMode: (mode: 'text' | 'voice') => void
  proceed: () => void
  goBack: () => void
}

export interface OnboardingMcqHookResult {
  values: OnboardingMcqValues
  functions: OnboardingMcqFunctions
}
