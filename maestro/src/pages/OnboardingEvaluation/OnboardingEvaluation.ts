import { useNavigate } from 'react-router-dom'
import { useSession } from '@/context/SessionContext'
import type { OnboardingEvaluationHookResult } from './types/OnboardingEvaluation'

export function useOnboardingEvaluation(): OnboardingEvaluationHookResult {
  const navigate = useNavigate()
  const { values } = useSession()

  return {
    values: { userName: values.userName },
    functions: {
      continue: () => navigate('/onboarding/mcq'),
      skip: () => navigate('/onboarding/mcq'),
      goBack: () => navigate('/login'),
    },
  }
}
