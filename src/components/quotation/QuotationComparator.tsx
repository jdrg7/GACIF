import { Badge } from '../ui/Badge'
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters'
import type { Quotation } from '../../types/quotation'

interface MetricRow {
  label: string
  render: (quotation: Quotation) => string
  emphasize?: boolean
}

const ROWS: MetricRow[] = [
  { label: 'Estado', render: (q) => q.status },
  { label: 'Transporte', render: (q) => q.transport_type },
  { label: 'FOB', render: (q) => formatCurrency(Number(q.fob)) },
  { label: 'Seguro', render: (q) => formatCurrency(Number(q.insurance)) },
  { label: 'Subtotal consolidador', render: (q) => formatCurrency(Number(q.subtotal_consolidator)) },
  { label: 'CIF', render: (q) => formatCurrency(Number(q.cif)), emphasize: true },
  { label: 'Subtotal agente aduanero', render: (q) => formatCurrency(Number(q.subtotal_customs_agent)) },
  { label: 'Costo total', render: (q) => formatCurrency(Number(q.total_cost)), emphasize: true },
  {
    label: 'Margen',
    render: (q) => `${formatCurrency(Number(q.margin_amount))} (${formatPercentage(Number(q.margin_percentage))})`,
  },
  { label: 'Precio de venta', render: (q) => formatCurrency(Number(q.sale_price)), emphasize: true },
  {
    label: 'Nacionalización',
    render: (q) => formatPercentage(Number(q.nationalization_percentage)),
  },
  { label: 'Creada', render: (q) => formatDate(q.created_at) },
]

interface QuotationComparatorProps {
  quotations: Quotation[]
  onSelect: (quotation: Quotation) => void
}

export function QuotationComparator({ quotations, onSelect }: QuotationComparatorProps) {
  if (quotations.length === 0) {
    return <p className="text-sm text-gray-400">No hay cotizaciones para esta oportunidad</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="px-3 py-2 font-medium text-gray-500">Métrica</th>
            {quotations.map((quotation) => (
              <th key={quotation.id} className="px-3 py-2">
                <button
                  type="button"
                  className="flex flex-col items-start gap-1 text-blue-600 hover:underline"
                  onClick={() => onSelect(quotation)}
                >
                  <span className="font-medium">{quotation.reference_number}</span>
                  <Badge status={quotation.status} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b border-gray-100">
              <td className="px-3 py-1.5 text-gray-500">{row.label}</td>
              {quotations.map((quotation) => (
                <td key={quotation.id} className={`px-3 py-1.5 ${row.emphasize ? 'font-medium' : ''}`}>
                  {row.render(quotation)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
