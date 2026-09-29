import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/auth.store'
import * as authService from '../services/auth.service'

export function useAuthBootstrap() {
  const setSession = useAuthStore((state) => state.setSession)
  const finishInitializing = useAuthStore((state) => state.finishInitializing)
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    authService
      .refresh()
      .then(({ user, accessToken }) => setSession(user, accessToken))
      .catch(() => finishInitializing())
  }, [setSession, finishInitializing])

  return { isInitializing }
}
