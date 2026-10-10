import { useNavigate } from 'react-router-dom'
import { useSession } from '@/context/SessionContext'
import type { OnboardingMcqHookResult } from './types/OnboardingMcq'

export function useOnboardingMcq(): OnboardingMcqHookResult {
  const navigate = useNavigate()
  const { values, functions } = useSession()

  return {
    values: {
      selectedId: values.mcqChoice,
      inputMode: values.inputMode,
      canProceed: Boolean(values.mcqChoice),
    },
    functions: {
      selectOption: functions.setMcqChoice,
      setInputMode: functions.setInputMode,
      proceed: () => {
        if (!values.mcqChoice) return
        navigate('/onboarding/subjective')
      },
      goBack: () => navigate('/onboarding/evaluation'),
    },
  }
}
