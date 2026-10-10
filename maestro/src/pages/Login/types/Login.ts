export interface LoginValues {
  isAuthenticating: boolean
}

export interface LoginFunctions {
  continueWithGoogle: () => void
  continueWithSso: () => void
}

export interface LoginHookResult {
  values: LoginValues
  functions: LoginFunctions
}
