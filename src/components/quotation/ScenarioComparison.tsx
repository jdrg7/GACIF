import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { SERVICE_LEVEL_LABEL, ServiceLevel, TRANSPORT_LABEL, TransportType } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatters'
import type { QuotationDetail, QuotationScenario } from '../../types/quotation'

const LB_PER_KG = 2.2046

const MODE_ORDER: TransportType[] = [TransportType.AEREO, TransportType.MARITIMO]

const SERVICE_LEVEL_OPTIONS = [
  { value: ServiceLevel.REGULAR, label: SERVICE_LEVEL_LABEL.REGULAR },
  { value: ServiceLevel.PRIORITY, label: `${SERVICE_LEVEL_LABEL.PRIORITY} (envío prioritario)` },
]

interface ScenarioComparisonProps {
  quotation: QuotationDetail
  canEdit: boolean
  /** true una vez enviada: ya no se recalcula con tarifas nuevas. */
  isFrozen: boolean
  isBusy: boolean
  error?: string | null
  onSelect: (transportType: TransportType) => void
  onChangeServiceLevel: (serviceLevel: ServiceLevel) => void
}

interface RowProps {
  label: string
  value: string
}

function Row({ label, value }: RowProps) {
  return (
    <div className="flex justify-between gap-3 py-0.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

// El aéreo cobra por el mayor entre peso real y volumétrico; el marítimo, por volumen o por peso.
function loadRows(scenario: QuotationScenario, quotation: QuotationDetail): RowProps[] {
  if (scenario.transport_type === TransportType.AEREO) {
    const real = Number(quotation.total_weight_kg)
    const volumetric = Number(scenario.volumetric_weight_lb) / LB_PER_KG
    return [
      { label: 'Peso real / volumétrico', value: `${real.toFixed(2)} / ${volumetric.toFixed(2)} kg` },
      {
        label: 'Peso cobrable',
        value: `${Number(scenario.chargeable_weight_kg).toFixed(2)} kg (${volumetric > real ? 'volumétrico' : 'real'})`,
      },
    ]
  }
  return [
    {
      label: 'Volumen / peso',
      value: `${Number(quotation.total_volume_cft).toFixed(2)} CFT / ${Number(quotation.total_weight_lb).toFixed(2)} lb`,
    },
  ]
}

export function ScenarioComparison({
  quotation,
  canEdit,
  isFrozen,
  isBusy,
  error,
  onSelect,
  onChangeServiceLevel,
}: ScenarioComparisonProps) {
  const scenarios = [...quotation.scenarios].sort(
    (a, b) => MODE_ORDER.indexOf(a.transport_type) - MODE_ORDER.indexOf(b.transport_type),
  )
  if (scenarios.length === 0) return null

  const cheapest = scenarios.reduce((best, current) =>
    Number(current.total_cost) < Number(best.total_cost) ? current : best,
  )
  const hasAir = scenarios.some((s) => s.transport_type === TransportType.AEREO)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Modos de transporte</h3>
          <p className="text-xs text-gray-500">
            {scenarios.length > 1
              ? 'Se calcularon todos los modos con tarifa vigente. Elige con cuál sigue la cotización.'
              : `Solo hay tarifa vigente para el modo ${TRANSPORT_LABEL[scenarios[0]!.transport_type]}.`}
          </p>
        </div>
        {hasAir && (
          <div className="w-56">
            <Select
              label="Nivel de servicio aéreo"
              options={SERVICE_LEVEL_OPTIONS}
              value={quotation.service_level}
              disabled={!canEdit || isBusy}
              onChange={(event) => onChangeServiceLevel(event.target.value as ServiceLevel)}
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isFrozen ? (
        <p className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
          Cotización enviada: el modo elegido, las tarifas y el tipo de cambio quedaron congelados.
        </p>
      ) : (
        !quotation.scenario_chosen &&
        scenarios.length > 1 && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            El modo elegido es solo una sugerencia (el más barato). Confírmalo o elige otro antes de enviar la
            cotización.
          </p>
        )
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {scenarios.map((scenario) => {
          const isSelected = scenario.transport_type === quotation.transport_type
          const isCheapest = scenario.id === cheapest.id
          const difference = Number(scenario.total_cost) - Number(cheapest.total_cost)
          const differencePct = Number(cheapest.total_cost) > 0 ? (difference / Number(cheapest.total_cost)) * 100 : 0

          return (
            <div
              key={scenario.id}
              className={`flex flex-col gap-3 rounded-lg border p-4 ${
                isSelected ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-gray-900">{TRANSPORT_LABEL[scenario.transport_type]}</span>
                {isSelected && (
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                    {quotation.scenario_chosen ? 'Elegido' : 'Elegido (el más barato)'}
                  </span>
                )}
                {isCheapest && scenarios.length > 1 && (
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                    Más barato
                  </span>
                )}
                {scenario.transport_type === TransportType.AEREO && quotation.service_level === ServiceLevel.PRIORITY && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">Priority</span>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500">Costo total</p>
                <p className="text-2xl font-semibold">{formatCurrency(Number(scenario.total_cost))}</p>
                {!isCheapest && difference > 0 && (
                  <p className="text-xs text-gray-500">
                    +{formatCurrency(difference)} ({differencePct.toFixed(1)}%) más caro que{' '}
                    {TRANSPORT_LABEL[cheapest.transport_type]}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-2">
                <Row label="Flete y cargos del consolidador" value={formatCurrency(Number(scenario.subtotal_consolidator))} />
                <Row label="Agente aduanero (sin ISV)" value={formatCurrency(Number(scenario.subtotal_customs_agent))} />
                {loadRows(scenario, quotation).map((row) => (
                  <Row key={row.label} label={row.label} value={row.value} />
                ))}
              </div>

              {canEdit && !isSelected && (
                <Button type="button" variant="secondary" disabled={isBusy} onClick={() => onSelect(scenario.transport_type)}>
                  Usar este modo
                </Button>
              )}
              {canEdit && isSelected && !quotation.scenario_chosen && (
                <Button type="button" variant="secondary" disabled={isBusy} onClick={() => onSelect(scenario.transport_type)}>
                  Confirmar este modo
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
