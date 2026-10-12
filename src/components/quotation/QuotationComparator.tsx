import { Badge } from '../ui/Badge'
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters'
import type { Quotation } from '../../types/quotation'

interface MetricRow {
  label: string
  render: (quotation: Quotation) => string
  value?: (quotation: Quotation) => number
  better?: 'min' | 'max'
  emphasize?: boolean
}

const ROWS: MetricRow[] = [
  { label: 'Estado', render: (q) => q.status },
  { label: 'Transporte', render: (q) => q.transport_type },
  { label: 'FOB', render: (q) => formatCurrency(Number(q.fob)) },
  { label: 'Seguro', render: (q) => formatCurrency(Number(q.insurance)) },
  { label: 'Subtotal consolidador', render: (q) => formatCurrency(Number(q.subtotal_consolidator)), value: (q) => Number(q.subtotal_consolidator), better: 'min' },
  { label: 'CIF', render: (q) => formatCurrency(Number(q.cif)), value: (q) => Number(q.cif), better: 'min', emphasize: true },
  { label: 'Subtotal agente aduanero', render: (q) => formatCurrency(Number(q.subtotal_customs_agent)), value: (q) => Number(q.subtotal_customs_agent), better: 'min' },
  { label: 'Costo total', render: (q) => formatCurrency(Number(q.total_cost)), value: (q) => Number(q.total_cost), better: 'min', emphasize: true },
  {
    label: 'Margen',
    render: (q) => `${formatCurrency(Number(q.margin_amount))} (${formatPercentage(Number(q.margin_percentage))})`,
    value: (q) => Number(q.margin_amount),
    better: 'max',
  },
  {
    label: 'Precio de venta',
    render: (q) => formatCurrency(Number(q.sale_price)),
    value: (q) => Number(q.sale_price),
    better: 'min',
    emphasize: true,
  },
  { label: 'Nacionalización', render: (q) => formatPercentage(Number(q.nationalization_percentage)) },
  { label: 'Creada', render: (q) => formatDate(q.created_at) },
]

interface QuotationComparatorProps {
  quotations: Quotation[]
  onSelect: (quotation: Quotation) => void
}

interface RowVerdict {
  bestId: string
  bestValue: number
}

function verdictForRow(row: MetricRow, quotations: Quotation[]): RowVerdict | null {
  if (!row.value || !row.better || quotations.length === 0) return null
  const values = row.value
  let bestQuotation = quotations[0]!
  let bestValue = values(bestQuotation)
  for (const quotation of quotations.slice(1)) {
    const value = values(quotation)
    if ((row.better === 'min' && value < bestValue) || (row.better === 'max' && value > bestValue)) {
      bestValue = value
      bestQuotation = quotation
    }
  }
  // Empate: nadie destaca en esta métrica.
  const tieCount = quotations.filter((q) => values(q) === bestValue).length
  return tieCount > 1 ? null : { bestId: bestQuotation.id, bestValue }
}

export function QuotationComparator({ quotations, onSelect }: QuotationComparatorProps) {
  if (quotations.length === 0) {
    return <p className="text-sm text-gray-400">No hay cotizaciones para esta oportunidad</p>
  }

  const salePrices = quotations.map((q) => ({ id: q.id, reference: q.reference_number, price: Number(q.sale_price) }))
  const sorted = [...salePrices].sort((a, b) => a.price - b.price)
  const recommended = quotations.length > 1 ? sorted[0] : null
  const runnerUp = quotations.length > 1 ? sorted[1] : null
  const savings = recommended && runnerUp ? runnerUp.price - recommended.price : 0
  const savingsPct = recommended && runnerUp && runnerUp.price > 0 ? (savings / runnerUp.price) * 100 : 0

  const verdicts = new Map(ROWS.map((row) => [row.label, verdictForRow(row, quotations)]))

  return (
    <div className="flex flex-col gap-4">
      {recommended && runnerUp && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          <span className="font-medium">Recomendada: {recommended.reference}</span> — precio de venta más bajo (
          {formatCurrency(recommended.price)}), {formatCurrency(savings)} ({formatPercentage(savingsPct)}) menos que la
          siguiente mejor opción ({runnerUp.reference}). En cada tarjeta, lo resaltado en verde indica en qué métrica
          gana esa cotización; el resto muestra cuánto le falta para igualar al mejor.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quotations.map((quotation) => {
          const isRecommended = recommended?.id === quotation.id

          return (
            <div
              key={quotation.id}
              className={`flex flex-col gap-3 rounded-lg border p-4 ${
                isRecommended ? 'border-green-400 ring-1 ring-green-300' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  className="flex flex-col items-start gap-1 text-blue-600 hover:underline"
                  onClick={() => onSelect(quotation)}
                >
                  <span className="font-medium">{quotation.reference_number}</span>
                  <Badge status={quotation.status} />
                </button>
                {isRecommended && (
                  <span className="shrink-0 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
                    Mejor opción
                  </span>
                )}
              </div>

              <dl className="flex flex-col gap-1.5 text-sm">
                {ROWS.map((row) => {
                  const verdict = verdicts.get(row.label) ?? null
                  const isWinner = verdict?.bestId === quotation.id
                  const hasVerdict = row.value !== undefined && verdict !== null
                  const gap = hasVerdict && !isWinner ? Math.abs(row.value!(quotation) - verdict!.bestValue) : 0

                  return (
                    <div
                      key={row.label}
                      className={`flex items-baseline justify-between gap-2 rounded px-1.5 py-0.5 ${
                        isWinner ? 'bg-green-50' : ''
                      }`}
                    >
                      <dt className="text-gray-500">{row.label}</dt>
                      <dd className={`text-right ${row.emphasize ? 'font-medium' : ''} ${isWinner ? 'text-green-800' : ''}`}>
                        {row.render(quotation)}
                        {isWinner && ' ✓'}
                        {hasVerdict && !isWinner && gap > 0 && (
                          <span className="ml-1.5 text-xs text-gray-400">(+{formatCurrency(gap)} vs. mejor)</span>
                        )}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          )
        })}
      </div>
    </div>
  )
}
