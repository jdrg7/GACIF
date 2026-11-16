import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'react-router'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { CostBreakdown } from '../../components/quotation/CostBreakdown'
import { ScenarioComparison } from '../../components/quotation/ScenarioComparison'
import { ConsolidatorCosts } from '../../components/quotation/ConsolidatorCosts'
import { CustomsAgentCosts } from '../../components/quotation/CustomsAgentCosts'
import { StateTimeline } from '../../components/quotation/StateTimeline'
import { StateChangeModal } from '../../components/quotation/StateChangeModal'
import { usePermissions } from '../../hooks/usePermissions'
import { quotationsService } from '../../services/quotations.service'
import { Permission } from '../../utils/permissions'
import {
  QuotationStatus,
  SERVICE_LEVEL_LABEL,
  TRANSPORT_LABEL,
  type ServiceLevel,
  type TransportType,
} from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

// Antes de enviarse, cualquier recálculo usa tarifas vigentes; desde ENVIADA todo queda congelado.
const PRE_SEND_STATUSES = new Set<QuotationStatus>([
  QuotationStatus.BORRADOR,
  QuotationStatus.PENDIENTE,
  QuotationStatus.ALTERNATIVA,
])

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const [isStateModalOpen, setStateModalOpen] = useState(false)
  const [stateError, setStateError] = useState<string | null>(null)
  const [scenarioError, setScenarioError] = useState<string | null>(null)
  const [previewTransportType, setPreviewTransportType] = useState<TransportType | null>(null)

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotations', id],
    queryFn: () => quotationsService.getById(id!),
    enabled: Boolean(id),
  })

  const changeStateMutation = useMutation({
    mutationFn: ({
      toStatus,
      reason,
      transportType,
    }: {
      toStatus: QuotationStatus
      reason?: string
      transportType?: TransportType
    }) => quotationsService.changeState(id!, toStatus, reason, transportType),
    onSuccess: (updated) => {
      queryClient.setQueryData(['quotations', id], updated)
      queryClient.invalidateQueries({ queryKey: ['quotations'], exact: false })
      setStateModalOpen(false)
      setStateError(null)
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        setStateError(error.response.data.error.message)
      } else {
        setStateError('No se pudo cambiar el estado')
      }
    },
  })

  const scenarioMutation = useMutation({
    mutationFn: (input: { transportType: TransportType } | { serviceLevel: ServiceLevel }) =>
      'transportType' in input
        ? quotationsService.selectScenario(id!, input.transportType)
        : quotationsService.updateServiceLevel(id!, input.serviceLevel),
    onSuccess: (updated) => {
      queryClient.setQueryData(['quotations', id], updated)
      queryClient.invalidateQueries({ queryKey: ['quotations'], exact: false })
      setScenarioError(null)
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        setScenarioError(error.response.data.error.message)
      } else {
        setScenarioError('No se pudo actualizar la cotización')
      }
    },
  })

  if (isLoading || !quotation) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  const canEditCostDetails = hasPermission(Permission.QUOTATION_EDIT)
  const isPastDraft = quotation.status !== QuotationStatus.BORRADOR
  // Elegir modo / nivel de servicio solo en borrador: después requiere permiso y razón especiales.
  const canChangeScenario = canEditCostDetails && !isPastDraft
  const displayedScenario = quotation.scenarios.find(
    (scenario) => scenario.transport_type === (previewTransportType ?? quotation.transport_type),
  )
  const displayedQuotation = displayedScenario
    ? {
        ...quotation,
        transport_type: displayedScenario.transport_type,
        subtotal_consolidator: displayedScenario.subtotal_consolidator,
        cif: displayedScenario.cif,
        subtotal_customs_agent: displayedScenario.subtotal_customs_agent,
        total_cost: displayedScenario.total_cost,
        margin_amount: displayedScenario.margin_amount,
        margin_percentage: displayedScenario.margin_percentage,
        sale_price: displayedScenario.sale_price,
        nationalization_base: displayedScenario.nationalization_base,
        nationalization_percentage: displayedScenario.nationalization_percentage,
        cost_details: displayedScenario.cost_details ?? quotation.cost_details,
      }
    : quotation

  return (
    <PageWrapper
      title={quotation.reference_number}
      actions={
        <div className="flex items-center gap-3">
          <Badge status={quotation.status} />
          {hasPermission(Permission.QUOTATION_CHANGE_STATE) && (
            <Button
              variant="secondary"
              onClick={() => {
                setStateError(null)
                setStateModalOpen(true)
              }}
            >
              Cambiar estado
            </Button>
          )}
        </div>
      }
    >
      <div className="grid gap-4 rounded-lg border border-gray-200 p-4 text-sm sm:grid-cols-3">
        <div>
          <span className="text-gray-500">Transporte elegido</span>
          <p className="font-medium">
            {TRANSPORT_LABEL[quotation.transport_type]}
            {quotation.transport_type === 'AEREO' && ` · ${SERVICE_LEVEL_LABEL[quotation.service_level]}`}
          </p>
        </div>
        <div>
          <span className="text-gray-500">OPP</span>
          <p className="font-medium">{quotation.opportunity_id ?? '—'}</p>
        </div>
        <div>
          <span className="text-gray-500">Creada</span>
          <p className="font-medium">{formatDate(quotation.created_at)}</p>
        </div>
      </div>

      <ScenarioComparison
        quotation={quotation}
        selectedTransportType={displayedQuotation.transport_type}
        onPreviewSelect={setPreviewTransportType}
        canEdit={canChangeScenario}
        isFrozen={!PRE_SEND_STATUSES.has(quotation.status)}
        isBusy={scenarioMutation.isPending}
        error={scenarioError}
        onSelect={(transportType) => scenarioMutation.mutate({ transportType })}
        onChangeServiceLevel={(serviceLevel) => scenarioMutation.mutate({ serviceLevel })}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ConsolidatorCosts quotation={displayedQuotation} />
        <CustomsAgentCosts quotation={displayedQuotation} />
      </div>

      <CostBreakdown quotation={displayedQuotation} />

      {quotation.observations && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700">Observaciones</h3>
          <p className="text-sm text-gray-600">{quotation.observations}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-3 text-sm font-medium text-gray-700">Historial de estados</h3>
        <StateTimeline changes={quotation.audit_state_changes} />
      </div>

      <StateChangeModal
        isOpen={isStateModalOpen}
        onClose={() => setStateModalOpen(false)}
        currentStatus={quotation.status}
        currentTransport={quotation.transport_type}
        scenarios={quotation.scenarios}
        isSubmitting={changeStateMutation.isPending}
        error={stateError}
        onConfirm={(toStatus, reason, transportType) =>
          changeStateMutation.mutate({ toStatus, reason, transportType })
        }
      />

    </PageWrapper>
  )
}
