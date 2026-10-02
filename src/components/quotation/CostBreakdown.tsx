import { formatCurrency, formatPercentage } from '../../utils/formatters'
import { CostCategory, type QuotationDetail } from '../../types/quotation'

interface CostBreakdownProps {
  quotation: QuotationDetail
}

interface RowProps {
  label: string
  value: string
  emphasize?: boolean
  muted?: boolean
}

function Row({ label, value, emphasize, muted }: RowProps) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className={muted ? 'text-gray-400' : emphasize ? 'font-medium' : 'text-gray-600'}>{label}</span>
      <span className={muted ? 'text-gray-400' : emphasize ? 'font-medium' : ''}>{value}</span>
    </div>
  )
}

export function CostBreakdown({ quotation }: CostBreakdownProps) {
  const fob = Number(quotation.fob)
  const insurance = Number(quotation.insurance)
  const other = Number(quotation.other_international_costs)
  const subtotalConsolidator = Number(quotation.subtotal_consolidator)
  const cif = Number(quotation.cif)
  const subtotalAgent = Number(quotation.subtotal_customs_agent)
  const totalCost = Number(quotation.total_cost)
  const marginAmount = Number(quotation.margin_amount)
  const marginPercentage = Number(quotation.margin_percentage)
  const salePrice = Number(quotation.sale_price)
  const nationalizationBase = Number(quotation.nationalization_base)
  const nationalizationPercentage = Number(quotation.nationalization_percentage)

  // subtotal_customs_agent ya viene del backend SIN el impuesto (is_tax) incluido.
  const taxAmount = quotation.cost_details
    .filter((line) => line.category === CostCategory.CUSTOMS_AGENT && line.is_tax)
    .reduce((sum, line) => sum + Number(line.amount_usd), 0)

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-4 text-sm font-medium text-gray-700">Resumen financiero</h3>

      <div className="flex flex-col gap-4 text-sm">
        <section className="rounded-md bg-gray-50 px-2.5 py-2 text-xs">
          <h4 className="mb-1 font-semibold uppercase tracking-wide text-gray-400">Referencia CIF</h4>
          <Row label="FOB" value={formatCurrency(fob)} muted />
          <Row label="Seguro" value={formatCurrency(insurance)} muted />
          {other > 0 && <Row label="Otros costos internacionales" value={formatCurrency(other)} muted />}
          <Row label="Flete y cargos del consolidador" value={formatCurrency(subtotalConsolidator)} muted />
          <Row label="CIF" value={formatCurrency(cif)} />
          <p className="mt-1 text-gray-400">
            El CIF (y el FOB, Seguro y Otros costos que lo componen) solo son la base para calcular el impuesto y el
            % de nacionalización — no se suman al costo total.
          </p>
        </section>

        <section>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Costo total</h4>
          <Row label="Flete y cargos del consolidador" value={formatCurrency(subtotalConsolidator)} />
          <Row label="Honorarios, almacenaje, flete terrestre y demás cargos" value={formatCurrency(subtotalAgent)} />
          {taxAmount > 0 && (
            <Row label="Impuesto (ISV) — informativo, no se suma al total" value={formatCurrency(taxAmount)} muted />
          )}
        </section>

        <section className="flex flex-col gap-0.5 border-t border-gray-200 pt-3">
          <Row label="Costo total" value={formatCurrency(totalCost)} emphasize />
          <Row label={`Margen (${formatPercentage(marginPercentage)})`} value={formatCurrency(marginAmount)} />
        </section>

        <section className="rounded-md bg-green-50 px-2.5 py-2">
          <Row label="Precio de venta" value={formatCurrency(salePrice)} emphasize />
        </section>

        <section className="flex flex-col gap-0.5 border-t border-gray-200 pt-3 text-xs">
          <Row label="Base de nacionalización (FOB + flete)" value={formatCurrency(nationalizationBase)} muted />
          <Row label="% Nacionalización" value={formatPercentage(nationalizationPercentage)} muted />
        </section>
      </div>
    </div>
  )
}
