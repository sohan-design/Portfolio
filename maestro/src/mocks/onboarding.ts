export const ONBOARDING_STEPS = [
  {
    id: 'login',
    title: 'Login or Sign UP',
    description: 'Choose the courses that best fit your learning goals.',
  },
  {
    id: 'skill',
    title: 'Skill Assessment',
    description: 'Evaluate your current skills to guide your learning path.',
  },
  {
    id: 'feedback',
    title: 'Feedback Survey',
    description: 'Share your thoughts to improve our onboarding process.',
  },
  {
    id: 'profile',
    title: 'Profile Setup',
    description: 'Fill in your details to personalize your dashboard.',
  },
  {
    id: 'checklist',
    title: 'Onboarding Checklist',
    description: 'Keep track of your onboarding tasks for a smooth start.',
  },
] as const

export const MCQ_OPTIONS = [
  { id: 'learning', label: 'Learning Experience' },
  { id: 'tutor', label: 'Tutor and Expert' },
  { id: 'hyper', label: 'Hyper-personalised Learning' },
] as const

export const SUBJECTIVE_OPTIONS = [
  { id: 'language', label: 'Learn New Language', icon: 'languages' as const },
  { id: 'cyber', label: 'Cybersecurity', icon: 'finger' as const },
  { id: 'marketing', label: 'Marketing', icon: 'at' as const },
] as const

export const DEMO_USER_NAME = 'Nikhil'
