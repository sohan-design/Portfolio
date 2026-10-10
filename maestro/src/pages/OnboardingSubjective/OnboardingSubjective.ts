import { useNavigate } from 'react-router-dom'
import { useSession } from '@/context/SessionContext'
import type { OnboardingSubjectiveHookResult } from './types/OnboardingSubjective'

export function useOnboardingSubjective(): OnboardingSubjectiveHookResult {
  const navigate = useNavigate()
  const { values, functions } = useSession()

  return {
    values: {
      selectedId: values.subjectiveChoice,
      inputMode: values.inputMode,
      canContinue: Boolean(values.subjectiveChoice),
    },
    functions: {
      selectOption: functions.setSubjectiveChoice,
      setInputMode: functions.setInputMode,
      continue: () => {
        if (!values.subjectiveChoice) return
        navigate('/onboarding/done')
      },
      goBack: () => navigate('/onboarding/mcq'),
    },
  }
}
