import { Badge } from '../ui/Badge'
import { formatDate } from '../../utils/formatters'
import type { AuditStateChange } from '../../types/quotation'

interface StateTimelineProps {
  changes: AuditStateChange[]
}

export function StateTimeline({ changes }: StateTimelineProps) {
  if (changes.length === 0) {
    return <p className="text-sm text-gray-400">Sin cambios de estado registrados</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {changes.map((change) => (
        <li key={change.id} className="flex items-start gap-3 text-sm">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Badge status={change.from_status} />
              <span className="text-gray-400">→</span>
              <Badge status={change.to_status} />
            </div>
            <span className="text-xs text-gray-500">{formatDate(change.changed_at)}</span>
            {change.reason && <span className="text-gray-600">{change.reason}</span>}
          </div>
        </li>
      ))}
    </ul>
  )
}
