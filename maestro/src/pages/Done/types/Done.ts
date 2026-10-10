export interface DoneValues {
  userName: string
  mcqChoice: string | null
  subjectiveChoice: string | null
}

export interface DoneFunctions {
  backToLogin: () => void
  reviewAnswers: () => void
}

export interface DoneHookResult {
  values: DoneValues
  functions: DoneFunctions
}
