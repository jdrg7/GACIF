export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${className}`}
      role="status"
      aria-label="Cargando"
    />
  )
}
