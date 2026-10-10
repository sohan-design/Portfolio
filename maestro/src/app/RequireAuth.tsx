import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/context/SessionContext'

export function RequireAuth() {
  const { values } = useSession()
  if (!values.authenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
