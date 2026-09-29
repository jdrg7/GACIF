import type { QuotationStatus } from '../../utils/constants'

const STATUS_CLASSES: Record<QuotationStatus, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700',
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  ENVIADA: 'bg-blue-100 text-blue-700',
  VIGENTE: 'bg-cyan-100 text-cyan-700',
  GANADA: 'bg-green-100 text-green-700',
  EN_PROCESO: 'bg-indigo-100 text-indigo-700',
  ALTERNATIVA: 'bg-purple-100 text-purple-700',
  CERRADA: 'bg-slate-200 text-slate-700',
  RECHAZADA: 'bg-red-100 text-red-700',
  CANCELADA: 'bg-red-100 text-red-700',
  ARCHIVADA: 'bg-gray-200 text-gray-500',
}

interface BadgeProps {
  status: QuotationStatus
}

export function Badge({ status }: BadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {status}
    </span>
  )
}
