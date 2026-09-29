import { create } from 'zustand'
import type { Permission, Role } from '../utils/permissions'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: Role
  permissions: Permission[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  setSession: (user: AuthUser, accessToken: string) => void
  clearSession: () => void
  finishInitializing: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  setSession: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isInitializing: false }),
  clearSession: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false }),
  finishInitializing: () => set({ isInitializing: false }),
}))
