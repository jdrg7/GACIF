import { CostLinesTable } from './CostLinesTable'
import { TRANSPORT_LABEL } from '../../utils/constants'
import { CostCategory, type QuotationDetail } from '../../types/quotation'

interface ConsolidatorCostsProps {
  quotation: QuotationDetail
}

export function ConsolidatorCosts({ quotation }: ConsolidatorCostsProps) {
  const lines = quotation.cost_details.filter((line) => line.category === CostCategory.CONSOLIDATOR)

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-700">
        Costos del consolidador — {TRANSPORT_LABEL[quotation.transport_type]}
      </h3>
      <CostLinesTable
        lines={lines}
        subtotal={Number(quotation.subtotal_consolidator)}
      />
    </div>
  )
}
