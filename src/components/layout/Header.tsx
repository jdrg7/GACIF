import { useAuth } from '../../hooks/useAuth'
import { Logo } from '../ui/Logo'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 px-6">
      <div className="flex items-center gap-3">
        <Logo className="h-7 w-auto" />
        <span className="h-5 w-px bg-gray-200" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-500">GACI</span>
      </div>
      {user && (
        <div className="flex items-center gap-3 text-sm">
          <span>{user.full_name}</span>
          <button type="button" onClick={logout} className="text-gray-500 hover:text-gray-900">
            Salir
          </button>
        </div>
      )}
    </header>
  )
}
