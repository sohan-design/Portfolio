import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { MaestroLogo } from '@/components/brand/MaestroLogo'
import { UvMapBackground } from '@/components/brand/UvMapBackground'
import { Button } from '@/components/ui/Button'
import { Stepper } from '@/components/onboarding/Stepper'

interface OnboardingShellProps {
  activeStep: number
  children: ReactNode
  onBack?: () => void
}

export function OnboardingShell({
  activeStep,
  children,
  onBack,
}: OnboardingShellProps) {
  const navigate = useNavigate()

  return (
    <div className="onboarding-shell">
      <aside className="onboarding-sidebar">
        <UvMapBackground variant="sidebar" overlay />
        <div className="relative z-[1] anim-fade-up">
          <MaestroLogo tone="dark" />
        </div>
        <div className="relative z-[1] flex flex-1 flex-col">
          <Stepper activeIndex={activeStep} />
        </div>
        <div className="relative z-[1] flex w-full items-center justify-between anim-fade-up anim-delay-5">
          <Button
            maestroVariant="outline-light"
            onClick={() => (onBack ? onBack() : navigate(-1))}
          >
            Go Back
          </Button>
          <Button maestroVariant="outline" onClick={() => undefined}>
            Need help?
          </Button>
        </div>
      </aside>
      <main className="onboarding-main">{children}</main>
    </div>
  )
}
