import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { Button } from '@/components/ui/Button'
import { DisplayTitle, SerifText } from '@/components/ui/Typography'
import { useDone } from './Done.ts'

export default function Done() {
  const { values, functions } = useDone()

  return (
    <OnboardingShell activeStep={4} onBack={functions.reviewAnswers}>
      <div className="flex max-w-[640px] flex-col gap-8 anim-fade-up">
        <DisplayTitle className="!text-[40px] !leading-none">
          You&apos;re set, {values.userName}
        </DisplayTitle>
        <SerifText className="!text-base !tracking-[-0.16px]">
          Phase 1 onboarding is complete (frontend mock). Your choices are saved
          locally — no backend yet.
        </SerifText>
        <div className="flex flex-wrap gap-3">
          <Button maestroVariant="primary" onClick={functions.reviewAnswers}>
            Review answers
          </Button>
          <Button maestroVariant="secondary" onClick={functions.backToLogin}>
            Back to login
          </Button>
        </div>
      </div>
    </OnboardingShell>
  )
}
