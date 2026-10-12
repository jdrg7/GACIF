import { formatCurrency } from '../../utils/formatters'
import type { QuotationCostDetail } from '../../types/quotation'

interface CostLinesTableProps {
  lines: QuotationCostDetail[]
  subtotal: number
  canEdit?: boolean
  onOverride?: (line: QuotationCostDetail) => void
  onRevert?: (line: QuotationCostDetail) => void
}

export function CostLinesTable({ lines, subtotal, canEdit, onOverride, onRevert }: CostLinesTableProps) {
  if (lines.length === 0) {
    return <p className="text-sm text-gray-400">Sin líneas</p>
  }

  return (
    <table className="w-full text-sm">
      <tbody>
        {lines.map((line) => (
          <tr key={line.id} className="border-b border-gray-100">
            <td className="py-1.5 pr-3">
              {line.component_name}
              {line.is_manual_override && (
                <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                  Override
                </span>
              )}
              {line.is_tax && (
                <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                  Impuesto, no se suma
                </span>
              )}
            </td>
            <td className="py-1.5 text-right font-medium">{formatCurrency(Number(line.amount_usd))}</td>
            {canEdit && (
              <td className="py-1.5 pl-3 text-right">
                {line.is_manual_override ? (
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:underline"
                    onClick={() => onRevert?.(line)}
                  >
                    Revertir
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={() => onOverride?.(line)}
                  >
                    Sobreescribir
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
        <tr>
          <td className="pt-2 font-medium">Subtotal</td>
          <td className="pt-2 text-right font-medium">{formatCurrency(subtotal)}</td>
          {canEdit && <td />}
        </tr>
      </tbody>
    </table>
  )
}
