# Maestro — Phase 1 (Login + Onboarding)

Frontend-only implementation of Maestro Pilot login and onboarding screens from Figma.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS 4
- React Router
- Ant Design (button wrappers) + Typography
- Brand UV-map assets extracted from Figma with CSS blur

## Develop

```bash
cd maestro
npm install
npm run dev
```

Open http://localhost:5173 → `/login`

## Flow (mock auth)

1. `/login` — Google / SSO (mock)
2. `/onboarding/evaluation`
3. `/onboarding/mcq`
4. `/onboarding/subjective`
5. `/onboarding/done`

## Design source

Figma: [Maestro Pilot](https://www.figma.com/design/cRl1JkLjUcTShY9YQorLeW/Maestro-Pilot?node-id=198-1813)
