import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface UiState {
  notifications: Notification[]
  pushNotification: (notification: Omit<Notification, 'id'>) => void
  dismissNotification: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  notifications: [],
  pushNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id: crypto.randomUUID() }],
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))
