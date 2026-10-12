import { CostLinesTable } from './CostLinesTable'
import { CostCategory, type QuotationCostDetail, type QuotationDetail } from '../../types/quotation'

interface ConsolidatorCostsProps {
  quotation: QuotationDetail
  canEdit?: boolean
  onOverride?: (line: QuotationCostDetail) => void
  onRevert?: (line: QuotationCostDetail) => void
}

export function ConsolidatorCosts({ quotation, canEdit, onOverride, onRevert }: ConsolidatorCostsProps) {
  const lines = quotation.cost_details.filter((line) => line.category === CostCategory.CONSOLIDATOR)

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">Costos del consolidador</h3>
      <CostLinesTable
        lines={lines}
        subtotal={Number(quotation.subtotal_consolidator)}
        canEdit={canEdit}
        onOverride={onOverride}
        onRevert={onRevert}
      />
    </div>
  )
}
