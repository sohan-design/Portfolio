import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_USER_NAME } from '@/mocks/onboarding'

interface SessionState {
  authenticated: boolean
  userName: string
  mcqChoice: string | null
  subjectiveChoice: string | null
  inputMode: 'text' | 'voice'
}

interface SessionContextValue {
  values: SessionState
  functions: {
    login: () => void
    logout: () => void
    setMcqChoice: (id: string) => void
    setSubjectiveChoice: (id: string) => void
    setInputMode: (mode: 'text' | 'voice') => void
    resetOnboarding: () => void
  }
}

const SessionContext = createContext<SessionContextValue | null>(null)
const STORAGE_KEY = 'maestro-phase1-session'

function readStored(): Partial<SessionState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<SessionState>) : {}
  } catch {
    return {}
  }
}

function writeStored(state: SessionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const stored = readStored()
  const [state, setState] = useState<SessionState>({
    authenticated: Boolean(stored.authenticated),
    userName: DEMO_USER_NAME,
    mcqChoice: stored.mcqChoice ?? null,
    subjectiveChoice: stored.subjectiveChoice ?? null,
    inputMode: stored.inputMode ?? 'text',
  })

  const patch = useCallback((partial: Partial<SessionState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial, userName: DEMO_USER_NAME }
      writeStored(next)
      return next
    })
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      values: state,
      functions: {
        login: () => patch({ authenticated: true }),
        logout: () => {
          localStorage.removeItem(STORAGE_KEY)
          setState({
            authenticated: false,
            userName: DEMO_USER_NAME,
            mcqChoice: null,
            subjectiveChoice: null,
            inputMode: 'text',
          })
        },
        setMcqChoice: (id: string) => patch({ mcqChoice: id }),
        setSubjectiveChoice: (id: string) => patch({ subjectiveChoice: id }),
        setInputMode: (mode: 'text' | 'voice') => patch({ inputMode: mode }),
        resetOnboarding: () =>
          patch({
            mcqChoice: null,
            subjectiveChoice: null,
            inputMode: 'text',
          }),
      },
    }),
    [state, patch],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return ctx
}
