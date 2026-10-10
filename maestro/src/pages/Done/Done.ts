import { useNavigate } from 'react-router-dom'
import { useSession } from '@/context/SessionContext'
import type { DoneHookResult } from './types/Done'

export function useDone(): DoneHookResult {
  const navigate = useNavigate()
  const { values, functions } = useSession()

  return {
    values: {
      userName: values.userName,
      mcqChoice: values.mcqChoice,
      subjectiveChoice: values.subjectiveChoice,
    },
    functions: {
      backToLogin: () => {
        functions.logout()
        navigate('/login')
      },
      reviewAnswers: () => navigate('/onboarding/evaluation'),
    },
  }
}
