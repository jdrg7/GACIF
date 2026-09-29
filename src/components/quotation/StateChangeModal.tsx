import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import { QUOTATION_REASON_REQUIRED, QUOTATION_TRANSITIONS, type QuotationStatus } from '../../utils/constants'

interface StateChangeModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: QuotationStatus
  onConfirm: (toStatus: QuotationStatus, reason?: string) => void
  isSubmitting?: boolean
  error?: string | null
}

export function StateChangeModal({
  isOpen,
  onClose,
  currentStatus,
  onConfirm,
  isSubmitting,
  error,
}: StateChangeModalProps) {
  const options = QUOTATION_TRANSITIONS[currentStatus]
  const [toStatus, setToStatus] = useState<QuotationStatus | ''>('')
  const [reason, setReason] = useState('')

  const reasonRequired = toStatus !== '' && QUOTATION_REASON_REQUIRED.has(toStatus)
  const canSubmit = toStatus !== '' && (!reasonRequired || reason.trim().length > 0)

  function handleClose() {
    setToStatus('')
    setReason('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cambiar estado">
      {options.length === 0 ? (
        <p className="text-sm text-gray-500">Esta cotización no tiene transiciones disponibles.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <Select
            label="Nuevo estado"
            value={toStatus}
            onChange={(event) => setToStatus(event.target.value as QuotationStatus)}
            options={[{ value: '', label: 'Selecciona un estado' }, ...options.map((s) => ({ value: s, label: s }))]}
          />
          <Input
            label={`Motivo${reasonRequired ? ' (requerido)' : ' (opcional)'}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              disabled={!canSubmit || isSubmitting}
              onClick={() => toStatus && onConfirm(toStatus, reason.trim() || undefined)}
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
