import { useAuthStore } from '../store/auth.store'
import * as authService from '../services/auth.service'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const clearSession = useAuthStore((state) => state.clearSession)

  async function logout() {
    try {
      await authService.logout()
    } finally {
      clearSession()
    }
  }

  return { user, isAuthenticated, logout }
}
