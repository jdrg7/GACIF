import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useParams } from 'react-router'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { CostBreakdown } from '../../components/quotation/CostBreakdown'
import { ConsolidatorCosts } from '../../components/quotation/ConsolidatorCosts'
import { CustomsAgentCosts } from '../../components/quotation/CustomsAgentCosts'
import { StateTimeline } from '../../components/quotation/StateTimeline'
import { StateChangeModal } from '../../components/quotation/StateChangeModal'
import { OverrideCostDetailModal } from '../../components/quotation/OverrideCostDetailModal'
import { usePermissions } from '../../hooks/usePermissions'
import { quotationsService } from '../../services/quotations.service'
import { Permission } from '../../utils/permissions'
import { QuotationStatus } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'
import type { QuotationCostDetail } from '../../types/quotation'

interface OverrideTarget {
  line: QuotationCostDetail
  mode: 'override' | 'revert'
}

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const [isStateModalOpen, setStateModalOpen] = useState(false)
  const [stateError, setStateError] = useState<string | null>(null)
  const [overrideTarget, setOverrideTarget] = useState<OverrideTarget | null>(null)
  const [overrideError, setOverrideError] = useState<string | null>(null)

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotations', id],
    queryFn: () => quotationsService.getById(id!),
    enabled: Boolean(id),
  })

  const changeStateMutation = useMutation({
    mutationFn: ({ toStatus, reason }: { toStatus: QuotationStatus; reason?: string }) =>
      quotationsService.changeState(id!, toStatus, reason),
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

  const overrideMutation = useMutation({
    mutationFn: ({ amountUsd, reason }: { amountUsd?: number; reason?: string }) => {
      if (!overrideTarget) throw new Error('No hay línea seleccionada')
      return overrideTarget.mode === 'override'
        ? quotationsService.overrideCostDetail(id!, overrideTarget.line.id, amountUsd!, reason!)
        : quotationsService.revertCostDetail(id!, overrideTarget.line.id, reason)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['quotations', id], updated)
      queryClient.invalidateQueries({ queryKey: ['quotations'], exact: false })
      setOverrideTarget(null)
      setOverrideError(null)
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
        setOverrideError(error.response.data.error.message)
      } else {
        setOverrideError('No se pudo completar la operación')
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

  function openOverride(line: QuotationCostDetail) {
    setOverrideError(null)
    setOverrideTarget({ line, mode: 'override' })
  }

  function openRevert(line: QuotationCostDetail) {
    setOverrideError(null)
    setOverrideTarget({ line, mode: 'revert' })
  }

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
          <span className="text-gray-500">Transporte</span>
          <p className="font-medium">{quotation.transport_type}</p>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <ConsolidatorCosts
          quotation={quotation}
          canEdit={canEditCostDetails}
          onOverride={openOverride}
          onRevert={openRevert}
        />
        <CustomsAgentCosts
          quotation={quotation}
          canEdit={canEditCostDetails}
          onOverride={openOverride}
          onRevert={openRevert}
        />
      </div>

      <CostBreakdown quotation={quotation} />

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
        isSubmitting={changeStateMutation.isPending}
        error={stateError}
        onConfirm={(toStatus, reason) => changeStateMutation.mutate({ toStatus, reason })}
      />

      <OverrideCostDetailModal
        key={overrideTarget ? `${overrideTarget.line.id}-${overrideTarget.mode}` : 'closed'}
        line={overrideTarget?.line ?? null}
        mode={overrideTarget?.mode ?? 'override'}
        reasonRequired={overrideTarget?.mode === 'override' || isPastDraft}
        onClose={() => setOverrideTarget(null)}
        isSubmitting={overrideMutation.isPending}
        error={overrideError}
        onConfirm={(amountUsd, reason) => overrideMutation.mutate({ amountUsd, reason })}
      />
    </PageWrapper>
  )
}
