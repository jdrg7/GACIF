import { Badge } from '../ui/Badge'
import { QuotationStatus } from '../../utils/constants'

interface StatusBreakdownProps {
  counts: Record<string, number>
}

export function StatusBreakdown({ counts }: StatusBreakdownProps) {
  const maxCount = Math.max(1, ...Object.values(counts))

  return (
    <div className="flex flex-col gap-2">
      {Object.values(QuotationStatus).map((status) => {
        const count = counts[status] ?? 0
        return (
          <div key={status} className="flex items-center gap-3">
            <div className="w-32 shrink-0">
              <Badge status={status} />
            </div>
            <div className="h-2 flex-1 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm text-gray-600">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
