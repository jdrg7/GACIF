interface StatCardProps {
  label: string
  value: string
  hint?: string
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-medium">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
