import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { QuotationCostDetail } from '../../types/quotation'

interface OverrideCostDetailModalProps {
  line: QuotationCostDetail | null
  mode: 'override' | 'revert'
  reasonRequired: boolean
  onClose: () => void
  onConfirm: (amountUsd: number | undefined, reason: string | undefined) => void
  isSubmitting?: boolean
  error?: string | null
}

export function OverrideCostDetailModal({
  line,
  mode,
  reasonRequired,
  onClose,
  onConfirm,
  isSubmitting,
  error,
}: OverrideCostDetailModalProps) {
  const [amount, setAmount] = useState(() => (mode === 'override' ? (line?.amount_usd ?? '') : ''))
  const [reason, setReason] = useState('')

  if (!line) return null

  const isOverride = mode === 'override'
  const canSubmit = (!isOverride || amount.trim() !== '') && (!reasonRequired || reason.trim() !== '')

  return (
    <Modal isOpen onClose={onClose} title={isOverride ? 'Sobreescribir línea de costo' : 'Revertir sobreescritura'}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{line.component_name}</p>

        {isOverride && (
          <Input
            label="Nuevo monto (USD)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        )}

        <Input
          label={`Motivo${reasonRequired ? ' (requerido)' : ' (opcional)'}`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={isOverride ? 'primary' : 'danger'}
            disabled={!canSubmit || isSubmitting}
            onClick={() => onConfirm(isOverride ? Number(amount) : undefined, reason.trim() || undefined)}
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
