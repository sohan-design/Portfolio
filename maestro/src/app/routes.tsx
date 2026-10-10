import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/app/RequireAuth'
import Login from '@/pages/Login/Login.tsx'
import OnboardingEvaluation from '@/pages/OnboardingEvaluation/OnboardingEvaluation.tsx'
import OnboardingMcq from '@/pages/OnboardingMcq/OnboardingMcq.tsx'
import OnboardingSubjective from '@/pages/OnboardingSubjective/OnboardingSubjective.tsx'
import Done from '@/pages/Done/Done.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route
          path="/onboarding"
          element={<Navigate to="/onboarding/evaluation" replace />}
        />
        <Route
          path="/onboarding/evaluation"
          element={<OnboardingEvaluation />}
        />
        <Route path="/onboarding/mcq" element={<OnboardingMcq />} />
        <Route
          path="/onboarding/subjective"
          element={<OnboardingSubjective />}
        />
        <Route path="/onboarding/done" element={<Done />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
