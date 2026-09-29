import { formatCurrency, formatPercentage } from '../../utils/formatters'
import type { QuotationDetail } from '../../types/quotation'

interface CostBreakdownProps {
  quotation: QuotationDetail
}

interface Row {
  label: string
  value: string
  emphasize?: boolean
}

export function CostBreakdown({ quotation }: CostBreakdownProps) {
  const rows: Row[] = [
    { label: 'FOB', value: formatCurrency(Number(quotation.fob)) },
    { label: 'Seguro', value: formatCurrency(Number(quotation.insurance)) },
    { label: 'Otros costos internacionales', value: formatCurrency(Number(quotation.other_international_costs)) },
    { label: 'Subtotal consolidador', value: formatCurrency(Number(quotation.subtotal_consolidator)) },
    { label: 'CIF', value: formatCurrency(Number(quotation.cif)), emphasize: true },
    { label: 'Subtotal agente aduanero', value: formatCurrency(Number(quotation.subtotal_customs_agent)) },
    { label: 'Costo total', value: formatCurrency(Number(quotation.total_cost)), emphasize: true },
    {
      label: `Margen (${formatPercentage(Number(quotation.margin_percentage))})`,
      value: formatCurrency(Number(quotation.margin_amount)),
    },
    { label: 'Precio de venta', value: formatCurrency(Number(quotation.sale_price)), emphasize: true },
    {
      label: `Nacionalización (${formatPercentage(Number(quotation.nationalization_percentage))})`,
      value: formatCurrency(Number(quotation.nationalization_base)),
    },
  ]

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Resumen financiero</h3>
      <dl className="flex flex-col gap-1.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <dt className={row.emphasize ? 'font-medium' : 'text-gray-500'}>{row.label}</dt>
            <dd className={row.emphasize ? 'font-medium' : ''}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
