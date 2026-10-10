import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { Button } from '@/components/ui/Button'
import { DisplayTitle, SerifText } from '@/components/ui/Typography'
import { useOnboardingEvaluation } from './OnboardingEvaluation.ts'

const CHIPS = [
  '/assets/icons/ai-sheets.svg',
  '/assets/icons/atom.svg',
  '/assets/icons/phone.svg',
] as const

export default function OnboardingEvaluation() {
  const { values, functions } = useOnboardingEvaluation()

  return (
    <OnboardingShell activeStep={0} onBack={functions.goBack}>
      <div className="flex max-w-[828px] flex-col gap-12">
        <div className="anim-fade-up">
          <DisplayTitle className="!text-[32px] !leading-none">
            Welcome, {values.userName}
          </DisplayTitle>
          <SerifText className="mt-2 !text-base !tracking-[-0.16px]">
            Let&apos;s tailor your Maestro experience. Tell a bit about yourself
            so we can set up with the right tools.
          </SerifText>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 anim-fade-up anim-delay-1">
              <div className="flex items-center">
                {CHIPS.map((icon, index) => (
                  <div
                    key={icon}
                    className="feature-chip anim-fade-up"
                    style={{ animationDelay: `${0.16 + index * 0.08}s` }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 overflow-hidden"
                    >
                      <img
                        src="/assets/brand/uv-map-chip.png"
                        alt=""
                        className="absolute max-w-none"
                        style={{
                          width: '240%',
                          height: '560%',
                          left: '-20%',
                          top: '-180%',
                          filter: 'blur(1px)',
                        }}
                      />
                    </div>
                    <img
                      src={icon}
                      alt=""
                      width={24}
                      height={24}
                      className="relative z-[1]"
                    />
                  </div>
                ))}
              </div>
              <SerifText className="!text-base !tracking-[-0.16px]">
                Testing your skillset
              </SerifText>
            </div>

            <DisplayTitle className="!max-w-[726px] !text-[32px] !leading-normal anim-fade-up anim-delay-2">
              You&apos;ll be responding to questions that clarify your goals,
              deliverables, and the next steps.
            </DisplayTitle>
          </div>

          <div className="flex gap-4 anim-fade-up anim-delay-3">
            <Button
              maestroVariant="primary"
              className="maestro-btn--continue"
              onClick={functions.continue}
            >
              Continue
              <img
                src="/assets/icons/chevron.svg"
                alt=""
                width={10}
                height={10}
                className="maestro-chevron"
              />
            </Button>
            <Button maestroVariant="secondary" onClick={functions.skip}>
              Skip for now
            </Button>
          </div>

          <SerifText className="!max-w-[389px] !text-base !tracking-[-0.16px] anim-fade-up anim-delay-4">
            First, a 5-question baseline check (about 2 minutes). It&apos;s not a
            test — it just tells me where to start you.
          </SerifText>
        </div>
      </div>
    </OnboardingShell>
  )
}
