import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/context/SessionContext'
import type { LoginHookResult } from './types/Login'

export function useLogin(): LoginHookResult {
  const navigate = useNavigate()
  const { functions } = useSession()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const completeMockLogin = () => {
    setIsAuthenticating(true)
    window.setTimeout(() => {
      functions.login()
      functions.resetOnboarding()
      setIsAuthenticating(false)
      navigate('/onboarding/evaluation')
    }, 420)
  }

  return {
    values: { isAuthenticating },
    functions: {
      continueWithGoogle: completeMockLogin,
      continueWithSso: completeMockLogin,
    },
  }
}
