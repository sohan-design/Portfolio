import { ModeToggle } from '@/components/onboarding/ModeToggle'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { UvMapBackground } from '@/components/brand/UvMapBackground'
import { Button } from '@/components/ui/Button'
import { DisplayTitle, SerifText } from '@/components/ui/Typography'
import { MCQ_OPTIONS } from '@/mocks/onboarding'
import { useOnboardingMcq } from './OnboardingMcq.ts'

export default function OnboardingMcq() {
  const { values, functions } = useOnboardingMcq()

  return (
    <OnboardingShell activeStep={1} onBack={functions.goBack}>
      <div className="flex w-full max-w-[828px] flex-col gap-16">
        <ModeToggle mode={values.inputMode} onChange={functions.setInputMode} />

        <div className="flex flex-col gap-10">
          <DisplayTitle className="!text-[32px] !leading-none anim-fade-up">
            How will you be using Maestro?
          </DisplayTitle>

          <div className="flex flex-wrap gap-6">
            {MCQ_OPTIONS.map((option, index) => {
              const selected = values.selectedId === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`mcq-card anim-fade-up ${selected ? 'is-selected' : ''}`.trim()}
                  style={{ animationDelay: `${0.12 + index * 0.08}s` }}
                  onClick={() => functions.selectOption(option.id)}
                  aria-pressed={selected}
                >
                  {selected ? <UvMapBackground variant="card" /> : null}
                  <img
                    src="/assets/icons/internet.svg"
                    alt=""
                    className="mcq-card__icon"
                    width={18}
                    height={18}
                  />
                  <p className="mcq-card__label">{option.label}</p>
                </button>
              )
            })}
          </div>

          <SerifText className="!max-w-[389px] !text-base !tracking-[-0.16px] anim-fade-up anim-delay-4">
            By clicking continue, you agree to the terms and conditions and the
            privacy policy.
          </SerifText>
        </div>

        <div className="anim-fade-up anim-delay-5">
          <Button
            maestroVariant="primary"
            disabled={!values.canProceed}
            onClick={functions.proceed}
          >
            Proceed
          </Button>
        </div>
      </div>
    </OnboardingShell>
  )
}
