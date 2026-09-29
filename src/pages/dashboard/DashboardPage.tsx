import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { StatCard } from '../../components/dashboard/StatCard'
import { StatusBreakdown } from '../../components/dashboard/StatusBreakdown'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { usePermissions } from '../../hooks/usePermissions'
import { quotationsService } from '../../services/quotations.service'
import { Permission } from '../../utils/permissions'
import { QuotationStatus } from '../../utils/constants'
import { formatCurrency, formatDate } from '../../utils/formatters'

const CLOSED_STATUSES = new Set<string>([
  QuotationStatus.CANCELADA,
  QuotationStatus.ARCHIVADA,
  QuotationStatus.RECHAZADA,
  QuotationStatus.CERRADA,
])

const WON_STATUSES = new Set<string>([QuotationStatus.GANADA, QuotationStatus.EN_PROCESO, QuotationStatus.CERRADA])

export function DashboardPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const canViewQuotations = hasPermission(Permission.QUOTATION_VIEW)

  const { data, isLoading } = useQuery({
    queryKey: ['quotations', 'dashboard'],
    queryFn: () => quotationsService.list({ limit: 100 }),
    enabled: canViewQuotations,
  })

  if (!canViewQuotations) {
    return (
      <PageWrapper title="Dashboard">
        <EmptyState message="No tienes permiso para ver cotizaciones" />
      </PageWrapper>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  const quotations = data.data
  const counts: Record<string, number> = {}
  let activeCount = 0
  let pipelineValue = 0
  let wonValue = 0

  for (const q of quotations) {
    counts[q.status] = (counts[q.status] ?? 0) + 1
    if (!CLOSED_STATUSES.has(q.status)) {
      activeCount += 1
      pipelineValue += Number(q.sale_price)
    }
    if (WON_STATUSES.has(q.status)) {
      wonValue += Number(q.sale_price)
    }
  }

  const recent = quotations.slice(0, 5)

  return (
    <PageWrapper title="Dashboard">
      {data.meta.total > quotations.length && (
        <p className="text-xs text-gray-400">
          Mostrando estadísticas de las {quotations.length} cotizaciones más recientes de {data.meta.total} en total.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total cotizaciones" value={String(data.meta.total)} />
        <StatCard label="Activas" value={String(activeCount)} hint="No canceladas/archivadas/rechazadas" />
        <StatCard label="Valor en pipeline" value={formatCurrency(pipelineValue)} />
        <StatCard label="Valor ganado" value={formatCurrency(wonValue)} hint="GANADA + EN_PROCESO + CERRADA" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Cotizaciones por estado</h3>
          <StatusBreakdown counts={counts} />
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Cotizaciones recientes</h3>
          {recent.length === 0 ? (
            <EmptyState message="No hay cotizaciones" />
          ) : (
            <ul className="flex flex-col gap-2">
              {recent.map((q) => (
                <li key={q.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                    onClick={() => navigate(`/quotations/${q.id}`)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{q.reference_number}</span>
                      <Badge status={q.status} />
                    </span>
                    <span className="flex items-center gap-3 text-gray-500">
                      <span>{formatCurrency(Number(q.sale_price))}</span>
                      <span className="text-xs">{formatDate(q.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
