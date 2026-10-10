import { ModeToggle } from '@/components/onboarding/ModeToggle'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { Button } from '@/components/ui/Button'
import { DisplayTitle } from '@/components/ui/Typography'
import { SUBJECTIVE_OPTIONS } from '@/mocks/onboarding'
import { useOnboardingSubjective } from './OnboardingSubjective.ts'

const ICON_SRC = {
  languages: '/assets/icons/languages.svg',
  finger: '/assets/icons/finger.svg',
  at: '/assets/icons/at.svg',
} as const

export default function OnboardingSubjective() {
  const { values, functions } = useOnboardingSubjective()

  return (
    <OnboardingShell activeStep={1} onBack={functions.goBack}>
      <div className="flex w-full max-w-[828px] flex-col gap-16">
        <ModeToggle
          mode={values.inputMode}
          onChange={functions.setInputMode}
          voiceFirst
        />

        <div className="flex flex-col gap-10">
          <DisplayTitle className="!text-[32px] !leading-none anim-fade-up">
            How will you be using Maestro?
          </DisplayTitle>

          <div className="flex flex-col gap-3.5">
            {SUBJECTIVE_OPTIONS.map((option, index) => {
              const selected = values.selectedId === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`option-row anim-fade-up ${selected ? 'is-selected' : ''}`.trim()}
                  style={{ animationDelay: `${0.1 + index * 0.07}s` }}
                  onClick={() => functions.selectOption(option.id)}
                  aria-pressed={selected}
                >
                  <span
                    className={`option-check ${selected ? 'is-checked' : ''}`.trim()}
                    aria-hidden
                  />
                  <span className="flex items-center gap-3">
                    <img
                      src={ICON_SRC[option.icon]}
                      alt=""
                      width={18}
                      height={18}
                    />
                    <span className="font-[family-name:var(--font-ui)] text-base tracking-[-0.32px] text-[var(--maestro-ink)]">
                      {option.label}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="anim-fade-up anim-delay-4">
            <Button
              maestroVariant="primary"
              disabled={!values.canContinue}
              onClick={functions.continue}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </OnboardingShell>
  )
}
