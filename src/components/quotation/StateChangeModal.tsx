import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import {
  QUOTATION_REASON_REQUIRED,
  QUOTATION_TRANSITIONS,
  QuotationStatus,
  TRANSPORT_LABEL,
  type TransportType,
} from '../../utils/constants'
import { formatCurrency } from '../../utils/formatters'

interface ScenarioOption {
  transport_type: TransportType
  total_cost: string
}

interface StateChangeModalProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: QuotationStatus
  currentTransport: TransportType
  scenarios: ScenarioOption[]
  onConfirm: (toStatus: QuotationStatus, reason?: string, transportType?: TransportType) => void
  isSubmitting?: boolean
  error?: string | null
}

// Al enviar o al ganar, el escenario "se compromete": se confirma qué modo se envía / aceptó el cliente.
const MODE_PROMPT: Partial<Record<QuotationStatus, string>> = {
  [QuotationStatus.ENVIADA]: 'Modo de transporte que se envía al cliente',
  [QuotationStatus.GANADA]: 'Modo de transporte aceptado por el cliente',
}

export function StateChangeModal({
  isOpen,
  onClose,
  currentStatus,
  currentTransport,
  scenarios,
  onConfirm,
  isSubmitting,
  error,
}: StateChangeModalProps) {
  const options = QUOTATION_TRANSITIONS[currentStatus]
  const [toStatus, setToStatus] = useState<QuotationStatus | ''>('')
  const [reason, setReason] = useState('')
  const [transport, setTransport] = useState<TransportType | ''>('')

  const reasonRequired = toStatus !== '' && QUOTATION_REASON_REQUIRED.has(toStatus)
  const canSubmit = toStatus !== '' && (!reasonRequired || reason.trim().length > 0)
  const modePrompt = toStatus !== '' ? MODE_PROMPT[toStatus] : undefined
  const selectedTransport = transport || currentTransport

  function handleClose() {
    setToStatus('')
    setReason('')
    setTransport('')
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

          {modePrompt && scenarios.length > 0 && (
            <div className="flex flex-col gap-2">
              <Select
                label={modePrompt}
                value={selectedTransport}
                onChange={(event) => setTransport(event.target.value as TransportType)}
                options={scenarios.map((s) => ({
                  value: s.transport_type,
                  label: `${TRANSPORT_LABEL[s.transport_type]} — ${formatCurrency(Number(s.total_cost))}`,
                }))}
              />
              {toStatus === QuotationStatus.ENVIADA && (
                <p className="text-xs text-gray-500">
                  Al enviar se recalcula con las tarifas y el tipo de cambio vigentes, y la cotización queda
                  congelada.
                </p>
              )}
            </div>
          )}

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
              onClick={() =>
                toStatus &&
                onConfirm(toStatus, reason.trim() || undefined, modePrompt && scenarios.length > 0 ? selectedTransport : undefined)
              }
            >
              {isSubmitting ? 'Guardando...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
