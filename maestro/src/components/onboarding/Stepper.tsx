import { ONBOARDING_STEPS } from '@/mocks/onboarding'

interface StepperProps {
  activeIndex: number
}

export function Stepper({ activeIndex }: StepperProps) {
  return (
    <nav className="stepper" aria-label="Onboarding progress">
      {ONBOARDING_STEPS.map((step, index) => {
        const active = index === activeIndex
        return (
          <div
            key={step.id}
            className={`stepper-item anim-fade-up ${active ? 'is-active' : ''}`.trim()}
            style={{ animationDelay: `${0.08 + index * 0.05}s` }}
          >
            <span
              className={`stepper-radio ${active ? 'is-active' : ''}`.trim()}
              aria-hidden
            />
            <div>
              <p className="stepper-title">{step.title}</p>
              <p className="stepper-desc">{step.description}</p>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
